import pandas as pd
from pathlib import Path
from app.services.prediction_service import compute_predictions, compute_risk

BASE_DIR = Path(__file__).resolve().parents[3]
OUT = BASE_DIR / "outputs"

def load_timeseries(region):
    path = OUT / "timeseries.csv"
    if not path.exists():
        return pd.DataFrame()
    df = pd.read_csv(path)
    return df[df["region"] == region]

def load_risk_scores():
    path = OUT / "risk_scores.csv"

    if path.exists():
        return pd.read_csv(path)

    raw = pd.read_csv(OUT / "timeseries.csv")
    df = compute_predictions(raw)
    df = compute_risk(df)
    return df