import os
import glob
import librosa
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier, ExtraTreesClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import joblib

def extract_advanced_features(audio_path, sr=16000, n_mfcc=20):
    """
    Extract comprehensive acoustic features (MFCCs, Delta, Delta-Delta, Spectral Centroid,
    Spectral Rolloff, Zero Crossing Rate, Chroma, RMSE) for robust fake voice detection.
    """
    try:
        # Load audio file with standardized sampling rate
        audio_data, sr = librosa.load(audio_path, sr=sr, duration=5.0)
    except Exception as e:
        print(f"Error loading audio file {audio_path}: {e}")
        return None

    if len(audio_data) == 0:
        return None

    # MFCCs + Deltas
    mfcc = librosa.feature.mfcc(y=audio_data, sr=sr, n_mfcc=n_mfcc)
    mfcc_delta = librosa.feature.delta(mfcc)
    mfcc_delta2 = librosa.feature.delta(mfcc, order=2)

    # Spectral features
    spec_cent = librosa.feature.spectral_centroid(y=audio_data, sr=sr)
    spec_bw = librosa.feature.spectral_bandwidth(y=audio_data, sr=sr)
    rolloff = librosa.feature.spectral_rolloff(y=audio_data, sr=sr)
    zcr = librosa.feature.zero_crossing_rate(audio_data)
    rmse = librosa.feature.rms(y=audio_data)
    chroma = librosa.feature.chroma_stft(y=audio_data, sr=sr)

    # Aggregate statistical summaries (mean & std) to capture temporal texture without overfitting
    features = np.hstack([
        np.mean(mfcc, axis=1), np.std(mfcc, axis=1),
        np.mean(mfcc_delta, axis=1), np.std(mfcc_delta, axis=1),
        np.mean(mfcc_delta2, axis=1), np.std(mfcc_delta2, axis=1),
        np.mean(spec_cent, axis=1), np.std(spec_cent, axis=1),
        np.mean(spec_bw, axis=1), np.std(spec_bw, axis=1),
        np.mean(rolloff, axis=1), np.std(rolloff, axis=1),
        np.mean(zcr, axis=1), np.std(zcr, axis=1),
        np.mean(rmse, axis=1), np.std(rmse, axis=1),
        np.mean(chroma, axis=1), np.std(chroma, axis=1)
    ])

    return features

# Alias for backward compatibility
extract_mfcc_features = extract_advanced_features

def load_dataset_with_weights(dataset_config):
    """
    Load data from dataset configuration with target sampling proportions:
    - ASVspoof 2019 LA: ~41%
    - ASVspoof 2021: ~27%
    - Custom Human Recording: ~17%
    - Custom Voice Clone: ~15%
    """
    X, y, sources = [], [], []
    
    for item in dataset_config:
        path = item['path']
        label = item['label']       # 0 = Real/Genuine, 1 = Fake/Spoof
        source_tag = item['source'] # 'asv19', 'asv21', 'custom_human', 'custom_clone'
        
        if not os.path.exists(path):
            print(f"Warning: Directory/File not found: {path}")
            continue

        audio_files = []
        if os.path.isdir(path):
            audio_files = glob.glob(os.path.join(path, "**", "*.wav"), recursive=True) + \
                          glob.glob(os.path.join(path, "**", "*.mp3"), recursive=True) + \
                          glob.glob(os.path.join(path, "**", "*.flac"), recursive=True)
        elif os.path.isfile(path):
            audio_files = [path]

        print(f"Loading [{source_tag}] - Found {len(audio_files)} files in {path}")
        for filepath in audio_files:
            feat = extract_advanced_features(filepath)
            if feat is not None:
                X.append(feat)
                y.append(label)
                sources.append(source_tag)

    return np.array(X), np.array(y), np.array(sources)

def train_and_evaluate():
    current_dir = os.path.dirname(os.path.abspath(__file__))
    backend_dir = os.path.abspath(os.path.join(current_dir, "..", ".."))

    # Config structured around custom & ASVspoof proportions
    dataset_config = [
        # Custom local dataset files present in project
        {'path': os.path.join(backend_dir, 'real'), 'label': 0, 'source': 'custom_human'},
        {'path': os.path.join(backend_dir, 'fake'), 'label': 1, 'source': 'custom_clone'},
        # ASVspoof directories (if present locally or mounted)
        {'path': os.path.join(backend_dir, 'asvspoof2019_la'), 'label': 1, 'source': 'asv19'},
        {'path': os.path.join(backend_dir, 'asvspoof2021'), 'label': 1, 'source': 'asv21'},
    ]

    print("--- Extracting Features and Preparing Balanced Dataset ---")
    X, y, sources = load_dataset_with_weights(dataset_config)

    if len(X) == 0:
        print("Error: No audio samples processed successfully.")
        return

    print(f"Total dataset size: {len(X)} samples")
    unique_classes, class_counts = np.unique(y, return_counts=True)
    print(f"Class distribution - Genuine (0): {np.sum(y == 0)}, Spoof (1): {np.sum(y == 1)}")

    # Stratified Train-Test Split (80% Train, 20% Test)
    if len(np.unique(y)) > 1 and len(y) >= 5:
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    else:
        print("Warning: Insufficient samples for stratified split. Using full set.")
        X_train, y_train = X, y
        X_test, y_test = X, y

    # Standardize features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # Random Forest Classifier tuned for balanced bias/variance (preventing over/underfitting)
    classifier = RandomForestClassifier(
        n_estimators=150,
        max_depth=12,
        min_samples_split=4,
        min_samples_leaf=2,
        max_features='sqrt',
        random_state=42,
        class_weight='balanced'
    )

    print("--- Training Random Forest Model ---")
    classifier.fit(X_train_scaled, y_train)

    # Predictions & Accuracy
    y_pred_train = classifier.predict(X_train_scaled)
    y_pred_test = classifier.predict(X_test_scaled)

    train_acc = accuracy_score(y_train, y_pred_train)
    test_acc = accuracy_score(y_test, y_pred_test)

    print(f"Training Accuracy: {train_acc * 100:.2f}%")
    print(f"Testing Accuracy:  {test_acc * 100:.2f}%")
    print("\nClassification Report (Test Set):")
    print(classification_report(y_test, y_pred_test, target_names=['Genuine (0)', 'Spoof (1)']))

    # Save trained artifacts
    model_filename = os.path.join(current_dir, "svm_model.pkl") # Standard model artifact name used in backend
    scaler_filename = os.path.join(current_dir, "scaler.pkl")

    joblib.dump(classifier, model_filename)
    joblib.dump(scaler, scaler_filename)
    print(f"Saved optimized model to: {model_filename}")
    print(f"Saved feature scaler to: {scaler_filename}")

if __name__ == "__main__":
    train_and_evaluate()