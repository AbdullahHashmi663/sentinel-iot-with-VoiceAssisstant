import os
import pandas as pd
import numpy as np
import torch
import torch.nn as nn
from torch.utils.data import TensorDataset, DataLoader
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, MinMaxScaler

# Set random seeds for reproducibility
np.random.seed(42)
torch.manual_seed(42)

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Using device: {device}")

# 1. Load a tiny subset of the dataset
dataset_path = r"c:\Users\User\Desktop\FYP_WORK\Train_Test_datasets\Train_Test_Network_dataset\train_test_network.csv"
print("Loading a subset of dataset...")
df = pd.read_csv(dataset_path, nrows=10000, low_memory=False)

df.replace('-', np.nan, inplace=True)
df.drop_duplicates(inplace=True)
df.dropna(axis=1, thresh=int(0.4 * len(df)), inplace=True) # drop empty cols
df.dropna(inplace=True)

identifiers = ['src_ip', 'dst_ip', 'src_port', 'dst_port']
df.drop(columns=identifiers, inplace=True, errors='ignore')

text_columns = df.select_dtypes(include=['object']).columns
for col in text_columns:
    if col != 'type':
        le = LabelEncoder()
        df[col] = le.fit_transform(df[col].astype(str))

type_encoder = LabelEncoder()
df['type'] = type_encoder.fit_transform(df['type'].astype(str))
num_classes = len(type_encoder.classes_)

y_label = df['label'].reset_index(drop=True)
y_type = df['type'].reset_index(drop=True)
X_features = df.drop(columns=['label', 'type']).reset_index(drop=True)

# Split and Scale
X_train_raw, X_val_raw, y_bin_train, y_bin_val, y_mul_train, y_mul_val = train_test_split(
    X_features, y_label, y_type, test_size=0.2, random_state=42, stratify=y_label
)

scaler = MinMaxScaler()
X_train_scaled = pd.DataFrame(scaler.fit_transform(X_train_raw), columns=X_features.columns)
X_val_scaled = pd.DataFrame(scaler.transform(X_val_raw), columns=X_features.columns)

def create_sequences(X, y_bin, y_mul, time_steps=10):
    Xs, y_bins, y_muls = [], [], []
    for i in range(len(X) - time_steps):
        Xs.append(X.iloc[i:(i + time_steps)].values)
        y_bins.append(y_bin.iloc[i + time_steps])
        y_muls.append(y_mul.iloc[i + time_steps])
    return np.array(Xs, dtype=np.float32), np.array(y_bins, dtype=np.float32), np.array(y_muls, dtype=np.int64)

TIME_STEPS = 10
X_train_seq, y_bin_train_seq, y_mul_train_seq = create_sequences(X_train_scaled, y_bin_train, y_mul_train, TIME_STEPS)

train_dataset = TensorDataset(
    torch.tensor(X_train_seq), 
    torch.tensor(y_bin_train_seq).unsqueeze(1), 
    torch.tensor(y_mul_train_seq)
)
train_loader = DataLoader(train_dataset, batch_size=64, shuffle=True)

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

print("\n--- DEBUG TRAINING START ---")
for epoch in range(1, 21):
    model.train()
    total_loss = 0.0
    grad_norm = 0.0
    for batch_x, batch_y_bin, batch_y_mul in train_loader:
        batch_x, batch_y_bin, batch_y_mul = batch_x.to(device), batch_y_bin.to(device), batch_y_mul.to(device)
        
        optimizer.zero_grad()
        bin_pred, mul_pred = model(batch_x)
        
        loss_bin = criterion_bin(bin_pred, batch_y_bin)
        loss_mul = criterion_mul(mul_pred, batch_y_mul)
        loss = loss_bin + loss_mul
        
        loss.backward()
        
        # Calculate gradient norm to check for vanishing/exploding gradients
        total_norm = 0.0
        for p in model.parameters():
            if p.grad is not None:
                param_norm = p.grad.data.norm(2)
                total_norm += param_norm.item() ** 2
        total_norm = total_norm ** 0.5
        grad_norm += total_norm
        
        optimizer.step()
        total_loss += loss.item()
        
    print(f"Epoch {epoch} | Loss: {total_loss/len(train_loader):.4f} | Avg Grad Norm: {grad_norm/len(train_loader):.4f}")
