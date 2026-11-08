"""
Crop Recommendation Model Training Script
AgriYield AI - Jos South, Plateau State, Nigeria
Model: Random Forest Classifier
Features: N, P, K, temperature, humidity, pH, rainfall
Target: Recommended Crop
"""

import os
import json
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score, f1_score, confusion_matrix
import joblib

def generate_crop_dataset(samples_per_crop=300):
    np.random.seed(42)
    crops_profile = {
        "potato": {"N": (100, 160), "P": (70, 110), "K": (140, 200), "temp": (15, 22), "hum": (50, 75), "ph": (5.0, 6.5), "rain": (80, 140)},
        "tomato": {"N": (90, 140), "P": (50, 90), "K": (90, 150), "temp": (20, 27), "hum": (55, 80), "ph": (6.0, 7.0), "rain": (60, 110)},
        "maize":  {"N": (60, 100), "P": (35, 60), "K": (30, 60),  "temp": (22, 30), "hum": (50, 75), "ph": (5.8, 7.2), "rain": (90, 160)},
        "rice":   {"N": (70, 110), "P": (30, 50), "K": (30, 50),  "temp": (24, 33), "hum": (75, 95), "ph": (5.5, 7.0), "rain": (180, 280)},
        "cabbage":{"N": (120, 170),"P": (60, 90), "K": (110, 160),"temp": (14, 21), "hum": (65, 85), "ph": (6.0, 6.8), "rain": (90, 150)}
    }

    data = []
    for crop, prof in crops_profile.items():
        for _ in range(samples_per_crop):
            n = np.random.uniform(*prof["N"])
            p = np.random.uniform(*prof["P"])
            k = np.random.uniform(*prof["K"])
            temp = np.random.uniform(*prof["temp"])
            hum = np.random.uniform(*prof["hum"])
            ph = np.random.uniform(*prof["ph"])
            rain = np.random.uniform(*prof["rain"])
            data.append([n, p, k, temp, hum, ph, rain, crop])

    df = pd.DataFrame(data, columns=["N", "P", "K", "temperature", "humidity", "ph", "rainfall", "crop"])
    return df

def train():
    print("Generating training dataset for Crop Recommendation...")
    df = generate_crop_dataset(samples_per_crop=400)
    
    X = df[["N", "P", "K", "temperature", "humidity", "ph", "rainfall"]]
    y = df["crop"]
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    print(f"Training Random Forest with {len(X_train)} samples across {y.nunique()} crops...")
    rf = RandomForestClassifier(n_estimators=100, max_depth=12, random_state=42)
    rf.fit(X_train, y_train)
    
    y_pred = rf.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred, average="weighted")
    cm = confusion_matrix(y_test, y_pred, labels=rf.classes_).tolist()
    
    feature_importances = sorted(
        [{"feature": col, "importance": round(float(imp), 4)} for col, imp in zip(X.columns, rf.feature_importances_)],
        key=lambda x: x["importance"],
        reverse=True
    )
    
    print(f"Model Accuracy: {acc * 100:.2f}% | Weighted F1: {f1 * 100:.2f}%")
    print("Feature Importances:")
    for item in feature_importances:
        print(f"  {item['feature']:<12}: {item['importance']:.4f}")
        
    # Save model and artifacts
    os.makedirs("ml-api/models", exist_ok=True)
    out_path = "ml-api/models/crop_recommendation_rf.joblib"
    joblib.dump({"model": rf, "classes": list(rf.classes_)}, out_path)
    print(f"Model saved to {out_path}")
    
    metrics = {
        "accuracy": round(float(acc), 4),
        "f1_score": round(float(f1), 4),
        "feature_importances": feature_importances,
        "classes": list(rf.classes_),
        "confusion_matrix": cm
    }
    with open("ml-training/crop_model_metrics.json", "w") as f:
        json.dump(metrics, f, indent=2)
    print("Metrics written to ml-training/crop_model_metrics.json")

if __name__ == "__main__":
    train()
