import os
import re

models_dir = r"c:\Users\User\Desktop\FYP_WORK\cleaned_datasets\models"
eval_files = [f for f in os.listdir(models_dir) if f.startswith("evaluation_") and f.endswith(".txt")]

print("| Telemetry Source | Binary Acc | Binary Normal F1 | Binary Attack F1 | Multiclass Acc | Key Attack Classes F1 |")
print("| :--- | :--- | :--- | :--- | :--- | :--- |")

# Map of encoded integers to class names for typical datasets (or read from reports)
for file_name in sorted(eval_files):
    file_path = os.path.join(models_dir, file_name)
    with open(file_path, "r") as f:
        content = f.read()
    
    # Parse dataset name
    ds_name = file_name.replace("evaluation_cleaned_", "").replace(".txt", "")
    
    # Extract binary accuracy
    bin_acc_match = re.search(r"--- ZERO-DAY DETECTION \(BINARY\) ---\s+.*?accuracy\s+([\d\.]+)", content, re.DOTALL)
    bin_acc = bin_acc_match.group(1) if bin_acc_match else "N/A"
    
    # Extract binary classes F1
    bin_0_match = re.search(r"0\.0\s+[\d\.]+\s+[\d\.]+\s+([\d\.]+)", content)
    bin_0_f1 = bin_0_match.group(1) if bin_0_match else "N/A"
    
    bin_1_match = re.search(r"1\.0\s+[\d\.]+\s+[\d\.]+\s+([\d\.]+)", content)
    bin_1_f1 = bin_1_match.group(1) if bin_1_match else "N/A"
    
    # Extract multiclass accuracy
    mul_acc_match = re.search(r"--- FORENSIC ATTACK CLASSIFICATION \(MULTICLASS\) ---\s+.*?accuracy\s+([\d\.]+)", content, re.DOTALL)
    mul_acc = mul_acc_match.group(1) if mul_acc_match else "N/A"
    
    # Extract multiclass breakdown (classes and F1s)
    # We find all class rows in multiclass section
    mul_section = re.search(r"--- FORENSIC ATTACK CLASSIFICATION \(MULTICLASS\) ---(.*)", content, re.DOTALL)
    class_f1s = []
    if mul_section:
        mul_text = mul_section.group(1)
        # Find rows starting with spaces and a class label number/name
        # e.g., "   backdoor  0.59  0.99  0.74" or "            0       0.86      0.80      0.83"
        lines = mul_text.split('\n')
        for line in lines:
            line = line.strip()
            if not line:
                continue
            parts = line.split()
            # If the row represents a class row: label, precision, recall, f1, support
            if len(parts) == 5 and parts[1].replace('.','').isdigit() and parts[2].replace('.','').isdigit():
                class_label = parts[0]
                f1_val = parts[3]
                class_f1s.append(f"Class {class_label}: {f1_val}")
                
    # Format class F1s as a string
    class_f1s_str = ", ".join(class_f1s[:4]) # limit to first 4 for formatting space
    if len(class_f1s) > 4:
        class_f1s_str += "..."
        
    # Convert float strings to percentages
    try:
        bin_acc_pct = f"{float(bin_acc)*100:.1f}%" if bin_acc != "N/A" else "N/A"
    except ValueError:
        bin_acc_pct = bin_acc
    try:
        mul_acc_pct = f"{float(mul_acc)*100:.1f}%" if mul_acc != "N/A" else "N/A"
    except ValueError:
        mul_acc_pct = mul_acc
        
    print(f"| {ds_name} | {bin_acc_pct} | {bin_0_f1} | {bin_1_f1} | {mul_acc_pct} | {class_f1s_str} |")
