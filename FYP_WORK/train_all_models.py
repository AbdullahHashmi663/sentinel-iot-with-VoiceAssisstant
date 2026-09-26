import os
import pandas as pd
import numpy as np
import torch
import torch.nn as nn
from torch.utils.data import TensorDataset, DataLoader
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report

# Set random seeds for reproducibility
np.random.seed(42)
torch.manual_seed(42)
if torch.cuda.is_available():
    torch.cuda.manual_seed_all(42)

# Set device
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Using device: {device}")

# Directories
cleaned_dir = r"c:\Users\User\Desktop\FYP_WORK\cleaned_datasets"
models_dir = os.path.join(cleaned_dir, "models")
os.makedirs(models_dir, exist_ok=True)

# List of cleaned files to train
cleaned_files = [
    "cleaned_IoT_Fridge.csv",
    "cleaned_IoT_GPS_Tracker.csv",
    "cleaned_IoT_Garage_Door.csv",
    "cleaned_IoT_Modbus.csv",
    "cleaned_IoT_Motion_Light.csv",
    "cleaned_IoT_Thermostat.csv",
    "cleaned_IoT_Weather.csv",
    "cleaned_Linux_process.csv",
    "cleaned_Linux_disk.csv",
    "cleaned_Linux_memory.csv",
    "cleaned_Windows_10.csv",
    "cleaned_Windows_7.csv"
]

# PyTorch Model Architecture definition
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

def create_sequences(X, y_bin, y_mul, time_steps=10):
    Xs, y_bins, y_muls = [], [], []
    for i in range(len(X) - time_steps):
        Xs.append(X.iloc[i:(i + time_steps)].values)
        y_bins.append(y_bin[i + time_steps])
        y_muls.append(y_mul[i + time_steps])
    return np.array(Xs, dtype=np.float32), np.array(y_bins, dtype=np.float32), np.array(y_muls, dtype=np.int64)

TIME_STEPS = 10
epochs = 12  # Clean run length for each model

for idx, file_name in enumerate(cleaned_files, 1):
    file_path = os.path.join(cleaned_dir, file_name)
    print(f"\n==================================================")
    print(f"[{idx}/{len(cleaned_files)}] Training Model on: {file_name}")
    print(f"==================================================")
    
    if not os.path.exists(file_path):
        print(f"Warning: File not found at {file_path}. Skipping.")
        continue
        
    # Load dataset
    df = pd.read_csv(file_path, low_memory=False)
    
    # Separate targets
    y_bin = df['label'].values
    y_mul = df['type'].values
    X_feats = df.drop(columns=['label', 'type'])
    
    num_features = X_feats.shape[1]
    num_classes = len(np.unique(y_mul))
    
    # Generate sequential time series
    X_seq, y_bin_seq, y_mul_seq = create_sequences(X_feats, y_bin, y_mul, TIME_STEPS)
    
    # Stratified sequence splitting
    X_train, X_val, y_bin_train, y_bin_val, y_mul_train, y_mul_val = train_test_split(
        X_seq, y_bin_seq, y_mul_seq, 
        test_size=0.2, 
        random_state=42, 
        stratify=y_bin_seq
    )
    
    # Datasets & loaders
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
    
    # Model definition
    model = SentinelModel(num_features, TIME_STEPS, num_classes).to(device)
    criterion_bin = nn.BCEWithLogitsLoss()
    criterion_mul = nn.CrossEntropyLoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=0.001)
    
    best_val_loss = float('inf')
    model_save_path = os.path.join(models_dir, f"sentinel_{file_name.replace('.csv', '.pth')}")
    
    # Training epochs
    for epoch in range(1, epochs + 1):
        model.train()
        train_loss = 0.0
        for batch_x, batch_y_bin, batch_y_mul in train_loader:
            batch_x, batch_y_bin, batch_y_mul = batch_x.to(device), batch_y_bin.to(device), batch_y_mul.to(device)
            
            optimizer.zero_grad()
            bin_pred, mul_pred = model(batch_x)
            
            loss_bin = criterion_bin(bin_pred, batch_y_bin)
            loss_mul = criterion_mul(mul_pred, batch_y_mul)
            loss = loss_bin + loss_mul
            
            loss.backward()
            optimizer.step()
            train_loss += loss.item() * batch_x.size(0)
            
        train_loss /= len(train_loader.dataset)
        
        # Validation
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
                
                bin_preds = (torch.sigmoid(bin_pred) >= 0.5).float()
                correct_bin += (bin_preds == batch_y_bin).sum().item()
                
        val_loss /= len(val_loader.dataset)
        val_acc = correct_bin / len(val_loader.dataset)
        
        # Save best validation loss weights
        if val_loss < best_val_loss:
            best_val_loss = val_loss
            torch.save(model.state_dict(), model_save_path)
            
        print(f"Epoch {epoch}/{epochs} | Train Loss: {train_loss:.4f} | Val Loss: {val_loss:.4f} | Val Bin Acc: {val_acc:.4f}")
        
    print(f"Model successfully saved to: {model_save_path}")
    
    # Load best weights for final evaluation report
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
            
    eval_log_path = os.path.join(models_dir, f"evaluation_{file_name.replace('.csv', '.txt')}")
    
    bin_report = classification_report(all_y_bin_true, all_y_bin_pred, zero_division=0)
    mul_report = classification_report(all_y_mul_true, all_y_mul_pred, zero_division=0)
    
    with open(eval_log_path, "w") as f:
        f.write(f"=== EVALUATION REPORT FOR {file_name} ===\n\n")
        f.write("--- ZERO-DAY DETECTION (BINARY) ---\n")
        f.write(bin_report)
        f.write("\n\n--- FORENSIC ATTACK CLASSIFICATION (MULTICLASS) ---\n")
        f.write(mul_report)
        
    print(f"Evaluation report saved to: {eval_log_path}")

print("\n==================================================")
print("             ALL MODELS TRAINED                   ")
print("==================================================")
