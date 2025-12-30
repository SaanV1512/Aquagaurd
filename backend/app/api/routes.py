from fastapi import APIRouter
from app.services.aquaguard_service import AquaGuardService

router = APIRouter()
aquaguard_service = AquaGuardService()
aquaguard_service.initialize_model()

@router.get("/regions")
def regions():
    return aquaguard_service.get_available_regions()

@router.get("/timeseries/{region}")
def timeseries(region: str):
    return aquaguard_service.get_timeseries_data(region)

@router.get("/risk/{region}")
def risk(region: str):
    return aquaguard_service.get_risk_analysis(region)

@router.get("/ranking")
def rank():
    return aquaguard_service.get_regional_ranking()
@router.get("/models/status")
def rank():
    return aquaguard_service.get_model_status()
