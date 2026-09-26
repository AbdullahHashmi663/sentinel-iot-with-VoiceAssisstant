import pandas as pd
import numpy as np
import torch
import torch.nn as nn
from torch.utils.data import TensorDataset, DataLoader
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, MinMaxScaler
from sklearn.metrics import classification_report

# Set random seeds for reproducibility
np.random.seed(42)
torch.manual_seed(42)

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Using device: {device}")

# 1. Load the original raw Fridge dataset
dataset_path = r"c:\Users\User\Desktop\FYP_WORK\Train_Test_datasets\Train_Test_IoT_dataset\Train_Test_IoT_Fridge.csv"
print("Loading original Fridge dataset...")
df = pd.read_csv(dataset_path, low_memory=False)

df.replace('-', np.nan, inplace=True)
df.drop_duplicates(inplace=True)
df.dropna(inplace=True)

# Encode temp_condition first to calculate rolling stats on it
le_cond = LabelEncoder()
df['temp_condition'] = le_cond.fit_transform(df['temp_condition'].astype(str))

# ---------------------------------------------------------
# FEATURE ENGINEERING: ROLLING STATS TO EXPAND THE SPACE!
# ---------------------------------------------------------
print("Engineering rolling features...")
# Rolling metrics on temperature
df['temp_roll_mean_5'] = df['fridge_temperature'].rolling(window=5, min_periods=1).mean()
df['temp_roll_std_5'] = df['fridge_temperature'].rolling(window=5, min_periods=1).std().fillna(0)
df['temp_roll_mean_10'] = df['fridge_temperature'].rolling(window=10, min_periods=1).mean()
df['temp_roll_std_10'] = df['fridge_temperature'].rolling(window=10, min_periods=1).std().fillna(0)

# Temperature delta (rate of change)
df['temp_diff_1'] = df['fridge_temperature'].diff().fillna(0)
df['temp_diff_2'] = df['fridge_temperature'].diff(periods=2).fillna(0)

# State oscillation rate (how often does the condition toggle between high/low/normal)
df['cond_change_5'] = df['temp_condition'].diff().ne(0).rolling(window=5, min_periods=1).sum()
df['cond_change_10'] = df['temp_condition'].diff().ne(0).rolling(window=10, min_periods=1).sum()

# Drop timestamp identifiers
df.drop(columns=['date', 'time'], inplace=True, errors='ignore')

# Encode targets
type_encoder = LabelEncoder()
df['type'] = type_encoder.fit_transform(df['type'].astype(str))
num_classes = len(type_encoder.classes_)

# Balance classes on the training DataFrame via oversampling
print("Balancing classes...")
max_size = df['type'].value_counts().max()
resampled = []
for type_val, group in df.groupby('type'):
    if len(group) < max_size:
        resampled.append(group.sample(max_size, replace=True, random_state=42))
    else:
        resampled.append(group)
df_balanced = pd.concat(resampled).reset_index(drop=True)

y_bin = df_balanced['label'].values
y_mul = df_balanced['type'].values
X_feats = df_balanced.drop(columns=['label', 'type'])

# Scaling
split_idx = int(0.8 * len(X_feats))
scaler = MinMaxScaler()
scaler.fit(X_feats.iloc[:split_idx])
X_scaled = pd.DataFrame(scaler.transform(X_feats), columns=X_feats.columns)

# Sequence Generation
def create_sequences(X, y_bin, y_mul, time_steps=10):
    Xs, y_bins, y_muls = [], [], []
    for i in range(len(X) - time_steps):
        Xs.append(X.iloc[i:(i + time_steps)].values)
        y_bins.append(y_bin[i + time_steps])
        y_muls.append(y_mul[i + time_steps])
    return np.array(Xs, dtype=np.float32), np.array(y_bins, dtype=np.float32), np.array(y_muls, dtype=np.int64)

TIME_STEPS = 10
X_seq, y_bin_seq, y_mul_seq = create_sequences(X_scaled, y_bin, y_mul, TIME_STEPS)

# Split sequences
X_train, X_val, y_bin_train, y_bin_val, y_mul_train, y_mul_val = train_test_split(
    X_seq, y_bin_seq, y_mul_seq, test_size=0.2, random_state=42, stratify=y_bin_seq
)

train_dataset = TensorDataset(torch.tensor(X_train), torch.tensor(y_bin_train).unsqueeze(1), torch.tensor(y_mul_train))
val_dataset = TensorDataset(torch.tensor(X_val), torch.tensor(y_bin_val).unsqueeze(1), torch.tensor(y_mul_val))

train_loader = DataLoader(train_dataset, batch_size=256, shuffle=True)
val_loader = DataLoader(val_dataset, batch_size=256, shuffle=False)

# Conformer Model Architecture
class FeedForwardModule(nn.Module):
    def __init__(self, d_model, expansion_factor=4, dropout=0.1):
        super().__init__()
        self.ln = nn.LayerNorm(d_model)
        self.w_1 = nn.Linear(d_model, d_model * expansion_factor)
        self.w_2 = nn.Linear(d_model * expansion_factor, d_model)
        self.dropout = nn.Dropout(dropout)
        self.act = nn.SiLU()

    def forward(self, x):
        residual = x
        x = self.ln(x)
        x = self.w_1(x)
        x = self.act(x)
        x = self.dropout(x)
        x = self.w_2(x)
        x = self.dropout(x)
        return residual + 0.5 * x

