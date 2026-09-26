import os
import pandas as pd
import numpy as np
import joblib
from sklearn.preprocessing import LabelEncoder

print("Starting to save the cleaned and scaled network dataset...")

# 1. Load the original dataset
dataset_path = r"c:\Users\User\Desktop\FYP_WORK\Train_Test_datasets\Train_Test_Network_dataset\train_test_network.csv"
df = pd.read_csv(dataset_path, low_memory=False)

# Convert Zeek dashes to standard NaNs
df.replace('-', np.nan, inplace=True)

# 2. Drop empty columns
missing_percentages = df.isnull().mean() * 100
threshold = 60.0
columns_to_drop = missing_percentages[missing_percentages > threshold].index
df.drop(columns=columns_to_drop, inplace=True)

# Drop duplicates & NaNs
df.drop_duplicates(inplace=True)
df.dropna(inplace=True)

# 3. Drop identifiers (IPs, Ports)
identifiers = ['src_ip', 'dst_ip', 'src_port', 'dst_port']
df.drop(columns=identifiers, inplace=True, errors='ignore')

# 4. Encode text columns
text_columns = df.select_dtypes(include=['object']).columns
for col in text_columns:
    if col != 'type':
        le = LabelEncoder()
        df[col] = le.fit_transform(df[col].astype(str))

type_encoder = LabelEncoder()
df['type'] = type_encoder.fit_transform(df['type'].astype(str))

# Separate features and targets
y_label = df['label'].reset_index(drop=True)
y_type = df['type'].reset_index(drop=True)
X_features = df.drop(columns=['label', 'type']).reset_index(drop=True)

# 5. Load the fitted scaler and transform
scaler_path = r"c:\Users\User\Desktop\FYP_WORK\network_scaler.joblib"
if os.path.exists(scaler_path):
    print(f"Loading scaler from: {scaler_path}")
    scaler = joblib.load(scaler_path)
    X_scaled = pd.DataFrame(scaler.transform(X_features), columns=X_features.columns)
else:
    print("Scaler not found. Fitting a new scaler on 80% of rows...")
    from sklearn.preprocessing import MinMaxScaler
    split_idx = int(0.8 * len(X_features))
    scaler = MinMaxScaler()
    scaler.fit(X_features.iloc[:split_idx])
    X_scaled = pd.DataFrame(scaler.transform(X_features), columns=X_features.columns)
    joblib.dump(scaler, scaler_path)

# Re-attach targets
cleaned_df = pd.concat([X_scaled, y_label, y_type], axis=1)

# Save to CSV
output_path = r"c:\Users\User\Desktop\FYP_WORK\cleaned_network_dataset.csv"
cleaned_df.to_csv(output_path, index=False)

print(f"Success! Saved the cleaned and scaled dataset to: {output_path}")
print("Cleaned Dataset Shape:", cleaned_df.shape)
