from fastapi import APIRouter
from app.services.aquaguard_service import AquaGuardService
from app.services.data_simulator import simulator
from datetime import timedelta, datetime
import random

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

@router.get("/live/test")
def test_live():
    """Simple test endpoint"""
    return {"status": "working"}

# Real-time risk monitoring endpoints
@router.get("/live/current")
def get_live_risk_data():
    """Get current real-time risk monitoring for all regions"""
    return simulator.get_all_regions_data()

@router.get("/live/ranking")
def get_live_ranking():
    """Get live ranking based on current risk data"""
    try:
        live_data = simulator.get_all_regions_data()
        
        # Calculate priority scores and rank regions
        ranking = []
        for data in live_data:
            # Priority calculation based on risk score, status, and persistence
            base_priority = data["risk_score"]
            
            # Boost priority for elevated risk status
            if data["risk_status"] == "elevated":
                base_priority += 20
            elif data["risk_status"] == "new_elevation":
                base_priority += 30
                
            # Add persistence factor if available
            if data["risk_info"] and "start_time" in data["risk_info"]:
                start_time = data["risk_info"]["start_time"]
                if isinstance(start_time, str):
                    start_time = datetime.fromisoformat(start_time)
                hours_elapsed = (datetime.now() - start_time).total_seconds() / 3600
                persistence_days = min(hours_elapsed / 24, 7)  # Cap at 7 days
                base_priority += persistence_days * 5
            else:
                persistence_days = 0
                
            # Determine risk level
            if data["risk_score"] >= 70:
                risk_level = "High"
            elif data["risk_score"] >= 50:
                risk_level = "Medium"
            else:
                risk_level = "Low"
                
            ranking.append({
                "region": data["region"],
                "current_risk": data["risk_score"],
                "recent_peak_risk": data["risk_score"] + random.uniform(0, 15),  # Simulate recent peak
                "risk_level": risk_level,
                "persistence_days": int(persistence_days),
                "priority_score": round(base_priority, 2),
                "risk_status": data["risk_status"],
                "last_updated": data["timestamp"]
            })
        
        # Sort by priority score (highest first)
        ranking.sort(key=lambda x: x["priority_score"], reverse=True)
        
        # Add inspection priority ranks
        for i, region in enumerate(ranking):
            region["inspection_priority"] = i + 1
            
        return ranking
    except Exception as e:
        return {"error": str(e)}

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
