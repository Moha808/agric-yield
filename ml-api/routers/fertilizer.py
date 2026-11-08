from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Dict, Any
from services.fertilizer_service import analyze_fertilizer

router = APIRouter(prefix="/predict", tags=["Fertilizer Suggestion"])

class FertilizerRequest(BaseModel):
    crop: str = Field(..., description="Crop type: 'potato' or 'tomato'")
    n: float = Field(..., ge=0, le=400, description="Soil Nitrogen level")
    p: float = Field(..., ge=0, le=300, description="Soil Phosphorus level")
    k: float = Field(..., ge=0, le=450, description="Soil Potassium level")

@router.post("/fertilizer")
async def recommend_fertilizer(payload: FertilizerRequest):
    crop_lower = payload.crop.strip().lower()
    if crop_lower not in ["potato", "tomato", "potatoes", "tomatoes"]:
        raise HTTPException(status_code=400, detail="Only 'potato' and 'tomato' are supported in scope.")

    analysis = analyze_fertilizer(crop_lower, payload.n, payload.p, payload.k)
    return analysis