class ConformerConvModule(nn.Module):
    def __init__(self, d_model, kernel_size=3, dropout=0.1):
        super().__init__()
        self.ln = nn.LayerNorm(d_model)
        self.depthwise = nn.Conv1d(in_channels=d_model, out_channels=d_model, kernel_size=kernel_size, padding=(kernel_size - 1) // 2, groups=d_model)
        self.pointwise = nn.Conv1d(in_channels=d_model, out_channels=d_model, kernel_size=1)
        self.batch_norm = nn.BatchNorm1d(d_model)
        self.act = nn.SiLU()
        self.dropout = nn.Dropout(dropout)

    def forward(self, x):
        residual = x
        x = self.ln(x)
        x = x.transpose(1, 2)
        x = self.depthwise(x)
        x = self.batch_norm(x)
        x = self.act(x)
        x = self.pointwise(x)
        x = self.dropout(x)
        x = x.transpose(1, 2)
        return residual + x

class ConformerBlock(nn.Module):
    def __init__(self, d_model, nhead=4, kernel_size=3, dropout=0.1):
        super().__init__()
        self.ff1 = FeedForwardModule(d_model, dropout=dropout)
        self.attn = nn.MultiheadAttention(embed_dim=d_model, num_heads=nhead, dropout=dropout, batch_first=True)
        self.attn_ln = nn.LayerNorm(d_model)
        self.conv = ConformerConvModule(d_model, kernel_size=kernel_size, dropout=dropout)
        self.ff2 = FeedForwardModule(d_model, dropout=dropout)
        self.post_ln = nn.LayerNorm(d_model)

    def forward(self, x):
        x = self.ff1(x)
        residual = x
        x_ln = self.attn_ln(x)
        attn_out, _ = self.attn(x_ln, x_ln, x_ln)
        x = residual + attn_out
        x = self.conv(x)
        x = self.ff2(x)
        x = self.post_ln(x)
        return x

class ConformerSentinelModel(nn.Module):
    def __init__(self, num_features, d_model=128, nhead=4, num_classes=10, num_layers=2):
        super().__init__()
        self.input_projection = nn.Linear(num_features, d_model)
        self.conformers = nn.ModuleList([
            ConformerBlock(d_model=d_model, nhead=nhead, kernel_size=3, dropout=0.1)
            for _ in range(num_layers)
        ])
        self.fc = nn.Linear(d_model, 64)
        self.dropout = nn.Dropout(0.2)
        self.binary_head = nn.Linear(64, 1)
        self.multiclass_head = nn.Linear(64, num_classes)

    def forward(self, x):
        x = self.input_projection(x)
        for layer in self.conformers:
            x = layer(x)
        x = torch.mean(x, dim=1)
        x = torch.relu(self.fc(x))
        x = self.dropout(x)
        bin_out = self.binary_head(x)
        mul_out = self.multiclass_head(x)
        return bin_out, mul_out

num_features = X_train.shape[2]
model = ConformerSentinelModel(
    num_features=num_features, 
    d_model=128, 
    nhead=4, 
    num_classes=num_classes,
    num_layers=2
).to(device)

criterion_bin = nn.BCEWithLogitsLoss()
criterion_mul = nn.CrossEntropyLoss()
optimizer = torch.optim.AdamW(model.parameters(), lr=0.0005, weight_decay=1e-4)

print("\n--- STARTING TRAINING (FEATURE-ENGINEERED CONFORMER) ---")
epochs = 15
for epoch in range(1, epochs + 1):
    model.train()
    train_loss = 0.0
    for batch_x, batch_y_bin, batch_y_mul in train_loader:
        batch_x, batch_y_bin, batch_y_mul = batch_x.to(device), batch_y_bin.to(device), batch_y_mul.to(device)
        optimizer.zero_grad()
        bin_pred, mul_pred = model(batch_x)
        loss = criterion_bin(bin_pred, batch_y_bin) + criterion_mul(mul_pred, batch_y_mul)
        loss.backward()
        optimizer.step()
        train_loss += loss.item() * batch_x.size(0)
    
    train_loss /= len(train_loader.dataset)
    
    # Val
    model.eval()
    val_loss = 0.0
    correct_bin = 0
    correct_mul = 0
    with torch.no_grad():
        for batch_x, batch_y_bin, batch_y_mul in val_loader:
            batch_x, batch_y_bin, batch_y_mul = batch_x.to(device), batch_y_bin.to(device), batch_y_mul.to(device)
            bin_pred, mul_pred = model(batch_x)
            loss_bin = criterion_bin(bin_pred, batch_y_bin)
            loss_mul = criterion_mul(mul_pred, batch_y_mul)
            val_loss += (loss_bin.item() + loss_mul.item()) * batch_x.size(0)
            
            bin_preds = (torch.sigmoid(bin_pred) >= 0.5).float()
            correct_bin += (bin_preds == batch_y_bin).sum().item()
            
            mul_preds = torch.argmax(mul_pred, dim=1)
            correct_mul += (mul_preds == batch_y_mul).sum().item()
            
    val_loss /= len(val_loader.dataset)
    val_acc_bin = correct_bin / len(val_loader.dataset)
    val_acc_mul = correct_mul / len(val_loader.dataset)
    print(f"Epoch {epoch} | Train Loss: {train_loss:.4f} | Val Loss: {val_loss:.4f} | Val Bin Acc: {val_acc_bin:.4f} | Val Mul Acc: {val_acc_mul:.4f}")
