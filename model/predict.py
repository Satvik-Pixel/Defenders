with open("recommendations_short.json", "r") as f: #open any of the 2 rec files here
    treatment_dict = json.load(f)

# Label normalization
def normalize_label(label: str) -> str:
    label = label.strip().lower()
    label = re.sub(r'[^a-z0-9]+', '_', label)  # replace non-alphanum with underscores
    label = re.sub(r'_+', '_', label)          # collapse multiple underscores
    return label.strip('_')

# Main prediction function for Flask
def predict_image_bytes(image_bytes, model, class_names, val_transforms, device, confidence_threshold=0.70):
    image = Image.open(BytesIO(image_bytes)).convert("RGB")
    image = val_transforms(image).unsqueeze(0).to(device)

    model.eval()
    with torch.no_grad():
        outputs = model(image)
        probs = torch.nn.functional.softmax(outputs, dim=1)
        conf, pred_idx = torch.max(probs, 1)
        conf = conf.item()

    predicted_class_raw = class_names[pred_idx.item()]
    predicted_class = normalize_label(predicted_class_raw)

    if conf < confidence_threshold:
        return {
            "detected": "Unrecognized",
            "confidence": conf,
            "recommendation": "Confidence too low — please retake or use clearer image."
        }

    rec_info = treatment_dict.get(predicted_class, {"recommendation": "No advice available"})
    return {
        "detected": predicted_class_raw,
        "confidence": conf,
        "recommendation": rec_info.get("recommendation", "No advice available"),
        "ipm_steps": rec_info.get("ipm_steps", []),
        "chemical_options": rec_info.get("chemical_options", [])
    }
