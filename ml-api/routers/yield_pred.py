from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from services.model_service import model_registry

router = APIRouter(prefix="/predict", tags=["Yield Prediction"])

class YieldRequest(BaseModel):
    crop: str = Field(..., description="Crop: 'potato' or 'tomato'")
    farm_size: float = Field(..., gt=0, le=500, description="Farm size in acres")
    temperature: float = Field(..., ge=-5, le=55, description="Mean temperature (°C)")
    rainfall: float = Field(..., ge=0, le=600, description="Rainfall (mm)")
    humidity: float = Field(..., ge=0, le=100, description="Relative humidity (%)")
    n: float = Field(..., ge=0, le=400, description="Nitrogen value")
    p: float = Field(..., ge=0, le=300, description="Phosphorus value")
    k: float = Field(..., ge=0, le=450, description="Potassium value")
    ph: float = Field(..., ge=3.5, le=9.5, description="Soil pH value")
    soil_moisture: Optional[float] = Field(None, ge=0, le=100, description="Soil moisture percentage (from sensor if available)")

@router.post("/yield")
async def predict_yield(payload: YieldRequest):
    crop_lower = payload.crop.strip().lower()
    if crop_lower not in ["potato", "tomato", "potatoes", "tomatoes"]:
        raise HTTPException(status_code=400, detail="Only 'potato' and 'tomato' are supported in scope.")

    prediction = model_registry.predict_yield(
        crop=crop_lower,
        farm_size=payload.farm_size,
        temp=payload.temperature,
        rainfall=payload.rainfall,
        humidity=payload.humidity,
        n=payload.n,
        p=payload.p,
        k=payload.k,
        ph=payload.ph,
        soil_moisture=payload.soil_moisture
    )
    return prediction
