from fastapi import APIRouter
from app.services.aquaguard_service import AquaGuardService
from app.services.data_simulator import simulator
from datetime import timedelta

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
def model_status():
    return aquaguard_service.get_model_status()

# Real-time risk monitoring endpoints
@router.get("/live/current")
def get_live_risk_data():
    """Get current real-time risk monitoring for all regions"""
    return simulator.get_all_regions_data()

@router.get("/live/region/{region}")
def get_live_region_risk(region: str):
    """Get current real-time risk monitoring for specific region"""
    return simulator.get_current_consumption(region)

@router.get("/live/elevated")
def get_elevated_risk_regions():
    """Get all regions with currently elevated risk"""
    elevated_regions = []
    for region in simulator.regions:
        if region in simulator.elevated_risk_periods:
            risk_info = simulator.elevated_risk_periods[region]
            elevated_regions.append({
                "region": region,
                "type": risk_info["type"],
                "start_time": risk_info["start_time"].isoformat(),
                "estimated_end": (risk_info["start_time"] + 
                                timedelta(hours=risk_info["duration_hours"])).isoformat(),
                "severity": risk_info["severity"].title(),
                "pattern": risk_info["pattern"]
            })
    return elevated_regions
