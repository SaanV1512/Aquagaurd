from fastapi import APIRouter
from app.services.data_service import load_timeseries, load_risk_scores

router = APIRouter()

@router.get("/health")
def health():
    return {"status": "ok"}

@router.get("/regions")
def regions():
    df = load_risk_scores()
    return sorted(df["region"].unique().tolist())

@router.get("/timeseries/{region}")
def timeseries(region: str):
    df = load_timeseries(region)
    return df.to_dict(orient="records")

@router.get("/risk/{region}")
def risk(region: str):
    df = load_risk_scores()
    r = df[df["region"] == region]
    if r.empty:
        return []
    return r.sort_values("date").to_dict(orient="records")

@router.get("/ranking")
def ranking():
    df = load_risk_scores()
    latest = df.sort_values("date").groupby("region").tail(1)
    return latest.sort_values("risk_score", ascending=False)\
                 [["region", "risk_score", "status"]]\
                 .to_dict(orient="records")
