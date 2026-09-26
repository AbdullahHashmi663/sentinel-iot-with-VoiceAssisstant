import pandas as pd
import numpy as np

# Load dataset
dataset_path = r"c:\Users\User\Desktop\FYP_WORK\Train_Test_datasets\Train_Test_Network_dataset\train_test_network.csv"
df = pd.read_csv(dataset_path, nrows=5000, low_memory=False)
df.replace('-', np.nan, inplace=True)
df.drop_duplicates(inplace=True)
df.dropna(axis=1, thresh=int(0.4 * len(df)), inplace=True)
df.dropna(inplace=True)

identifiers = ['src_ip', 'dst_ip', 'src_port', 'dst_port']
df.drop(columns=identifiers, inplace=True, errors='ignore')

text_columns = df.select_dtypes(include=['object']).columns
from sklearn.preprocessing import LabelEncoder
for col in text_columns:
    if col != 'type':
        le = LabelEncoder()
        df[col] = le.fit_transform(df[col].astype(str))

# Print out columns and standard deviations
print("Columns and description:")
print(df.describe().T[['mean', 'std', 'min', 'max']])
