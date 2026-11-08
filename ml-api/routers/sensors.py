import os
import time
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, HTTPException, Header, Depends
from pydantic import BaseModel, Field

router = APIRouter(prefix="/api/sensors", tags=["IoT Sensor Ingestion"])

# In-memory buffer for local testing / cache when Firestore service key is not configured
IN_MEMORY_SENSOR_CACHE: List[Dict[str, Any]] = []

class SensorReadingPayload(BaseModel):
    device_key: Optional[str] = Field("manual_web_entry", description="Device authentication key")
    farmer_id: Optional[str] = Field(None, description="Associated farmer ID")
    soil_moisture: float = Field(..., ge=0, le=100, description="Volumetric Soil Moisture (%)")
    soil_temp: float = Field(..., ge=-10, le=65, description="Soil Temperature (°C)")
    air_temp: float = Field(..., ge=-10, le=60, description="Ambient Air Temperature (°C)")
    humidity: float = Field(..., ge=0, le=100, description="Relative Humidity (%)")
    timestamp: Optional[str] = Field(None, description="ISO timestamp")

@router.post("")
async def ingest_sensor_reading(payload: SensorReadingPayload):
    # Validate device key: allow configured key, default secrets, or web dashboard manual entries
    expected_key = os.getenv("IOT_DEVICE_KEY", "agri_yield_jos_secret_2026")
    allowed_keys = {
        expected_key,
        "agri_yield_jos_secret_2026",
        "test_device_key",
        "manual_web_entry",
        "",
        None
    }
    if payload.device_key not in allowed_keys and payload.device_key != expected_key:
        raise HTTPException(status_code=401, detail="Invalid IoT device key.")

    now_iso = payload.timestamp or datetime.now(timezone.utc).isoformat()
    record = {
        "farmer_id": payload.farmer_id,
        "soil_moisture": round(payload.soil_moisture, 2),
        "soil_temp": round(payload.soil_temp, 2),
        "air_temp": round(payload.air_temp, 2),
        "humidity": round(payload.humidity, 2),
        "timestamp": now_iso,
        "received_at": datetime.now(timezone.utc).isoformat()
    }

    # If Firebase Admin SDK is available and initialized, write to Firestore
    firestore_written = False
    try:
        import firebase_admin
        from firebase_admin import firestore
        db = firestore.client()
        db.collection("sensorReadings").add(record)
        firestore_written = True
    except Exception:
        # Gracefully keep in memory buffer if firebase-admin credentials are not locally loaded
        IN_MEMORY_SENSOR_CACHE.append(record)
        if len(IN_MEMORY_SENSOR_CACHE) > 500:
            IN_MEMORY_SENSOR_CACHE.pop(0)

    # Return resource optimization hint based on current reading
    irrigation_advice = "Normal irrigation schedule"
    hausa_advice = "Yanayin danshi yana da kyau"
    if payload.soil_moisture < 40.0:
        irrigation_advice = "URGENT: Soil moisture is critical (<40%). Apply 20mm irrigation early tomorrow morning."
        hausa_advice = "Gaggawa: Kasar ta bushe sosai (<40%). Shayar da amfanin gona da sassafe."
    elif payload.soil_moisture > 80.0:
        irrigation_advice = "Soil moisture high (>80%). Pause irrigation to prevent root rot / late blight."
        hausa_advice = "Danshi ya yi yawa (>80%). Dakatar da shayarwa don hana rubewar saiwa."

    return {
        "status": "success",
        "message": "Sensor reading recorded successfully",
        "firestore_saved": firestore_written,
        "advice": irrigation_advice,
        "hausa_advice": hausa_advice,
        "data": record
    }

@router.get("/latest")
async def get_latest_readings(farmer_id: Optional[str] = None, limit: int = 20):
    # Try Firestore first if available
    try:
        import firebase_admin
        from firebase_admin import firestore
        db = firestore.client()
        query = db.collection("sensorReadings")
        if farmer_id:
            query = query.where("farmer_id", "==", farmer_id)
        query = query.order_by("timestamp", direction=firestore.Query.DESCENDING).limit(limit)
        docs = query.stream()
        results = [d.to_dict() for d in docs]
        if results:
            return {"source": "firestore", "readings": results}
    except Exception:
        pass

    # Fallback to in-memory cache
    filtered = [r for r in IN_MEMORY_SENSOR_CACHE if not farmer_id or r.get("farmer_id") == farmer_id]
    if not filtered:
        return {"source": "empty", "readings": []}

    return {"source": "in_memory", "readings": list(reversed(filtered[-limit:]))}
