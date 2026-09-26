import os
import pandas as pd
import numpy as np
import torch
import torch.nn as nn
from torch.utils.data import TensorDataset, DataLoader
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics import classification_report
import joblib

# Set random seeds for reproducibility
np.random.seed(42)
torch.manual_seed(42)
if torch.cuda.is_available():
    torch.cuda.manual_seed_all(42)

# Set device
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Using device: {device}")

# Directories
output_dir = r"c:\Users\User\Desktop\FYP_WORK\cleaned_datasets"
scalers_dir = os.path.join(output_dir, "scalers")
models_dir = os.path.join(output_dir, "models")
os.makedirs(output_dir, exist_ok=True)
os.makedirs(scalers_dir, exist_ok=True)
os.makedirs(models_dir, exist_ok=True)

# File Paths
input_path = r"c:\Users\User\Desktop\FYP_WORK\Train_Test_datasets\Train_Test_IoT_dataset\Train_Test_IoT_GPS_Tracker.csv"
output_name = "cleaned_IoT_GPS_Tracker.csv"

# Load raw dataset
print("Loading GPS Tracker dataset...")
df = pd.read_csv(input_path, low_memory=False)
df.replace('-', np.nan, inplace=True)
df.drop_duplicates(inplace=True)
df.dropna(inplace=True)

# Clean numeric features
df['latitude'] = pd.to_numeric(df['latitude'], errors='coerce').fillna(0.0)
df['longitude'] = pd.to_numeric(df['longitude'], errors='coerce').fillna(0.0)

# ---------------------------------------------------------
# FEATURE ENGINEERING: ROLLING GEOGRAPHIC STATS
# ---------------------------------------------------------
print("Engineering rolling geographic features for coordinate sequences...")
# 5-step rolling statistics
df['lat_roll_mean_5'] = df['latitude'].rolling(window=5, min_periods=1).mean()
df['lat_roll_std_5'] = df['latitude'].rolling(window=5, min_periods=1).std().fillna(0.0)
df['lon_roll_mean_5'] = df['longitude'].rolling(window=5, min_periods=1).mean()
df['lon_roll_std_5'] = df['longitude'].rolling(window=5, min_periods=1).std().fillna(0.0)

# 10-step rolling statistics
df['lat_roll_mean_10'] = df['latitude'].rolling(window=10, min_periods=1).mean()
df['lat_roll_std_10'] = df['latitude'].rolling(window=10, min_periods=1).std().fillna(0.0)
df['lon_roll_mean_10'] = df['longitude'].rolling(window=10, min_periods=1).mean()
df['lon_roll_std_10'] = df['longitude'].rolling(window=10, min_periods=1).std().fillna(0.0)

# Differences (velocities/acceleration proxies)
df['lat_diff_1'] = df['latitude'].diff().fillna(0.0)
df['lat_diff_2'] = df['latitude'].diff(periods=2).fillna(0.0)
df['lon_diff_1'] = df['longitude'].diff().fillna(0.0)
df['lon_diff_2'] = df['longitude'].diff(periods=2).fillna(0.0)

# Drop timestamps
df.drop(columns=['date', 'time'], errors='ignore', inplace=True)

# Encode targets
from sklearn.preprocessing import LabelEncoder
type_encoder = LabelEncoder()
df['type'] = type_encoder.fit_transform(df['type'].astype(str))
num_classes = len(type_encoder.classes_)

# Oversampling to balance classes
print("Balancing classes via oversampling...")
max_class_size = df['type'].value_counts().max()
resampled_classes = []
for class_type, group in df.groupby('type'):
    if len(group) < max_class_size:
        upsampled = group.sample(max_class_size, replace=True, random_state=42)
        resampled_classes.append(upsampled)
    else:
        resampled_classes.append(group)
        
df_balanced = pd.concat(resampled_classes).reset_index(drop=True)
print(f"Balanced size: {df_balanced.shape}")

y_bin = df_balanced['label'].values
y_mul = df_balanced['type'].values
X_feats = df_balanced.drop(columns=['label', 'type']).reset_index(drop=True)

# Scaling (Leakage-Free)
split_idx = int(0.8 * len(X_feats))
scaler = MinMaxScaler()
scaler.fit(X_feats.iloc[:split_idx])
X_scaled = pd.DataFrame(scaler.transform(X_feats), columns=X_feats.columns)

# Save scaler and cleaned balanced dataset
scaler_save_path = os.path.join(scalers_dir, f"scaler_{output_name.replace('.csv', '.joblib')}")
joblib.dump(scaler, scaler_save_path)

