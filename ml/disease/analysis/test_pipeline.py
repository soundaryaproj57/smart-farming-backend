import os

os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"
os.environ["CUDA_VISIBLE_DEVICES"] = "-1"
os.environ["TF_ENABLE_ONEDNN_OPTS"] = "0"
import numpy as np
import tensorflow as tf
from PIL import Image

from .affected_area import get_affected_area
from .severity import get_severity
from ..knowledge_base.disease_kb import DISEASE_KB
from ..class_name import CLASS_NAMES


BASE_DIR = os.path.dirname(os.path.abspath(__file__))

MODEL_PATH = os.path.join(
    BASE_DIR,
    "..",
    "models",
    "paddy_leaf_disease_model.h5"
)

if not os.path.exists(MODEL_PATH):
    raise FileNotFoundError(
        f"Model not found at: {MODEL_PATH}"
    )

model = tf.keras.models.load_model(
    MODEL_PATH,
    compile=False
)

def run_pipeline(image_path):

    # Load image
    img = Image.open(
        image_path
    ).convert("RGB")

    img = img.resize((224, 224))

    img_array = np.array(img) / 255.0

    img_array = np.expand_dims(
        img_array,
        axis=0
    )

    # Prediction
    preds = model.predict(img_array)

    class_index = int(
        np.argmax(preds)
    )

    confidence = float(
        np.max(preds)
    ) * 100

    disease_key = CLASS_NAMES[
        class_index
    ]

    print(
        "🔥 DETECTED CLASS:",
        disease_key
    )

    print(
        "🔥 CONFIDENCE:",
        confidence
    )

    # LOW CONFIDENCE CHECK
    if confidence < 25:

        return {
            "disease":
                "Uncertain Prediction",

            "confidence":
                round(confidence, 2),

            "affected_area":
                "Unable to analyze",

            "infected_area":
                0,

            "severity":
                "Unknown",

            "treatment":
                "Please upload a clearer leaf image"
        }

    # HEALTHY LEAF CHECK
    if (
        disease_key.lower() == "normal"
        or "healthy" in disease_key.lower()
    ):

        affected_area = (
            "No Disease Detected"
        )

        infected_area = 0

        severity = "None"

    else:

        affected_area, infected_area = (
            get_affected_area(
                image_path
            )
        )

        severity = get_severity(
            confidence,
            infected_area
        )

    treatment = DISEASE_KB.get(
        disease_key,
        {
            "treatment":
            "No treatment required"
        }
    )["treatment"]

    return {
        "disease":
            DISEASE_KB[disease_key][
                "name"
            ],

        "confidence":
            round(confidence, 2),

        "affected_area":
            affected_area,

        "infected_area":
            round(infected_area, 2),

        "severity":
            severity,

        "treatment":
            treatment
    }