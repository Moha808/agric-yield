from fastapi import APIRouter, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from services.model_service import model_registry

router = APIRouter(prefix="/predict", tags=["Disease Detection"])

@router.post("/disease")
async def predict_crop_disease(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Uploaded file must be an image (JPEG, PNG, WebP).")
    
    contents = await file.read()
    if len(contents) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large. Maximum size is 10MB.")
        
    result = model_registry.predict_disease_image(contents)
    if not result.get("success"):
        return JSONResponse(status_code=422, content=result)
        
    return result
