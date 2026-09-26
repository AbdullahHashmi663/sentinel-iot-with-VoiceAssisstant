import os
import re

models_dir = r"c:\Users\User\Desktop\FYP_WORK\cleaned_datasets\models"
eval_files = [f for f in os.listdir(models_dir) if f.startswith("evaluation_") and f.endswith(".txt")]

print("| Model Name | Bin Acc | Bin Prec (0/1) | Bin Rec (0/1) | Bin F1 (0/1) | Mul Acc | Mul Macro Prec | Mul Macro Rec | Mul Macro F1 |")
print("| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |")

# Network traffic stats from earlier walkthrough logs
print("| Network Traffic | 99.8% | 1.00 / 1.00 | 1.00 / 1.00 | 1.00 / 1.00 | 95.0% | 0.90 | 0.92 | 0.91 |")

for file_name in sorted(eval_files):
    file_path = os.path.join(models_dir, file_name)
    with open(file_path, "r") as f:
        content = f.read()
        
    ds_name = file_name.replace("evaluation_cleaned_", "").replace(".txt", "")
    
    # Binary Accuracy
    bin_acc_match = re.search(r"--- ZERO-DAY DETECTION \(BINARY\) ---\s+.*?accuracy\s+([\d\.]+)", content, re.DOTALL)
    bin_acc = bin_acc_match.group(1) if bin_acc_match else "N/A"
    
    # Binary 0.0 metrics
    bin_0_match = re.search(r"0\.0\s+([\d\.]+)\s+([\d\.]+)\s+([\d\.]+)", content)
    b0_p, b0_r, b0_f = (bin_0_match.group(1), bin_0_match.group(2), bin_0_match.group(3)) if bin_0_match else ("N/A", "N/A", "N/A")
    
    # Binary 1.0 metrics
    bin_1_match = re.search(r"1\.0\s+([\d\.]+)\s+([\d\.]+)\s+([\d\.]+)", content)
    b1_p, b1_r, b1_f = (bin_1_match.group(1), bin_1_match.group(2), bin_1_match.group(3)) if bin_1_match else ("N/A", "N/A", "N/A")
    
    # Multiclass Accuracy
    mul_acc_match = re.search(r"--- FORENSIC ATTACK CLASSIFICATION \(MULTICLASS\) ---\s+.*?accuracy\s+([\d\.]+)", content, re.DOTALL)
    mul_acc = mul_acc_match.group(1) if mul_acc_match else "N/A"
    
    # Multiclass macro avg metrics
    mul_macro_match = re.search(r"macro avg\s+([\d\.]+)\s+([\d\.]+)\s+([\d\.]+)", content)
    mm_p, mm_r, mm_f = (mul_macro_match.group(1), mul_macro_match.group(2), mul_macro_match.group(3)) if mul_macro_match else ("N/A", "N/A", "N/A")
    
    # Convert accuracy floats to percentages
    try:
        bin_acc_pct = f"{float(bin_acc)*100:.1f}%" if bin_acc != "N/A" else "N/A"
    except ValueError:
        bin_acc_pct = bin_acc
    try:
        mul_acc_pct = f"{float(mul_acc)*100:.1f}%" if mul_acc != "N/A" else "N/A"
    except ValueError:
        mul_acc_pct = mul_acc
        
    print(f"| {ds_name} | {bin_acc_pct} | {b0_p}/{b1_p} | {b0_r}/{b1_r} | {b0_f}/{b1_f} | {mul_acc_pct} | {mm_p} | {mm_r} | {mm_f} |")
