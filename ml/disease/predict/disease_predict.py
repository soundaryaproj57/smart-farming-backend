from ml.disease.analysis.test_pipeline import run_pipeline

def predict_disease(image_path):
    """
    Bridge between Flask and ML pipeline
    """
    return run_pipeline(image_path)
