import os
import joblib
import numpy as np
from .train import extract_advanced_features

# Cache model and scaler in memory to provide ultra-fast offline predictions
_CACHED_MODEL = None
_CACHED_SCALER = None

def get_model_and_scaler():
    global _CACHED_MODEL, _CACHED_SCALER
    if _CACHED_MODEL is not None and _CACHED_SCALER is not None:
        return _CACHED_MODEL, _CACHED_SCALER

    current_dir = os.path.dirname(os.path.abspath(__file__))
    model_filename = os.path.join(current_dir, "svm_model.pkl")
    scaler_filename = os.path.join(current_dir, "scaler.pkl")

    if not os.path.exists(model_filename):
        raise FileNotFoundError(f"Model file not found: {model_filename}")
    if not os.path.exists(scaler_filename):
        raise FileNotFoundError(f"Scaler file not found: {scaler_filename}")

    _CACHED_MODEL = joblib.load(model_filename)
    _CACHED_SCALER = joblib.load(scaler_filename)
    return _CACHED_MODEL, _CACHED_SCALER

def analyze_audio(input_audio_path):
    """
    Offline Voice Deepfake Classifier.
    Runs 100% locally with zero internet dependency.
    """
    if not os.path.exists(input_audio_path):
        print(f"Error: The specified file {input_audio_path} does not exist.")
        return None

    # Load cached model and scaler
    classifier, scaler = get_model_and_scaler()

    # Extract 154-dimensional multi-feature acoustic representation
    features = extract_advanced_features(input_audio_path)

    if features is not None:
        features_scaled = scaler.transform(features.reshape(1, -1))
        
        # Support classifiers with predict_proba (RandomForest, ExtraTrees, SVC probability=True)
        if hasattr(classifier, "predict_proba"):
            probabilities = classifier.predict_proba(features_scaled)[0]
            prediction = classifier.predict(features_scaled)[0]
            confidence_percentage = float(probabilities[prediction]) * 100
        else:
            prediction = classifier.predict(features_scaled)[0]
            confidence_percentage = 95.0

        label = 'Genuine' if prediction == 0 else 'Deepfake'
        return [label, float(confidence_percentage)]
    else:
        print(f"Error: Unable to extract acoustic features from {input_audio_path}.")
        return None