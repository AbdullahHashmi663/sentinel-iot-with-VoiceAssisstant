import os
import pandas as pd
import numpy as np
import torch
import torch.nn as nn
from torch.utils.data import TensorDataset, DataLoader
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, MinMaxScaler
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

# 1. Load the Dataset
dataset_path = r"c:\Users\User\Desktop\FYP_WORK\Train_Test_datasets\Train_Test_Network_dataset\train_test_network.csv"
print(f"Loading dataset from: {dataset_path}...")
df = pd.read_csv(dataset_path, low_memory=False)

# Convert Zeek dashes into NaNs
df.replace('-', np.nan, inplace=True)

print("Original Dataset Shape:", df.shape)

# ---------------------------------------------------------
# STRATEGY 1: DROP EMPTY COLUMNS (> 60% missing)
# ---------------------------------------------------------
missing_percentages = df.isnull().mean() * 100
threshold = 60.0
columns_to_drop = missing_percentages[missing_percentages > threshold].index
df.drop(columns=columns_to_drop, inplace=True)
print(f"Dropped {len(columns_to_drop)} empty columns: {list(columns_to_drop)}")

# Drop duplicates & remaining NaNs
df.drop_duplicates(inplace=True)
df.dropna(inplace=True)
print("Shape after dropping duplicates and NaNs:", df.shape)

# ---------------------------------------------------------
# STRATEGY 2: ISOLATE IDENTIFIERS (Metadata for Wazuh)
# ---------------------------------------------------------
# We extract routing info so EDR can block threats, but exclude them from model inputs.
identifiers = ['src_ip', 'dst_ip', 'src_port', 'dst_port']
metadata_df = df[identifiers].reset_index(drop=True)

# Save metadata for routing simulation
metadata_path = r"c:\Users\User\Desktop\FYP_WORK\network_routing_metadata.csv"
metadata_df.to_csv(metadata_path, index=False)
print(f"Saved routing metadata for Wazuh EDR to: {metadata_path}")

# Drop from feature DataFrame
df.drop(columns=identifiers, inplace=True, errors='ignore')

# ---------------------------------------------------------
# STRATEGY 3: TRANSLATE TEXT TO NUMBERS
# ---------------------------------------------------------
text_columns = df.select_dtypes(include=['object']).columns
print(f"Encoding text columns: {list(text_columns)}")

label_encoders = {}
for col in text_columns:
    if col != 'type': # We will encode 'type' separately as it is our multiclass label
        le = LabelEncoder()
        df[col] = le.fit_transform(df[col].astype(str))
        label_encoders[col] = le

# Encode multiclass label 'type'
type_encoder = LabelEncoder()
df['type'] = type_encoder.fit_transform(df['type'].astype(str))
num_classes = len(type_encoder.classes_)
print(f"Encoded {num_classes} attack types: {list(type_encoder.classes_)}")

# Split into features (X) and targets (y)
y_label = df['label'].reset_index(drop=True)
y_type = df['type'].reset_index(drop=True)
X_features = df.drop(columns=['label', 'type']).reset_index(drop=True)

# ---------------------------------------------------------
# STRATEGY 4: PREVENT DATA LEAKAGE (Scale on Time-Split)
# ---------------------------------------------------------
# Fit scaler only on first 80% of rows (simulating past training data) to prevent leakage
split_idx = int(0.8 * len(X_features))
scaler = MinMaxScaler()
scaler.fit(X_features.iloc[:split_idx])
X_scaled = pd.DataFrame(scaler.transform(X_features), columns=X_features.columns)

# Save the fitted scaler for live inference pipeline
scaler_path = r"c:\Users\User\Desktop\FYP_WORK\network_scaler.joblib"
joblib.dump(scaler, scaler_path)
print(f"Saved fitted scaler to: {scaler_path}")

# ---------------------------------------------------------
# STRATEGY 5: SEQUENCE GENERATION (Before Shuffling/Splitting)
# ---------------------------------------------------------
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

# Split sequences randomly into train and validation sets
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

# Build DataLoaders
batch_size = 256
train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True)
val_loader = DataLoader(val_dataset, batch_size=batch_size, shuffle=False)

# ---------------------------------------------------------
# Step 6: PYTORCH HYBRID DEEP LEARNING MODEL
# ---------------------------------------------------------
class SentinelModel(nn.Module):
    def __init__(self, num_features, sequence_length, num_classes):
        super().__init__()
        # Conv1d expects shape (batch, channels, seq_len)
        self.conv = nn.Conv1d(in_channels=num_features, out_channels=64, kernel_size=3, padding=1)
        self.pool = nn.MaxPool1d(kernel_size=2)
        
        # After Conv1D + MaxPool1D (seq_len 10 -> 5)
        # BiLSTM hidden size 64 -> outputs 128 channels (due to bidirectional)
        self.lstm = nn.LSTM(input_size=64, hidden_size=64, num_layers=1, batch_first=True, bidirectional=True)
        
        # Transformer MultiHeadAttention
        encoder_layer = nn.TransformerEncoderLayer(
            d_model=128, 
            nhead=4, 
            dim_feedforward=256, 
            dropout=0.2, 
            batch_first=True
        )
        self.transformer = nn.TransformerEncoder(encoder_layer, num_layers=1)
        
        self.fc = nn.Linear(128, 32)
        self.dropout = nn.Dropout(0.2)
        
        # Dual outputs
        self.binary_head = nn.Linear(32, 1)
        self.multiclass_head = nn.Linear(32, num_classes)
        
    def forward(self, x):
        # Input shape: (batch, seq_len, num_features)
        # Transpose for Conv1d: (batch, num_features, seq_len)
        x = x.transpose(1, 2)
        x = torch.relu(self.conv(x))
        x = self.pool(x)
        
        # Transpose back: (batch, seq_len/2, out_channels)
        x = x.transpose(1, 2)
        
        # LSTM (outputs batch, seq_len/2, 128)
        x, _ = self.lstm(x)
        
        # Transformer
        x = self.transformer(x)
        
        # Global Average Pooling over sequence length
        x = torch.mean(x, dim=1)
        
        # FC + Dropout
        x = torch.relu(self.fc(x))
        x = self.dropout(x)
        
        # Raw logits for heads
        bin_out = self.binary_head(x)
        mul_out = self.multiclass_head(x)
        return bin_out, mul_out

