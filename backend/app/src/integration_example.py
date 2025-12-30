"""
AquaGuard Model Integration Example
==================================

This file demonstrates exactly how to integrate the improved AquaGuard model
with the backend API. Copy these patterns into your backend services.

Author: For Frontend Integration Team
"""

from Aquagaurd.backend.app.services.improved_model import ImprovedAquaGuardModel
import pandas as pd
import numpy as np
from pathlib import Path

class AquaGuardAPIService:
    """
    Service class that wraps the improved model for API integration.
    This is what your backend should implement.
    """
    
    def __init__(self):
        self.model = None
        self.df = None
        self.deployment_date = pd.to_datetime("2023-01-25")  # Adjust as needed
        
    def initialize_model(self):
        """Initialize the model and load data. Call this once at startup."""
        try:
            # Load the trained model
            self.model = ImprovedAquaGuardModel()
            self.model.load_models("models/aquaguard_model.pkl")
            
            # Load and preprocess data
            self.df = self.model.load_and_preprocess_data("data/water_consumption_cleaned.csv")
            
            print("✅ AquaGuard model initialized successfully")
            return True
            
        except Exception as e:
            print(f"❌ Failed to initialize model: {e}")
            return False
    
    def get_available_regions(self):
        """Get list of available regions."""
        if self.df is None:
            return []
        return list(self.df['region'].unique())
    
    def get_timeseries_data(self, region: str):
        """
        Get time series data for a specific region.
        Returns: List of dictionaries with date, actual, predicted, risk_score
        """
        if not self._validate_region(region):
            return []
        
        try:
            # Get predictions for the region
            results = self.model.predict_and_detect_anomalies(
                self.df, region, self.deployment_date
            )
            
            # Format for API response
            timeseries = []
            for _, row in results.iterrows():
                timeseries.append({
                    "date": row['date'].isoformat(),
                    "actual_usage": round(row['daily_usage'], 2),
                    "predicted_usage": round(row['predicted_usage'], 2),
                    "risk_score": round(row['combined_risk_score'], 2),
                    "is_anomaly": bool(row['is_anomaly_ml'])
                })
            
            return timeseries
            
        except Exception as e:
            print(f"Error getting timeseries for {region}: {e}")
            return []
    
    def get_risk_analysis(self, region: str):
        """
        Get detailed risk analysis for a specific region.
        Returns: Dictionary with risk metrics and recent anomalies
        """
        if not self._validate_region(region):
            return {}
        
        try:
            results = self.model.predict_and_detect_anomalies(
                self.df, region, self.deployment_date
            )
            
            # Calculate risk metrics
            current_risk = results["combined_risk_score"].iloc[-1]
            recent_peak = results.tail(14)["combined_risk_score"].quantile(0.9)
            avg_risk_7d = results.tail(7)["combined_risk_score"].mean()
            
            # Count recent anomalies
            recent_anomalies = results.tail(30)["is_anomaly_ml"].sum()
            
            # Risk trend (comparing last 7 days to previous 7 days)
            last_7d = results.tail(7)["combined_risk_score"].mean()
            prev_7d = results.tail(14).head(7)["combined_risk_score"].mean()
            trend = "increasing" if last_7d > prev_7d else "decreasing"
            
            return {
                "region": region,
                "current_risk_score": round(current_risk, 2),
                "recent_peak_risk": round(recent_peak, 2),
                "average_risk_7d": round(avg_risk_7d, 2),
                "recent_anomalies_30d": int(recent_anomalies),
                "risk_trend": trend,
                "last_updated": results["date"].iloc[-1].isoformat()
            }
            
        except Exception as e:
            print(f"Error getting risk analysis for {region}: {e}")
            return {}
    
    def get_regional_ranking(self, lookback_days=14):
        """
        Get regional ranking based on priority scores.
        This implements the exact logic from Test_new_model.py
        """
        if self.df is None or self.model is None:
            return []
        
        ranking_data = []
        
        try:
            for region in self.df["region"].unique():
                results = self.model.predict_and_detect_anomalies(
                    self.df, region, self.deployment_date
                )
                
                # Core metrics (from Test_new_model.py)
                current_risk = results["combined_risk_score"].iloc[-1]
                recent_peak = results.tail(lookback_days)["combined_risk_score"].quantile(0.9)
                
                # Risk level classification
                if recent_peak >= 70:
                    risk_level = "High"
                elif recent_peak >= 40:
                    risk_level = "Medium"
                else:
                    risk_level = "Low"
                
                # Persistence calculation
                persistence_days = (
                    (results["combined_risk_score"] >= 50)
                    .rolling(window=3)
                    .mean()
                    .iloc[-1] * 7
                )
                persistence_days = int(round(persistence_days))
                
                # Priority score construction
                persistence_days_scaled = min(persistence_days, 7) / 7 * 100
                priority_score = (
                    0.5 * recent_peak +
                    0.3 * persistence_days_scaled +
                    0.2 * current_risk
                )
                
                ranking_data.append({
                    "region": region,
                    "current_risk": round(current_risk, 2),
                    "recent_peak_risk": round(recent_peak, 2),
                    "risk_level": risk_level,
                    "persistence_days": int(persistence_days),
                    "priority_score": round(priority_score, 2)
                })
            
            # Sort by priority score (highest first)
            ranking_data.sort(key=lambda x: x["priority_score"], reverse=True)
            
            # Add inspection priority ranking
            for i, item in enumerate(ranking_data):
                item["inspection_priority"] = i + 1
            
            return ranking_data
            
        except Exception as e:
            print(f"Error generating regional ranking: {e}")
            return []
    
    def get_model_status(self):
        """Get model status and information."""
        if self.model is None:
            return {"status": "not_loaded", "error": "Model not initialized"}
        
        return {
            "status": "loaded",
            "model_type": "ImprovedAquaGuardModel",
            "regions_available": len(self.get_available_regions()),
            "deployment_date": self.deployment_date.isoformat(),
            "features": [
                "seasonality_modeling",
                "multi_region_support", 
                "ml_anomaly_detection",
                "adaptive_thresholds",
                "risk_scoring"
            ]
        }
    
    def _validate_region(self, region: str):
        """Validate that the region exists in the data."""
        if self.df is None:
            return False
        return region in self.df['region'].unique()