cleaned_df = pd.concat([X_scaled, pd.Series(y_bin, name='label'), pd.Series(y_mul, name='type')], axis=1)
final_out_path = os.path.join(output_dir, output_name)
cleaned_df.to_csv(final_out_path, index=False)
print("Scaler and Cleaned CSV saved.")

# Generate sequences
def create_sequences(X, y_bin, y_mul, time_steps=10):
    Xs, y_bins, y_muls = [], [], []
    for i in range(len(X) - time_steps):
        Xs.append(X.iloc[i:(i + time_steps)].values)
        y_bins.append(y_bin[i + time_steps])
        y_muls.append(y_mul[i + time_steps])
    return np.array(Xs, dtype=np.float32), np.array(y_bins, dtype=np.float32), np.array(y_muls, dtype=np.int64)

TIME_STEPS = 10
X_seq, y_bin_seq, y_mul_seq = create_sequences(X_scaled, y_bin, y_mul, TIME_STEPS)

# Train/Val Split
X_train, X_val, y_bin_train, y_bin_val, y_mul_train, y_mul_val = train_test_split(
    X_seq, y_bin_seq, y_mul_seq, 
    test_size=0.2, 
    random_state=42, 
    stratify=y_bin_seq
)

train_dataset = TensorDataset(
    torch.tensor(X_train), 
    torch.tensor(y_bin_train).unsqueeze(1), 
    torch.tensor(y_mul_train)
)
val_dataset = TensorDataset(
    torch.tensor(X_val), 
    torch.tensor(y_bin_val).unsqueeze(1), 
    torch.tensor(y_mul_val)
)

train_loader = DataLoader(train_dataset, batch_size=256, shuffle=True)
val_loader = DataLoader(val_dataset, batch_size=256, shuffle=False)

# Conformer Sentinel Model (2 layers, d_model=128)
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
        self.depthwise = nn.Conv1d(
            in_channels=d_model, 
            out_channels=d_model, 
            kernel_size=kernel_size, 
            padding=(kernel_size - 1) // 2, 
            groups=d_model
        )
        self.pointwise = nn.Conv1d(
            in_channels=d_model, 
            out_channels=d_model, 
            kernel_size=1
        )
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

# Training
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

best_val_loss = float('inf')
model_save_path = os.path.join(models_dir, f"sentinel_{output_name.replace('.csv', '.pth')}")

print("\n--- STARTING TRAINING ON UPGRADED GPS TRACKER CONFORMER ---")
epochs = 20
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
    
    if val_loss < best_val_loss:
        best_val_loss = val_loss
        torch.save(model.state_dict(), model_save_path)
        
    print(f"Epoch {epoch}/{epochs} | Train Loss: {train_loss:.4f} | Val Loss: {val_loss:.4f} | Val Bin Acc: {val_acc_bin:.4f} | Val Mul Acc: {val_acc_mul:.4f}")

# Final Evaluation
model.load_state_dict(torch.load(model_save_path))
model.eval()

all_y_bin_pred, all_y_bin_true = [], []
all_y_mul_pred, all_y_mul_true = [], []

with torch.no_grad():
    for batch_x, batch_y_bin, batch_y_mul in val_loader:
        batch_x = batch_x.to(device)
        bin_pred, mul_pred = model(batch_x)
        
        bin_probs = torch.sigmoid(bin_pred).cpu().numpy()
        bin_preds = (bin_probs >= 0.5).astype(int)
        mul_preds = torch.argmax(mul_pred, dim=1).cpu().numpy()
        
        all_y_bin_pred.extend(bin_preds.flatten())
        all_y_bin_true.extend(batch_y_bin.numpy().flatten())
        all_y_mul_pred.extend(mul_preds)
        all_y_mul_true.extend(batch_y_mul.numpy())
        
bin_report = classification_report(all_y_bin_true, all_y_bin_pred, zero_division=0)
mul_report = classification_report(all_y_mul_true, all_y_mul_pred, target_names=type_encoder.classes_, zero_division=0)

eval_log_path = os.path.join(models_dir, f"evaluation_{output_name.replace('.csv', '.txt')}")
with open(eval_log_path, "w") as f:
    f.write("=== EVALUATION REPORT FOR IoT GPS Tracker (UPGRADED WITH ROLLING GEOGRAPHIC STATS) ===\n\n")
    f.write("--- ZERO-DAY DETECTION (BINARY) ---\n")
    f.write(bin_report)
    f.write("\n\n--- FORENSIC ATTACK CLASSIFICATION (MULTICLASS) ---\n")
    f.write(mul_report)

print("Evaluation report saved successfully.")
