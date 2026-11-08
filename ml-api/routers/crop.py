from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Dict, Any
from services.model_service import model_registry

router = APIRouter(prefix="/predict", tags=["Crop Recommendation"])

class CropRequest(BaseModel):
    n: float = Field(..., ge=0, le=300, description="Soil Nitrogen content (kg/ha or mg/kg)")
    p: float = Field(..., ge=0, le=250, description="Soil Phosphorus content (kg/ha or mg/kg)")
    k: float = Field(..., ge=0, le=350, description="Soil Potassium content (kg/ha or mg/kg)")
    temperature: float = Field(..., ge=-5, le=55, description="Ambient Temperature in Celsius")
    humidity: float = Field(..., ge=0, le=100, description="Relative Humidity percentage")
    ph: float = Field(..., ge=3.0, le=10.0, description="Soil pH value")
    rainfall: float = Field(..., ge=0, le=500, description="Rainfall in mm")

class CropPredictionResponse(BaseModel):
    recommendations: List[Dict[str, Any]]
    plateau_context: Dict[str, Any]
    input_received: Dict[str, float]

@router.post("/crop", response_model=CropPredictionResponse)
async def recommend_crop(data: CropRequest):
    recs = model_registry.predict_crop(
        n=data.n,
        p=data.p,
        k=data.k,
        temp=data.temperature,
        humidity=data.humidity,
        ph=data.ph,
        rainfall=data.rainfall
    )

    # Explanation of Potato and Tomato suitability specifically for Jos South smallholders
    has_potato = any(r["crop"].lower() == "potato" for r in recs)
    has_tomato = any(r["crop"].lower() == "tomato" for r in recs)

    explanation = []
    hausa_explanation = []
    if data.temperature <= 22.0 and data.ph <= 6.5:
        explanation.append("Jos South's cool plateau temperatures and slightly acidic soil provide ideal microclimates for Irish Potato tuberization.")
        hausa_explanation.append("Yanayin sanyin Jos South da kasar noma mai kyau sun dace sosai da noman Dankalin Turawa.")
    if 18.0 <= data.temperature <= 28.0 and data.humidity <= 80:
        explanation.append("Tomato thrives in this moderate temperature and manageable humidity range, reducing foliar fungal pressures.")
        hausa_explanation.append("Tumatur yana da matukar dacewa da wannan yanayin sanyi da danshi ba tare da damuwar cututtuka ba.")
    if not explanation:
        explanation.append("Current soil and climate inputs favor diverse highland crops; potato/tomato can flourish with optimal water control.")
        hausa_explanation.append("Kasar da yanayin suna da kyau ga amfanin gona; ana iya samun babban amfanin dankali ko tumatur tare da kyakkyawan shayarwa.")

    return {
        "recommendations": recs,
        "plateau_context": {
            "has_potato": has_potato,
            "has_tomato": has_tomato,
            "explanation": " ".join(explanation),
            "hausa_explanation": " ".join(hausa_explanation),
            "region": "Jos South, Plateau State, Nigeria"
        },
        "input_received": data.model_dump()
    }
