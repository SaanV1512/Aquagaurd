from Aquagaurd.backend.app.services.improved_model import ImprovedAquaGuardModel
import pandas as pd
import numpy as np
pd.set_option("display.max_columns", None)
pd.set_option("display.width", None)
model = ImprovedAquaGuardModel()
model.load_models("models/aquaguard_model.pkl")

# Injecting leaks just for testing
def inject_synthetic_leak(
    df,
    region,
    start_date,
    leak_fraction=0.3,
    noise_fraction=0.1
):
    df = df.copy()

    mask = (
        (df["region"] == region) &
        (df["date"] >= pd.to_datetime(start_date))
    )
    base = df.loc[mask, "daily_usage"]
    noise = np.random.normal(
        loc=0,
        scale=noise_fraction * base.std(),
        size=len(base)
    )

    df.loc[mask, "daily_usage"] = base * (1 + leak_fraction) + noise
    return df
df_all = model.load_and_preprocess_data(
    "data/water_consumption_cleaned.csv"
)

deployment_date = pd.to_datetime("2023-01-25")
df_history = df_all[df_all["date"] <= deployment_date]
df_live = df_all[df_all["date"] > deployment_date]
df_live_leak = inject_synthetic_leak(
    df_live,
    region="West",
    start_date="2023-02-01",
    leak_fraction=0.3,
    noise_fraction=0.1
)



df_eval = (
    pd.concat([df_history, df_live_leak])
    .sort_values("date")
    .reset_index(drop=True)
)
def generate_region_risk_table(model, df, deployment_date, lookback_days=14):
    rows = []

    for region in df["region"].unique():
        res = model.predict_and_detect_anomalies(
            df, region, deployment_date
        )



        current_risk = res["combined_risk_score"].iloc[-1]
        recent_peak = res.tail(lookback_days)["combined_risk_score"].quantile(0.9)
        if recent_peak >= 70:
            risk_level = "High"
        elif recent_peak >= 40:
            risk_level = "Medium"
        else:
            risk_level = "Low"



        persistence_days = (
        (res["combined_risk_score"] >= 50)
        .rolling(window=3)
        .mean()
        .iloc[-1] * 7
        )
        persistence_days = int(round(persistence_days))
        persistence_days_scaled = min(persistence_days, 7) / 7 * 100
        priority_score = (
            0.5 * recent_peak +
            0.3 * persistence_days_scaled +
            0.2 * current_risk
        )
        rows.append({
            "region": region,
            "current_risk": round(current_risk, 2),
            "recent_peak_risk": round(recent_peak, 2),
            "risk_level": risk_level,
            "persistence_days": int(persistence_days),
            "priority_score": round(priority_score, 2)
        })
    out = pd.DataFrame(rows)
    out = out.sort_values("priority_score", ascending=False).reset_index(drop=True)
    out["inspection_priority"] = range(1, len(out) + 1)
    return out

risk_table = generate_region_risk_table(
    model,
    df_eval,
    deployment_date,
    lookback_days=14
)
print(risk_table)
