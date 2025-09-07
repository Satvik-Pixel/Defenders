import os
import json
import torch
import re
from flask import Flask, render_template, request, redirect, url_for, send_from_directory
from werkzeug.utils import secure_filename
from io import BytesIO
from PIL import Image
from torchvision import models, transforms

# Flask setup
app = Flask(__name__)
RESULTS_FOLDER = os.path.join(os.getcwd(), "results")
os.makedirs(RESULTS_FOLDER, exist_ok=True)
app.config["RESULTS_FOLDER"] = RESULTS_FOLDER

# Debug: Check current directory and files
print("Current directory:", os.getcwd())
print("Files in directory:", os.listdir('.'))

# Device
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Using device: {device}")

# Transforms
val_transforms = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor()
])

# Load class names with error handling
try:
    with open("classes.json", "r") as f:
        class_names = json.load(f)
    print(f"Loaded {len(class_names)} class names")
except FileNotFoundError:
    print("ERROR: classes.json not found!")
    class_names = []
except Exception as e:
    print(f"ERROR loading classes.json: {e}")
    class_names = []

# Load model with error handling
try:
    model = models.mobilenet_v3_large(pretrained=False)
    if class_names:  # Only modify if we have class names
        model.classifier[3] = torch.nn.Linear(model.classifier[3].in_features, len(class_names))
    model.to(device)
    
    if os.path.exists("model.pth"):
        model.load_state_dict(torch.load("model.pth", map_location=device))
        model.eval()
        print("Model loaded successfully!")
    else:
        print("WARNING: model.pth not found. Using untrained model.")
        # You might want to raise an error here instead
        # raise FileNotFoundError("No saved model found. Please train first.")
        
except Exception as e:
    print(f"ERROR loading model: {e}")
    model = None

# Load recommendations with error handling
try:
    with open("recommendations_full.json", "r") as f:
        treatment_dict = json.load(f)
    print("Recommendations loaded successfully")
except FileNotFoundError:
    print("WARNING: recommendations_full.json not found!")
    treatment_dict = {}
except Exception as e:
    print(f"ERROR loading recommendations: {e}")
    treatment_dict = {}

# Helper functions
def normalize_label(label: str) -> str:
    label = label.strip().lower()
    label = re.sub(r'[^a-z0-9]+', '_', label)
    return label.strip('_')

def predict_image(image_bytes, confidence_threshold=0.70):
    if model is None:
        return {
            "detected": "Error",
            "confidence": 0,
            "recommendation": "Model not loaded properly. Check console for errors."
        }
    
    try:
        image = Image.open(image_bytes).convert("RGB")
        image = val_transforms(image).unsqueeze(0).to(device)
        
        with torch.no_grad():
            outputs = model(image)
            probs = torch.nn.functional.softmax(outputs, dim=1)
            conf, pred_idx = torch.max(probs, 1)
            conf = conf.item()
        
        if not class_names:
            return {
                "detected": "Error",
                "confidence": round(conf * 100, 2),
                "recommendation": "Class names not loaded properly."
            }
            
        predicted_class_raw = class_names[pred_idx.item()]
        predicted_class = normalize_label(predicted_class_raw)
        
        if conf < confidence_threshold:
            return {
                "detected": "Unrecognized",
                "confidence": round(conf * 100, 2),
                "recommendation": "Confidence too low — please retake or use clearer image."
            }
        
        rec_info = treatment_dict.get(predicted_class, {"recommendation": "No advice available"})
        return {
            "detected": predicted_class_raw,
            "confidence": round(conf * 100, 2),
            "recommendation": rec_info.get("recommendation", "No advice available"),
            "ipm_steps": rec_info.get("ipm_steps", []),
            "chemical_options": rec_info.get("chemical_options", [])
        }
    except Exception as e:
        print(f"ERROR in predict_image: {e}")
        return {
            "detected": "Error",
            "confidence": 0,
            "recommendation": f"Prediction failed: {str(e)}"
        }

# Routes
@app.route("/")
def home():
    return render_template("index.html")

@app.route('/results/<filename>')
def result_file(filename):
    return send_from_directory(app.config['RESULTS_FOLDER'], filename)

@app.route("/upload", methods=["GET", "POST"])
def upload():
    if request.method == "POST":
        if "file" not in request.files:
            return "No file uploaded", 400
        
        file = request.files["file"]
        if file.filename == "":
            return "No file selected", 400
        
        try:
            # Read image into memory
            img_bytes = file.read()
            result = predict_image(BytesIO(img_bytes))
            
            # Save file to disk to display it
            filename = secure_filename(file.filename)
            filepath = os.path.join(app.config["RESULTS_FOLDER"], filename)
            with open(filepath, "wb") as f:
                f.write(img_bytes)
            
            return render_template("result.html", result=result, image_url=url_for("result_file", filename=filename))
        except Exception as e:
            print(f"ERROR in upload: {e}")
            return f"Error processing file: {str(e)}", 500
    
    return render_template("upload.html")

if __name__ == "__main__":  # Fixed syntax error here
    app.run(debug=True)