num_features = X_train_seq.shape[2]
model = SentinelModel(num_features, TIME_STEPS, num_classes).to(device)

# Standard loss functions without heavy class weight bias for stable gradients
criterion_bin = nn.BCEWithLogitsLoss()
criterion_mul = nn.CrossEntropyLoss()
optimizer = torch.optim.Adam(model.parameters(), lr=0.001)

# ---------------------------------------------------------
# Step 7: MODEL TRAINING
# ---------------------------------------------------------
print("\n--- STARTING TRAINING PROCESS ---")
epochs = 15
best_val_loss = float('inf')

for epoch in range(1, epochs + 1):
    model.train()
    train_loss = 0.0
    for batch_x, batch_y_bin, batch_y_mul in train_loader:
        batch_x, batch_y_bin, batch_y_mul = batch_x.to(device), batch_y_bin.to(device), batch_y_mul.to(device)
        
        optimizer.zero_grad()
        bin_pred, mul_pred = model(batch_x)
        
        loss_bin = criterion_bin(bin_pred, batch_y_bin)
        loss_mul = criterion_mul(mul_pred, batch_y_mul)
        
        # Combined loss
        loss = loss_bin + loss_mul
        loss.backward()
        optimizer.step()
        
        train_loss += loss.item() * batch_x.size(0)
        
    train_loss /= len(train_loader.dataset)
    
    # Validation Loop
    model.eval()
    val_loss = 0.0
    correct_bin = 0
    with torch.no_grad():
        for batch_x, batch_y_bin, batch_y_mul in val_loader:
            batch_x, batch_y_bin, batch_y_mul = batch_x.to(device), batch_y_bin.to(device), batch_y_mul.to(device)
            bin_pred, mul_pred = model(batch_x)
            
            loss_bin = criterion_bin(bin_pred, batch_y_bin)
            loss_mul = criterion_mul(mul_pred, batch_y_mul)
            val_loss += (loss_bin.item() + loss_mul.item()) * batch_x.size(0)
            
            # Accuracy metric
            bin_preds = (torch.sigmoid(bin_pred) >= 0.5).float()
            correct_bin += (bin_preds == batch_y_bin).sum().item()
            
    val_loss /= len(val_loader.dataset)
    val_acc = correct_bin / len(val_loader.dataset)
    
    print(f"Epoch {epoch}/{epochs} | Train Loss: {train_loss:.4f} | Val Loss: {val_loss:.4f} | Val Bin Acc: {val_acc:.4f}")
    
    # Save best weights
    if val_loss < best_val_loss:
        best_val_loss = val_loss
        torch.save(model.state_dict(), 'sentinel_iot_model.pth')
        print(" -> Saved new best model weights.")

# ---------------------------------------------------------
# Step 8: EVALUATION
# ---------------------------------------------------------
print("\n--- LOADING BEST MODEL FOR EVALUATION ---")
model.load_state_dict(torch.load('sentinel_iot_model.pth'))
model.eval()

all_y_bin_pred, all_y_bin_true = [], []
all_y_mul_pred, all_y_mul_true = [], []

with torch.no_grad():
    for batch_x, batch_y_bin, batch_y_mul in val_loader:
        batch_x = batch_x.to(device)
        bin_pred, mul_pred = model(batch_x)
        
        # Apply sigmoid to binary logits
        bin_probs = torch.sigmoid(bin_pred).cpu().numpy()
        bin_preds = (bin_probs >= 0.5).astype(int)
        
        # Argmax on multiclass logits
        mul_preds = torch.argmax(mul_pred, dim=1).cpu().numpy()
        
        all_y_bin_pred.extend(bin_preds.flatten())
        all_y_bin_true.extend(batch_y_bin.numpy().flatten())
        
        all_y_mul_pred.extend(mul_preds)
        all_y_mul_true.extend(batch_y_mul.numpy())

print("\n======================================================")
print("      ZERO-DAY DETECTION (BINARY) EVALUATION REPORT")
print("======================================================")
print(classification_report(all_y_bin_true, all_y_bin_pred, target_names=['Normal (0)', 'Attack (1)']))

print("\n======================================================")
print("   FORENSIC CLASSIFICATION (MULTICLASS) EVALUATION REPORT")
print("======================================================")
print(classification_report(all_y_mul_true, all_y_mul_pred, target_names=type_encoder.classes_))
