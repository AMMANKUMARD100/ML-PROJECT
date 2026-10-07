import os
from train import extract_mfcc_features
import joblib
import numpy as np

def analyze_audio(input_audio_path):
    model_filename = "svm_model.pkl"
    scaler_filename = "scaler.pkl"
    svm_classifier = joblib.load(model_filename)
    scaler = joblib.load(scaler_filename)

    if not os.path.exists(input_audio_path):
        print(f"Error: The file {input_audio_path} does not exist.")
        return "Error"
    elif not input_audio_path.lower().endswith(".wav"):
        print(f"Error: {input_audio_path} is not a .wav file.")
        return "Error"

    mfcc_features = extract_mfcc_features(input_audio_path)

    if mfcc_features is not None:
        mfcc_features_scaled = scaler.transform(mfcc_features.reshape(1, -1))
        probabilities = svm_classifier.predict_proba(mfcc_features_scaled)
        
        confidence_percentage = np.max(probabilities) * 100
        prediction = svm_classifier.predict(mfcc_features_scaled)
        
        if prediction[0] == 0:
            result = "Genuine"
            print(f"The input audio is classified as {result} with a confidence of {confidence_percentage:.2f}%.")
        else:
            result = "Deepfake"
            print(f"The input audio is classified as {result} with a confidence of {confidence_percentage:.2f}%.")
        
        return result
    else:
        print(f"Error: Unable to process the input audio {input_audio_path}.")
        return "Error"

if __name__ == "__main__":
    # Directory containing the .wav files
    audio_directory = "test"

    # Normalize the directory path
    audio_directory = os.path.normpath(audio_directory)
    
    # List all .wav files in the directory
    wav_files = [f for f in os.listdir(audio_directory) if f.lower().endswith(".wav")]

    if not wav_files:
        print(f"No .wav files found in directory: {audio_directory}")
    else:
        print(f"Found {len(wav_files)} .wav file(s) in directory: {audio_directory}")

        # Create a results dictionary
        results = {}

        # Analyze each .wav file
        for wav_file in wav_files:
            full_path = os.path.join(audio_directory, wav_file)
            print(f"\nAnalyzing file: {full_path}")
            result = analyze_audio(full_path)
            results[wav_file] = result