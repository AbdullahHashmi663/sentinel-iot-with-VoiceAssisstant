import os
import pandas as pd
import numpy as np
import json

cleaned_dir = r"c:\Users\User\Desktop\FYP_WORK\cleaned_datasets"
datasets = [
    {"name": "Network_Traffic", "raw": r"c:\Users\User\Desktop\FYP_WORK\Train_Test_datasets\Train_Test_Network_dataset\Train_Test_Network.csv", "cleaned": "cleaned_network_balanced.csv"},
    {"name": "IoT_Fridge", "raw": r"c:\Users\User\Desktop\FYP_WORK\Train_Test_datasets\Train_Test_IoT_dataset\Train_Test_IoT_Fridge.csv", "cleaned": "cleaned_IoT_Fridge.csv"},
    {"name": "IoT_GPS_Tracker", "raw": r"c:\Users\User\Desktop\FYP_WORK\Train_Test_datasets\Train_Test_IoT_dataset\Train_Test_IoT_GPS_Tracker.csv", "cleaned": "cleaned_IoT_GPS_Tracker.csv"},
    {"name": "IoT_Garage_Door", "raw": r"c:\Users\User\Desktop\FYP_WORK\Train_Test_datasets\Train_Test_IoT_dataset\Train_Test_IoT_Garage_Door.csv", "cleaned": "cleaned_IoT_Garage_Door.csv"},
    {"name": "IoT_Modbus", "raw": r"c:\Users\User\Desktop\FYP_WORK\Train_Test_datasets\Train_Test_IoT_dataset\Train_Test_IoT_Modbus.csv", "cleaned": "cleaned_IoT_Modbus.csv"},
    {"name": "IoT_Motion_Light", "raw": r"c:\Users\User\Desktop\FYP_WORK\Train_Test_datasets\Train_Test_IoT_dataset\Train_Test_IoT_Motion_Light.csv", "cleaned": "cleaned_IoT_Motion_Light.csv"},
    {"name": "IoT_Thermostat", "raw": r"c:\Users\User\Desktop\FYP_WORK\Train_Test_datasets\Train_Test_IoT_dataset\Train_Test_IoT_Thermostat.csv", "cleaned": "cleaned_IoT_Thermostat.csv"},
    {"name": "IoT_Weather", "raw": r"c:\Users\User\Desktop\FYP_WORK\Train_Test_datasets\Train_Test_IoT_dataset\Train_Test_IoT_Weather.csv", "cleaned": "cleaned_IoT_Weather.csv"},
    {"name": "Linux_disk", "raw": r"c:\Users\User\Desktop\FYP_WORK\Train_Test_datasets\Train_Test_Linux_dataset\Train_test_linux_disk.csv", "cleaned": "cleaned_Linux_disk.csv"},
    {"name": "Linux_memory", "raw": r"c:\Users\User\Desktop\FYP_WORK\Train_Test_datasets\Train_Test_Linux_dataset\Train_test_linux_memory.csv", "cleaned": "cleaned_Linux_memory.csv"},
    {"name": "Linux_process", "raw": r"c:\Users\User\Desktop\FYP_WORK\Train_Test_datasets\Train_Test_Linux_dataset\Train_Test_Linux_process.csv", "cleaned": "cleaned_Linux_process.csv"},
    {"name": "Windows_10", "raw": r"c:\Users\User\Desktop\FYP_WORK\Train_Test_datasets\Train_Test_Windows_dataset\Train_Test_Windows_10.csv", "cleaned": "cleaned_Windows_10.csv"},
    {"name": "Windows_7", "raw": r"c:\Users\User\Desktop\FYP_WORK\Train_Test_datasets\Train_Test_Windows_dataset\Train_Test_Windows_7.csv", "cleaned": "cleaned_Windows_7.csv"}
]

metadata = {}

for ds in datasets:
    name = ds["name"]
    raw_path = ds["raw"]
    cleaned_file = ds["cleaned"]
    
    # Get class names alphabetically
    df_raw = pd.read_csv(raw_path, low_memory=False)
    df_raw.replace('-', np.nan, inplace=True)
    df_raw.dropna(subset=['type'], inplace=True)
    class_names = sorted(df_raw['type'].astype(str).str.strip().unique())
    
    # Get feature count
    df_clean = pd.read_csv(os.path.join(cleaned_dir, cleaned_file), nrows=2)
    X_feats = df_clean.drop(columns=['label', 'type'])
    num_features = X_feats.shape[1]
    
    metadata[name] = {
        "num_features": num_features,
        "num_classes": len(class_names),
        "class_names": class_names
    }

out_path = os.path.join(cleaned_dir, "model_metadata.json")
with open(out_path, "w") as f:
    json.dump(metadata, f, indent=4)

print("Metadata JSON created successfully.")
print(json.dumps(metadata, indent=2))
