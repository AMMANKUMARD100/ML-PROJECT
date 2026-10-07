# VoiceDetect 🎙️

AI-powered voice deepfake detection and classification platform to protect against voice-based scams and fraud. **Engineered to function completely offline for core voice detection**, with seamless online enhancement when connected to the internet.

---

## 👥 Project Team
- **AMMAN KUMAR D**
- **ABDUL WHAJIDH S**

---

## 📋 Overview

**VoiceDetect** is a full-stack audio forensics and machine learning application designed to identify cloned, synthetic, and AI-manipulated speech. It extracts deep acoustic features—including 20 MFCCs, Delta, Delta-Delta coefficients, Spectral Centroid, Bandwidth, Rolloff, Zero-Crossing Rate, RMS Energy, and Chroma profiles—and classifies them using an optimized Random Forest classifier with regularized depth to avoid overfitting and underfitting.

### 📶 Hybrid Online & Offline Operation
- **Core Voice Analysis (100% Offline)**: Audio feature extraction, standardization, and deepfake vs. genuine classification run strictly on your local machine using embedded scikit-learn and librosa models. **No internet connection is required.**
- **Offline Security Guidance**: When offline, the system automatically uses a rule-based forensic analysis engine and offline comedic counter-measures to confuse scammers.
- **Online Enhanced Mode**: When internet connectivity and optional API keys (Groq, AssemblyAI) are present, the system seamlessly enriches results with live speech-to-text transcriptions and adaptive LLaMA-based psychological breakdowns.

---

## 🌟 Key Features

- **Offline-First Core Engine**: Instant verification without sending private audio to third-party cloud servers
- **High-Accuracy Acoustic Feature Pipeline**: 154-dimensional statistical feature representation for robust generalization
- **Flexible Audio Support**: Upload `.wav`, `.mp3`, `.flac`, `.ogg`, `.m4a` or record directly in-browser
- **Microphone Recording**: Real-time microphone capture with automatic browser PCM-16 WAV conversion
- **Anti-Scam Comedic Response Generator**: Stuns fraudulent callers with hilarious counter-dialogue
- **Exportable Forensic Reports**: One-click download of timestamped analysis reports
- **User History & Storage**: Persist past audio verifications securely in an SQLite database

---

## 🚀 Tech Stack

### Frontend
- React.js (Create React App)
- React Bootstrap
- Axios
- Web Audio API

### Backend
- Python 3.8+ / 3.11+
- Django & Django REST Framework
- SimpleJWT Authentication
- SQLite

### Machine Learning & Forensics
- Librosa (Acoustic DSP)
- Scikit-learn (Random Forest Ensemble)
- NumPy & SciPy
- Joblib

### Optional External Enhancements
- Groq Cloud API (LLaMA 3.3 for online security synthesis)
- AssemblyAI (Cloud speech-to-text)

---

## 🛠️ Step-by-Step Run Commands (in `cmd`)

### 1. Start the Backend API (Django + ML Engine)
Open a Command Prompt (`cmd`) window and run:

```cmd
cd "c:\Users\Amman kumar D\Downloads\Voice-Detector-main\Voice-Detector-main\backend\foicedetect_backend"
python -m venv scikit_venv
scikit_venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

> The backend will start on **`http://127.0.0.1:8000`**.

### 2. Start the Frontend Application (React Web App)
Open a **second** Command Prompt (`cmd`) window and run:

```cmd
cd "c:\Users\Amman kumar D\Downloads\Voice-Detector-main\Voice-Detector-main"
npm install
npm start
```

> The web app will launch automatically in your browser at **`http://localhost:3000`**.

---

## 🧠 Optional: Retraining the Model

To retrain the model locally using your audio recordings or external datasets:

```cmd
cd "c:\Users\Amman kumar D\Downloads\Voice-Detector-main\Voice-Detector-main\backend\foicedetect_backend"
scikit_venv\Scripts\activate
python audio_detection/train.py
```

---

Built with dedication to protect against voice-based fraud and deepfake threats.
