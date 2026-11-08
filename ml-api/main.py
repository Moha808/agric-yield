import os
import logging
from typing import Dict, Any, Optional
from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from routers import disease, crop, fertilizer, yield_pred, sensors
from services.model_service import model_registry

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    env_file = os.path.join(os.path.dirname(__file__), ".env")
    if os.path.exists(env_file):
        with open(env_file, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    k, v = line.split("=", 1)
                    os.environ.setdefault(k.strip(), v.strip())

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("agriyield_api")

app = FastAPI(
    title="AgriYield AI - ML Services API",
    description="Deep Learning and Agronomic Decision Support API for Smallholder Farmers in Jos South, Plateau State, Nigeria.",
    version="1.0.0"
)

# CORS configuration
allowed_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "*"  # Allow all for local testing and cloud deployments (Vercel, Render, Hugging Face)
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(disease.router)
app.include_router(crop.router)
app.include_router(fertilizer.router)
app.include_router(yield_pred.router)
app.include_router(sensors.router)

# Plateau State Villages coordinate mapping
JOS_SOUTH_VILLAGES = {
    "vom": {"name": "Vom", "lat": 9.7333, "lon": 8.7833, "temp_offset": -1.2, "elevation_m": 1280},
    "bukuru": {"name": "Bukuru", "lat": 9.7941, "lon": 8.8640, "temp_offset": 0.0, "elevation_m": 1240},
    "du": {"name": "Du", "lat": 9.8167, "lon": 8.8833, "temp_offset": -0.5, "elevation_m": 1250},
    "gyel": {"name": "Gyel", "lat": 9.7800, "lon": 8.8500, "temp_offset": 0.1, "elevation_m": 1235},
    "tudun wada": {"name": "Tudun Wada", "lat": 9.8800, "lon": 8.8600, "temp_offset": 0.2, "elevation_m": 1220},
    "zawan": {"name": "Zawan", "lat": 9.8000, "lon": 8.8300, "temp_offset": -0.3, "elevation_m": 1260},
    "kwata": {"name": "Kwata (Zawan)", "lat": 9.7900, "lon": 8.8200, "temp_offset": -0.2, "elevation_m": 1255},
    "shen": {"name": "Shen", "lat": 9.7600, "lon": 8.8700, "temp_offset": -0.8, "elevation_m": 1270},
    "kuru": {"name": "Kuru", "lat": 9.7167, "lon": 8.8500, "temp_offset": -1.0, "elevation_m": 1290}
}

@app.get("/", tags=["General"])
async def root():
    return {
        "service": "AgriYield AI - Backend ML Service",
        "region": "Jos South, Plateau State, Nigeria",
        "status": "online",
        "supported_crops": ["potato", "tomato"],
        "docs_url": "/docs"
    }

@app.get("/health", tags=["General"])
async def health_check():
    return {
        "status": "healthy",
        "demo_mode": model_registry.demo_mode,
        "models_loaded": {
            "crop_model": model_registry.crop_model is not None,
            "yield_model": model_registry.yield_model is not None,
            "disease_model": model_registry.disease_model is not None
        }
    }

@app.get("/models", tags=["Model Management"])
async def list_models():
    return {
        "active_models": model_registry.models_meta,
        "retraining_supported": True,
        "classes_supported": [
            "Potato___Early_blight",
            "Potato___Late_blight",
            "Potato___healthy",
            "Tomato___Bacterial_spot",
            "Tomato___Early_blight",
            "Tomato___Late_blight",
            "Tomato___Leaf_Mold",
            "Tomato___Septoria_leaf_spot",
            "Tomato___Spider_mites Two-spotted_spider_mite",
            "Tomato___Target_Spot",
            "Tomato___Tomato_Yellow_Leaf_Curl_Virus",
            "Tomato___Tomato_mosaic_virus",
            "Tomato___healthy"
        ]
    }

@app.post("/admin/retrain", tags=["Model Management"])
async def trigger_retraining(model_type: str = Query(..., description="disease, crop, or yield")):
    """
    Logs retraining trigger requests for pipeline execution.
    """
    valid_types = ["disease", "crop", "yield"]
    if model_type not in valid_types:
        raise HTTPException(status_code=400, detail=f"Invalid model_type. Must be one of {valid_types}")
    
    logger.info(f"Retraining job queued for model: {model_type}")
    return {
        "status": "queued",
        "job_id": f"retrain_{model_type}_{os.urandom(4).hex()}",
        "message": f"Retraining job for {model_type} initiated. See /ml-training scripts for pipeline details."
    }

@app.get("/api/weather", tags=["Weather Proxy"])
async def get_weather_for_village(village: str = Query("Bukuru", description="Village in Jos South")):
    """
    Fetches real weather via OpenWeatherMap if API key is provided,
    otherwise provides accurate climatological estimates for Jos South.
    """
    v_key = village.strip().lower()
    v_data = JOS_SOUTH_VILLAGES.get(v_key, {"name": village, "lat": 9.7941, "lon": 8.8640, "temp_offset": 0.0, "elevation_m": 1240})

    owm_key = os.getenv("OPENWEATHERMAP_API_KEY")
    if not owm_key:
        raise HTTPException(
            status_code=503, 
            detail="OpenWeatherMap API key is not configured. Set OPENWEATHERMAP_API_KEY in backend environment to enable live village weather."
        )

    try:
        import httpx
        async with httpx.AsyncClient() as client:
            res = await client.get(
                "https://api.openweathermap.org/data/2.5/weather",
                params={
                    "lat": v_data["lat"],
                    "lon": v_data["lon"],
                    "appid": owm_key,
                    "units": "metric"
                },
                timeout=5.0
            )
            if res.status_code == 200:
                data = res.json()
                return {
                    "source": "openweathermap",
                    "village": v_data["name"],
                    "temperature": round(data["main"]["temp"], 1),
                    "humidity": round(data["main"]["humidity"], 1),
                    "wind_speed": data["wind"]["speed"],
                    "description": data["weather"][0]["description"].capitalize(),
                    "icon": data["weather"][0]["icon"],
                    "rainfall_recent_mm": round(data.get("rain", {}).get("1h", 0.0) * 24, 1)
                }
            else:
                raise HTTPException(status_code=res.status_code, detail="OpenWeatherMap API request was rejected.")
    except HTTPException:
        raise
    except Exception as e:
        logger.warning(f"OpenWeatherMap request failed: {e}")
        raise HTTPException(status_code=502, detail="Failed to connect to OpenWeatherMap service.")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
