import os
import zipfile

# Paths
source_dir = r"c:\Users\User\Desktop\FYP_WORK"
weights_dir = os.path.join(source_dir, "cleaned_datasets", "models")
downloads_dir = r"C:\Users\User\Downloads"
zip_out_path = os.path.join(downloads_dir, "sentinel_deployment_package.zip")

print("Packaging deployment files...")

files_to_pack = [
    # Network weights from root
    (os.path.join(source_dir, "conformer_sentinel_model_opt.pth"), "weights/conformer_sentinel_model_opt.pth"),
    (os.path.join(source_dir, "network_scaler.joblib"), "weights/network_scaler.joblib"),
    (os.path.join(source_dir, "network_routing_metadata.csv"), "weights/network_routing_metadata.csv"),
    (os.path.join(source_dir, "cleaned_datasets", "model_metadata.json"), "weights/model_metadata.json"),
    (os.path.join(source_dir, "inference_gateway.py"), "inference_gateway.py"),
    (os.path.join(source_dir, "mqtt_streamer.py"), "mqtt_streamer.py")
]

# Add all 12 IoT/OS weights from cleaned_datasets/models
if os.path.exists(weights_dir):
    for f in os.listdir(weights_dir):
        if f.endswith(".pth"):
            files_to_pack.append((os.path.join(weights_dir, f), f"weights/{f}"))

with zipfile.ZipFile(zip_out_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
    for src, arc in files_to_pack:
        if os.path.exists(src):
            print(f"Adding: {src} -> {arc}")
            zipf.write(src, arc)
        else:
            print(f"Warning: File not found: {src}")

print(f"Deployment package created successfully at: {zip_out_path}")
