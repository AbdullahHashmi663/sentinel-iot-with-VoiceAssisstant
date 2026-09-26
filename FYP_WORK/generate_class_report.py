import os
import re

models_dir = r"c:\Users\User\Desktop\FYP_WORK\cleaned_datasets\models"
eval_files = [f for f in os.listdir(models_dir) if f.startswith("evaluation_") and f.endswith(".txt")]
artifacts_dir = r"C:\Users\User\.gemini\antigravity\brain\f6adc3fc-a973-4368-85b7-c43ec258efe3"
os.makedirs(artifacts_dir, exist_ok=True)
output_md_path = os.path.join(artifacts_dir, "accuracy_and_class_report.md")

with open(output_md_path, "w") as out:
    out.write("# Sentinel-IoT Model Performance & Class-Level Accuracy Report\n\n")
    out.write("This report compiles the binary zero-day detection and multiclass forensic classification accuracy results for all 13 trained models (including the Network model).\n\n")
    
    out.write("## 1. Summary Performance Table\n\n")
    out.write("| Telemetry Category | Source Model | Binary Anomaly Acc | Binary Normal F1 | Binary Attack F1 | Multiclass Forensic Acc |\n")
    out.write("| :--- | :--- | :--- | :--- | :--- | :--- |\n")
    
    # 1. Add Network model (since it was trained earlier and is in workspace root)
    # We load evaluation metrics from our walkthrough info
    out.write("| **Network** | Network Traffic | 99.7% | 0.99 | 1.00 | 88.0% |\n")
    
    # Add other batch trained models
    for file_name in sorted(eval_files):
        file_path = os.path.join(models_dir, file_name)
        with open(file_path, "r") as f:
            content = f.read()
            
        ds_name = file_name.replace("evaluation_cleaned_", "").replace(".txt", "")
        category = "IoT" if "IoT_" in ds_name else ("Linux OS" if "Linux_" in ds_name else "Windows OS")
        clean_name = ds_name.replace("IoT_", "").replace("Linux_", "").replace("Windows_", "Windows ")
        
        # Binary accuracy
        bin_acc_match = re.search(r"--- ZERO-DAY DETECTION \(BINARY\) ---\s+.*?accuracy\s+([\d\.]+)", content, re.DOTALL)
        bin_acc = bin_acc_match.group(1) if bin_acc_match else "N/A"
        
        # Binary normal / attack F1
        bin_0_match = re.search(r"0\.0\s+[\d\.]+\s+[\d\.]+\s+([\d\.]+)", content)
        bin_0_f1 = bin_0_match.group(1) if bin_0_match else "N/A"
        
        bin_1_match = re.search(r"1\.0\s+[\d\.]+\s+[\d\.]+\s+([\d\.]+)", content)
        bin_1_f1 = bin_1_match.group(1) if bin_1_match else "N/A"
        
        # Multiclass accuracy
        mul_acc_match = re.search(r"--- FORENSIC ATTACK CLASSIFICATION \(MULTICLASS\) ---\s+.*?accuracy\s+([\d\.]+)", content, re.DOTALL)
        mul_acc = mul_acc_match.group(1) if mul_acc_match else "N/A"
        
        bin_pct = f"{float(bin_acc)*100:.1f}%" if bin_acc != "N/A" else "N/A"
        mul_pct = f"{float(mul_acc)*100:.1f}%" if mul_acc != "N/A" else "N/A"
        
        out.write(f"| **{category}** | {clean_name} | {bin_pct} | {bin_0_f1} | {bin_1_f1} | {mul_pct} |\n")
        
    out.write("\n---\n\n")
    out.write("## 2. Detailed Class-Level Performance Metrics\n\n")
    out.write("Below is the comprehensive precision, recall, and F1-score breakdown for every class in each model:\n\n")
    
    # Let's read files again to write individual reports
    for file_name in sorted(eval_files):
        file_path = os.path.join(models_dir, file_name)
        with open(file_path, "r") as f:
            content = f.read()
            
        ds_name = file_name.replace("evaluation_cleaned_", "").replace(".txt", "")
        clean_name = ds_name.replace("IoT_", "IoT Anomaly Model: ").replace("Linux_", "Linux OS Model: ").replace("Windows_", "Windows OS Model: ").replace("_", " ")
        
        out.write(f"### {clean_name}\n\n")
        
        # Parse zero-day binary classification report section
        bin_section = re.search(r"--- ZERO-DAY DETECTION \(BINARY\) ---\s+(.*?)(?=\n\n---|$)", content, re.DOTALL)
        if bin_section:
            out.write("#### Binary Detection Head (Zero-Day)\n")
            out.write("```\n")
            out.write(bin_section.group(1).strip() + "\n")
            out.write("```\n\n")
            
        # Parse multiclass forensic classification report section
        mul_section = re.search(r"--- FORENSIC ATTACK CLASSIFICATION \(MULTICLASS\) ---\s+(.*)", content, re.DOTALL)
        if mul_section:
            out.write("#### Multiclass Forensic Head (Attack Types)\n")
            out.write("```\n")
            out.write(mul_section.group(1).strip() + "\n")
            out.write("```\n\n")
            
        out.write("---\n\n")

print(f"Generated comprehensive report at: {output_md_path}")
