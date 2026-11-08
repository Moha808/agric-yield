import os
import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_health():
    res = client.get("/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"

def test_models_endpoint():
    res = client.get("/models")
    assert res.status_code == 200
    data = res.json()
    assert "active_models" in data
    assert "classes_supported" in data
    assert len(data["classes_supported"]) == 13

def test_crop_prediction_validation():
    # Valid request
    payload = {
        "n": 120.0,
        "p": 80.0,
        "k": 150.0,
        "temperature": 21.0,
        "humidity": 60.0,
        "ph": 5.8,
        "rainfall": 110.0
    }
    res = client.post("/predict/crop", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert len(data["recommendations"]) > 0
    assert "plateau_context" in data

    # Invalid request (negative pH)
    bad_payload = dict(payload)
    bad_payload["ph"] = 1.0
    res_bad = client.post("/predict/crop", json=bad_payload)
    assert res_bad.status_code == 422

def test_fertilizer_prediction():
    payload = {
        "crop": "potato",
        "n": 60.0,
        "p": 90.0,
        "k": 170.0
    }
    res = client.post("/predict/fertilizer", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["status_key"] == "N_low"

def test_yield_prediction():
    payload = {
        "crop": "potato",
        "farm_size": 2.5,
        "temperature": 20.0,
        "rainfall": 100.0,
        "humidity": 65.0,
        "n": 130.0,
        "p": 90.0,
        "k": 170.0,
        "ph": 5.8
    }
    res = client.post("/predict/yield", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["yield_kg_per_acre"] > 0
    assert data["total_expected_yield_kg"] > 0
    assert "interpretation" in data

def test_sensor_ingestion():
    payload = {
        "device_key": os.getenv("IOT_DEVICE_KEY", "test_device_key"),
        "farmer_id": "test_farmer_1",
        "soil_moisture": 32.5,
        "soil_temp": 19.8,
        "air_temp": 22.1,
        "humidity": 55.0
    }
    res = client.post("/api/sensors", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "success"
    assert "URGENT" in data["advice"] or "shayarwa" in data["hausa_advice"]
