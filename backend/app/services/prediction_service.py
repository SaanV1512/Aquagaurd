import pandas as pd
from app.services.model_service import load_model

def compute_predictions(df: pd.DataFrame) -> pd.DataFrame:
    model = load_model()

    # Example (replace with real features)
    X = df[["consumption"]]
    df["predicted"] = model.predict(X)
    df["residual"] = abs(df["consumption"] - df["predicted"])

    return df


def compute_risk(df: pd.DataFrame) -> pd.DataFrame:
    df["risk_score"] = df["residual"] / df["residual"].max()
    df["status"] = pd.cut(
        df["risk_score"],
        bins=[0, 0.4, 0.7, 1],
        labels=["LOW", "MEDIUM", "HIGH"]
    )
    return df
