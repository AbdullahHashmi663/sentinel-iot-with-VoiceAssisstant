import os
import pandas as pd
import numpy as np
import torch
import torch.nn as nn
from torch.utils.data import TensorDataset, DataLoader
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

# Set device
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

cleaned_dir = r"c:\Users\User\Desktop\FYP_WORK\cleaned_datasets"
models_dir = os.path.join(cleaned_dir, "models")

# Conformer Architecture
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
        self.depthwise = nn.Conv1d(d_model, d_model, kernel_size, padding=(kernel_size - 1) // 2, groups=d_model)
        self.pointwise = nn.Conv1d(d_model, d_model, kernel_size=1)
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

def create_sequences(X, y_bin, y_mul, time_steps=10):
    Xs, y_bins, y_muls = [], [], []
    for i in range(len(X) - time_steps):
        Xs.append(X.iloc[i:(i + time_steps)].values)
        y_bins.append(y_bin[i + time_steps])
        y_muls.append(y_mul[i + time_steps])
    return np.array(Xs, dtype=np.float32), np.array(y_bins, dtype=np.float32), np.array(y_muls, dtype=np.int64)

TIME_STEPS = 10

# Evaluate Modbus
df = pd.read_csv(os.path.join(cleaned_dir, "cleaned_IoT_Modbus.csv"))
y_bin = df['label'].values
y_mul = df['type'].values
X_feats = df.drop(columns=['label', 'type'])

X_seq, y_bin_seq, y_mul_seq = create_sequences(X_feats, y_bin, y_mul, TIME_STEPS)
_, X_val, _, y_bin_val, _, y_mul_val = train_test_split(
    X_seq, y_bin_seq, y_mul_seq, test_size=0.2, random_state=42, stratify=y_bin_seq
)

val_dataset = TensorDataset(torch.tensor(X_val), torch.tensor(y_bin_val).unsqueeze(1), torch.tensor(y_mul_val))
val_loader = DataLoader(val_dataset, batch_size=256, shuffle=False)

num_features = X_val.shape[2]
num_classes = len(np.unique(y_mul))

model = ConformerSentinelModel(num_features, d_model=128, nhead=4, num_classes=num_classes, num_layers=2).to(device)
model.load_state_dict(torch.load(os.path.join(models_dir, "sentinel_cleaned_IoT_Modbus.pth")))
model.eval()

preds = []
with torch.no_grad():
    for batch_x, _, _ in val_loader:
        batch_x = batch_x.to(device)
        _, mul_out = model(batch_x)
        preds.extend(torch.argmax(mul_out, dim=1).cpu().numpy())

acc = accuracy_score(y_mul_val, preds)
print(f"Modbus raw validation accuracy (no noise, no scaling): {acc:.4f}")
