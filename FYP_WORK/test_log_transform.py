import os
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

# 1. Load the dataset
dataset_path = r"c:\Users\User\Desktop\FYP_WORK\Train_Test_datasets\Train_Test_Network_dataset\train_test_network.csv"
print("Loading dataset...")
df = pd.read_csv(dataset_path, low_memory=False)

df.replace('-', np.nan, inplace=True)
df.drop_duplicates(inplace=True)
df.dropna(axis=1, thresh=int(0.4 * len(df)), inplace=True) # drop empty cols
df.dropna(inplace=True)

identifiers = ['src_ip', 'dst_ip', 'src_port', 'dst_port']
df.drop(columns=identifiers, inplace=True, errors='ignore')

# Highly skewed network columns to log-transform
log_cols = [
    'duration', 'src_bytes', 'dst_bytes', 'src_pkts', 'dst_pkts', 
    'src_ip_bytes', 'dst_ip_bytes', 'missed_bytes',
    'http_request_body_len', 'http_response_body_len'
]

# Apply log1p transform on existing numerical features
for col in log_cols:
    if col in df.columns:
        df[col] = np.log1p(df[col].astype(float))

text_columns = df.select_dtypes(include=['object']).columns
for col in text_columns:
    if col != 'type':
        le = LabelEncoder()
        df[col] = le.fit_transform(df[col].astype(str))

type_encoder = LabelEncoder()
df['type'] = type_encoder.fit_transform(df['type'].astype(str))
num_classes = len(type_encoder.classes_)

# Sample 30,000 rows randomly to speed up debugging
df_sample = df.sample(n=30000, random_state=42).reset_index(drop=True)

y_label = df_sample['label'].reset_index(drop=True)
y_type = df_sample['type'].reset_index(drop=True)
X_features = df_sample.drop(columns=['label', 'type']).reset_index(drop=True)

# Split indices for scaling (first 80% for training fit)
split_idx = int(0.8 * len(X_features))

# Fit scaler only on training partition to prevent leakage
scaler = MinMaxScaler()
scaler.fit(X_features.iloc[:split_idx])
X_scaled = pd.DataFrame(scaler.transform(X_features), columns=X_features.columns)

# Generate sequences on the ordered scaled dataset
def create_sequences(X, y_bin, y_mul, time_steps=10):
    Xs, y_bins, y_muls = [], [], []
    for i in range(len(X) - time_steps):
        Xs.append(X.iloc[i:(i + time_steps)].values)
        y_bins.append(y_bin[i + time_steps])
        y_muls.append(y_mul[i + time_steps])
    return np.array(Xs, dtype=np.float32), np.array(y_bins, dtype=np.float32), np.array(y_muls, dtype=np.int64)

TIME_STEPS = 10
print(f"Generating sequences of length {TIME_STEPS}...")
X_seq, y_bin_seq, y_mul_seq = create_sequences(X_scaled, y_label.values, y_type.values, TIME_STEPS)

# Now randomly split the 3D sequences into Train and Val sets
X_train_seq, X_val_seq, y_bin_train_seq, y_bin_val_seq, y_mul_train_seq, y_mul_val_seq = train_test_split(
    X_seq, y_bin_seq, y_mul_seq, 
    test_size=0.2, 
    random_state=42, 
    stratify=y_bin_seq
)

print(f"Train sequence shape: {X_train_seq.shape}")
print(f"Val sequence shape: {X_val_seq.shape}")

# Convert to PyTorch Tensors
train_dataset = TensorDataset(
    torch.tensor(X_train_seq), 
    torch.tensor(y_bin_train_seq).unsqueeze(1), 
    torch.tensor(y_mul_train_seq)
)
val_dataset = TensorDataset(
    torch.tensor(X_val_seq), 
    torch.tensor(y_bin_val_seq).unsqueeze(1), 
    torch.tensor(y_mul_val_seq)
)

train_loader = DataLoader(train_dataset, batch_size=128, shuffle=True)
val_loader = DataLoader(val_dataset, batch_size=128, shuffle=False)

class SentinelModel(nn.Module):
    def __init__(self, num_features, num_classes):
        super().__init__()
        self.conv = nn.Conv1d(in_channels=num_features, out_channels=64, kernel_size=3, padding=1)
        self.pool = nn.MaxPool1d(kernel_size=2)
        self.lstm = nn.LSTM(input_size=64, hidden_size=64, num_layers=1, batch_first=True, bidirectional=True)
        encoder_layer = nn.TransformerEncoderLayer(d_model=128, nhead=4, dim_feedforward=256, dropout=0.2, batch_first=True)
        self.transformer = nn.TransformerEncoder(encoder_layer, num_layers=1)
        self.fc = nn.Linear(128, 32)
        self.dropout = nn.Dropout(0.2)
        self.binary_head = nn.Linear(32, 1)
        self.multiclass_head = nn.Linear(32, num_classes)
        
    def forward(self, x):
        x = x.transpose(1, 2)
        x = torch.relu(self.conv(x))
        x = self.pool(x)
        x = x.transpose(1, 2)
        x, _ = self.lstm(x)
        x = self.transformer(x)
        x = torch.mean(x, dim=1)
        x = torch.relu(self.fc(x))
        x = self.dropout(x)
        bin_out = self.binary_head(x)
        mul_out = self.multiclass_head(x)
        return bin_out, mul_out

model = SentinelModel(X_train_seq.shape[2], num_classes).to(device)

criterion_bin = nn.BCEWithLogitsLoss()
criterion_mul = nn.CrossEntropyLoss()
optimizer = torch.optim.Adam(model.parameters(), lr=0.001)

print("\n--- BASELINE TRAINING START (LOG-TRANSFORMED) ---")
for epoch in range(1, 11):
    model.train()
    total_loss = 0.0
    for batch_x, batch_y_bin, batch_y_mul in train_loader:
        batch_x, batch_y_bin, batch_y_mul = batch_x.to(device), batch_y_bin.to(device), batch_y_mul.to(device)
        
        optimizer.zero_grad()
        bin_pred, mul_pred = model(batch_x)
        
        loss_bin = criterion_bin(bin_pred, batch_y_bin)
        loss_mul = criterion_mul(mul_pred, batch_y_mul)
        loss = loss_bin + loss_mul
        
        loss.backward()
        optimizer.step()
        total_loss += loss.item()
        
    model.eval()
    val_loss = 0.0
    all_y_bin_pred, all_y_bin_true = [], []
    with torch.no_grad():
        for batch_x, batch_y_bin, batch_y_mul in val_loader:
            batch_x, batch_y_bin, batch_y_mul = batch_x.to(device), batch_y_bin.to(device), batch_y_mul.to(device)
            bin_pred, mul_pred = model(batch_x)
            
            loss_bin = criterion_bin(bin_pred, batch_y_bin)
            loss_mul = criterion_mul(mul_pred, batch_y_mul)
            val_loss += (loss_bin.item() + loss_mul.item()) * batch_x.size(0)
            
            bin_probs = torch.sigmoid(bin_pred).cpu().numpy()
            bin_preds = (bin_probs >= 0.5).astype(int)
            all_y_bin_pred.extend(bin_preds.flatten())
            all_y_bin_true.extend(batch_y_bin.cpu().numpy().flatten())
            
    val_loss /= len(val_loader.dataset)
    acc = np.mean(np.array(all_y_bin_pred) == np.array(all_y_bin_true))
    print(f"Epoch {epoch} | Train Loss: {total_loss/len(train_loader):.4f} | Val Loss: {val_loss:.4f} | Val Bin Acc: {acc:.4f}")
