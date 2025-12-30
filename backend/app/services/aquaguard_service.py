import pandas as pd
from app.services.improved_model import ImprovedAquaGuardModel


class AquaGuardService:
    def __init__(self):
        self.model = None
        self.df = None
        self.deployment_date = pd.to_datetime("2023-01-25")

    def initialize_model(self):
        self.model = ImprovedAquaGuardModel()
        self.model.load_models("models/aquaguard_model.pkl")
        self.df = self.model.load_and_preprocess_data(
            "data/water_consumption_cleaned.csv"
        )

    def get_available_regions(self):
        return sorted(self.df["region"].unique().tolist())

    def get_timeseries_data(self, region: str):
        results = self.model.predict_and_detect_anomalies(
            self.df, region, self.deployment_date
        )

        return [
            {
                "date": row["date"].isoformat(),
                "actual_usage": round(row["daily_usage"], 2),
                "predicted_usage": round(row["predicted_usage"], 2),
                "risk_score": round(row["combined_risk_score"], 2),
                "is_anomaly": bool(row["is_anomaly_ml"]),
            }
            for _, row in results.iterrows()
        ]

    def get_risk_analysis(self, region: str):
        results = self.model.predict_and_detect_anomalies(
            self.df, region, self.deployment_date
        )

        current_risk = results["combined_risk_score"].iloc[-1]
        recent_peak = results.tail(14)["combined_risk_score"].quantile(0.9)
        average_risk_7d = results.tail(7)["combined_risk_score"].mean()
        recent_anomalies = int(results.tail(30)["is_anomaly_ml"].sum())

        last_7 = results.tail(7)["combined_risk_score"].mean()
        prev_7 = results.tail(14).head(7)["combined_risk_score"].mean()

        return {
            "region": region,
            "current_risk_score": round(current_risk, 2),
            "recent_peak_risk": round(recent_peak, 2),
            "average_risk_7d": round(average_risk_7d, 2),
            "recent_anomalies_30d": recent_anomalies,
            "risk_trend": "increasing" if last_7 > prev_7 else "decreasing",
            "last_updated": results["date"].iloc[-1].isoformat()
        }

    def get_regional_ranking(self):
        ranking = []

        for region in self.df["region"].unique():
            results = self.model.predict_and_detect_anomalies(
                self.df, region, self.deployment_date
            )

            current = results["combined_risk_score"].iloc[-1]
            peak = results.tail(14)["combined_risk_score"].quantile(0.9)
            
            # Calculate persistence days
            persistence_days = (
                (results["combined_risk_score"] >= 50)
                .rolling(window=3)
                .mean()
                .iloc[-1] * 7
            )
            persistence_days = int(round(persistence_days))

            if peak >= 70:
                risk_level = "High"
            elif peak >= 40:
                risk_level = "Medium"
            else:
                risk_level = "Low"

            # Priority score calculation (matching Test_new_model.py)
            persistence_days_scaled = min(persistence_days, 7) / 7 * 100
            priority = (
                0.5 * peak +
                0.3 * persistence_days_scaled +
                0.2 * current
            )

            ranking.append({
                "region": region,
                "current_risk": round(current, 2),
                "recent_peak_risk": round(peak, 2),
                "risk_level": risk_level,
                "persistence_days": persistence_days,
                "priority_score": round(priority, 2),
            })

        ranking.sort(key=lambda x: x["priority_score"], reverse=True)

        for i, r in enumerate(ranking):
            r["inspection_priority"] = i + 1

        return ranking

    def get_model_status(self):
        return {
            "status": "loaded",
            "model_type": "ImprovedAquaGuardModel",
            "regions_available": len(self.get_available_regions()),
        }


# SINGLETON INSTANCE
aquaguard_service = AquaGuardService()
aquaguard_service.initialize_model()
