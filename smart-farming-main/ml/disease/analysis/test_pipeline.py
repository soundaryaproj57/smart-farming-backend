import os
import numpy as np
import tensorflow as tf
from PIL import Image

# 🔥 RELATIVE IMPORTS (CORRECT FOR THIS LOCATION)
from .affected_area import get_affected_area
from .severity import get_severity
from ..knowledge_base.disease_kb import DISEASE_KB
from ..class_name import CLASS_NAMES


# ----------------------
# LOAD CNN MODEL (CORRECT PATH)
# ----------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

MODEL_PATH = os.path.join(
    BASE_DIR,          # ml/disease/analysis
    "..",              # ml/disease
    "models",          # ✅ folder name matches screenshot
    "paddy_leaf_disease_model.h5"
)

# hard fail if path wrong (good for debugging)
if not os.path.exists(MODEL_PATH):
    raise FileNotFoundError(f"Model not found at: {MODEL_PATH}")

try:
    model = tf.keras.models.load_model(MODEL_PATH)
    print("✅ Disease detection model loaded successfully")
except Exception as e:
    print(f"❌ Error loading model: {e}")
    raise


# ----------------------
# MAIN PIPELINE FUNCTION
# ----------------------
def run_pipeline(image_path):
    """
    Full disease detection pipeline with comprehensive agricultural recommendations
    """
    try:
        # 1️⃣ Load & preprocess image
        img = Image.open(image_path).convert("RGB")
        img = img.resize((224, 224))
        img_array = np.array(img) / 255.0
        img_array = np.expand_dims(img_array, axis=0)

        # 2️⃣ CNN prediction
        preds = model.predict(img_array)
        class_index = int(np.argmax(preds))
        confidence = float(np.max(preds)) * 100

        # 3️⃣ Disease class
        disease_key = CLASS_NAMES[class_index]

        # 4️⃣ Affected area analysis
        affected_area, infected_area = get_affected_area(image_path)

        # 5️⃣ Severity assessment
        severity = get_severity(confidence, infected_area)

        # 6️⃣ Get comprehensive treatment details
        treatment_data = DISEASE_KB.get(disease_key, {
            "name": "Unknown Disease",
            "treatment": "Consult agriculture officer immediately",
            "prevention": "Monitor crop regularly for early symptoms",
            "application_method": "Follow local agricultural guidelines",
            "secondary_treatment": "Consider biological alternatives",
            "recommended_products": ["General fungicide", "Bio-control agents"],
            "timing": "Apply during early morning or late evening",
            "frequency": "Repeat application if symptoms persist",
            "safety_notes": "Wear protective equipment during application"
        })

        # 7️⃣ Enhanced response with comprehensive agricultural guidance
        return {
            "disease": treatment_data.get("name", DISEASE_KB.get(disease_key, {}).get("name", disease_key.replace("_", " ").title())),
            "confidence": round(confidence, 2),
            "affected_area": affected_area,
            "infected_area": round(infected_area, 2),
            "severity": severity,
            "treatment": treatment_data.get("treatment", "Consult agriculture officer"),
            "prevention": treatment_data.get("prevention", "Monitor crop regularly"),
            "application_method": treatment_data.get("application_method", "Follow label instructions"),
            "secondary_treatment": treatment_data.get("secondary_treatment", "Consider biological alternatives"),
            "recommended_products": treatment_data.get("recommended_products", ["General treatment"]),
            "timing": treatment_data.get("timing", "Apply during suitable weather conditions"),
            "frequency": treatment_data.get("frequency", "Repeat as needed"),
            "safety_notes": treatment_data.get("safety_notes", "Follow safety precautions"),
            "weather_considerations": treatment_data.get("weather_considerations", "Avoid application during rain or strong winds"),
            "crop_stage_compatibility": treatment_data.get("crop_stage_compatibility", "Suitable for current growth stage"),
            "soil_compatibility": treatment_data.get("soil_compatibility", "Compatible with most soil types"),
            "estimated_cost": treatment_data.get("estimated_cost", "Cost varies by product choice"),
            "effectiveness_duration": treatment_data.get("effectiveness_duration", "7-14 days protection"),
            "reapplication_needed": treatment_data.get("reapplication_needed", "Monitor and reapply if symptoms persist")
        }

    except Exception as e:
        print(f"❌ Disease detection pipeline error: {e}")
        # Return safe fallback response
        return {
            "disease": "Analysis Failed",
            "confidence": 0.0,
            "affected_area": "Unable to analyze",
            "infected_area": 0.0,
            "severity": "Unknown",
            "treatment": "Please consult agricultural expert for proper diagnosis",
            "prevention": "Ensure proper crop management practices",
            "application_method": "Follow expert recommendations",
            "secondary_treatment": "Consider laboratory testing for accurate diagnosis",
            "recommended_products": ["Consult agricultural specialist"],
            "timing": "Immediate consultation recommended",
            "frequency": "As advised by expert",
            "safety_notes": "Do not apply treatments without proper diagnosis",
            "error": str(e)
        }