# =============================================================================
# EXAMPLE USAGE FOR BACKEND INTEGRATION
# =============================================================================

def example_fastapi_integration():
    """
    Example of how to integrate this with FastAPI.
    Copy this pattern into your backend/app/api/routes.py
    """
    
    # Initialize the service (do this once at startup)
    api_service = AquaGuardAPIService()
    success = api_service.initialize_model()
    
    if not success:
        print("❌ Failed to initialize model")
        return
    
    print("🚀 Testing API service methods...")
    
    # Test 1: Get available regions
    regions = api_service.get_available_regions()
    print(f"\n📍 Available regions: {regions}")
    
    # Test 2: Get regional ranking
    ranking = api_service.get_regional_ranking()
    print(f"\n🏆 Regional ranking (top 3):")
    for i, region_data in enumerate(ranking[:3]):
        print(f"  {i+1}. {region_data['region']}: {region_data['priority_score']} "
              f"({region_data['risk_level']} risk)")
    
    # Test 3: Get detailed analysis for highest priority region
    if ranking:
        top_region = ranking[0]['region']
        risk_analysis = api_service.get_risk_analysis(top_region)
        print(f"\n⚠️  Risk analysis for {top_region}:")
        print(f"  Current risk: {risk_analysis['current_risk_score']}")
        print(f"  Peak risk (14d): {risk_analysis['recent_peak_risk']}")
        print(f"  Recent anomalies: {risk_analysis['recent_anomalies_30d']}")
        print(f"  Trend: {risk_analysis['risk_trend']}")
    
    # Test 4: Get time series data (last 10 points)
    if ranking:
        timeseries = api_service.get_timeseries_data(top_region)
        print(f"\n📈 Recent time series for {top_region} (last 5 points):")
        for point in timeseries[-5:]:
            print(f"  {point['date'][:10]}: Actual={point['actual_usage']:.0f}, "
                  f"Risk={point['risk_score']:.1f}")
    
    # Test 5: Model status
    status = api_service.get_model_status()
    print(f"\n🔧 Model status: {status['status']}")
    print(f"   Features: {', '.join(status['features'])}")


# =============================================================================
# FASTAPI ROUTE EXAMPLES
# =============================================================================

def example_fastapi_routes():
    """
    Example FastAPI routes. Copy these into backend/app/api/routes.py
    """
    
    # Initialize service globally (in your main app)
    api_service = AquaGuardAPIService()
    api_service.initialize_model()
    
    # Example routes:
    
    """
    @router.get("/regions")
    def get_regions():
        return api_service.get_available_regions()
    
    @router.get("/ranking")
    def get_ranking():
        return api_service.get_regional_ranking()
    
    @router.get("/timeseries/{region}")
    def get_timeseries(region: str):
        return api_service.get_timeseries_data(region)
    
    @router.get("/risk/{region}")
    def get_risk_analysis(region: str):
        return api_service.get_risk_analysis(region)
    
    @router.get("/model/status")
    def get_model_status():
        return api_service.get_model_status()
    """


if __name__ == "__main__":
    print("🧪 Running AquaGuard Integration Example...")
    example_fastapi_integration()
    
    print("\n" + "="*60)
    print("INTEGRATION COMPLETE ✅")
    print("="*60)
    print("\nNext steps for your teammate:")
    print("1. Copy AquaGuardAPIService class to backend/app/services/")
    print("2. Update routes.py to use the service methods")
    print("3. Initialize the service once at app startup")
    print("4. Test the API endpoints")
    print("5. Connect frontend to the new API responses")