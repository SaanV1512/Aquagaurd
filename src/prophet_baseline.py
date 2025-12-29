import pandas as pd
from pathlib import Path
import numpy as np
from prophet import Prophet
import matplotlib.pyplot as plt

BASE_DIR = Path(__file__).resolve().parent.parent
df = pd.read_csv(BASE_DIR / 'data' / 'water_consumption_cleaned.csv')

df = df.rename(columns={"daily_usage": "y"})
df = df.rename(columns={"date": "ds"})


df["ds"] = pd.to_datetime(df["ds"])
region  = "Central"
central = df[df["region"] == region].copy()
central = central.sort_values(by="ds")
print(central.head())
print(central.tail())

model = Prophet(yearly_seasonality=False, daily_seasonality=False, weekly_seasonality=False)
model.fit(central[["ds", "y"]])
future = model.make_future_dataframe(periods=0)
forecast = model.predict(future)
print(forecast[['ds', 'yhat']].head())
print(forecast[['ds', 'yhat']].tail())

# Merge actual and expected
central_prophet = central.copy()
central_prophet["expected"] = forecast["yhat"].values

# Deviation from Prophet baseline
central_prophet["deviation"] = (
    central_prophet["y"] - central_prophet["expected"]
)

print(
    central_prophet[["ds", "y", "expected", "deviation"]]
    .head(10)
)

median_deviation = np.median(np.abs(central_prophet["deviation"]))
threshold = 2 * median_deviation
print("Deviation Threshold:", threshold)
PERSISTENCE_DAYS = 7
persistence = 0
persistence_list = []
for index, row in central_prophet.iterrows():
    if np.abs(row["deviation"]) > threshold:
        persistence += 1
    else:
        persistence = 0
    persistence_list.append(persistence)
central_prophet["persistence"] = persistence_list

central_prophet["magnitude_score"] = np.clip(
    np.abs(central_prophet["deviation"]) / (3 * threshold),
    0,
    1
)

central_prophet["persistence_score"] = np.clip(
    central_prophet["persistence"] / PERSISTENCE_DAYS,
    0,
    1
)

def direction_weight(dev):
    if dev > threshold:
        return 1.0        # excess usage
    elif dev < -threshold:
        return 0.4        # low usage, reduced weight
    else:
        return 0.0

central_prophet["direction_weight"] = central_prophet["deviation"].apply(direction_weight)

central_prophet["risk_score"] = (
    central_prophet["magnitude_score"]
    * central_prophet["persistence_score"]
    * central_prophet["direction_weight"]
    * 100
).round(2)

print(
    central_prophet[[
        "ds", "y", "expected",
        "deviation", "persistence", "risk_score"
    ]].tail(10)
)


plt.figure(figsize=(12, 5))
plt.plot(central_prophet["ds"], central_prophet["y"], label="Actual Consumption", alpha=0.6)
plt.plot(central_prophet["ds"], central_prophet["expected"], label="Expected (Prophet)", linewidth=2)

plt.title("Actual vs Expected Water Consumption (Central)")
plt.xlabel("Date")
plt.ylabel("Water Consumption")
plt.legend()
plt.tight_layout()
plt.savefig(BASE_DIR / "outputs" / f"actual_expected_consumption.png")
plt.close()

plt.figure(figsize=(12, 4))
plt.plot(central_prophet["ds"], central_prophet["deviation"], label="Deviation")

plt.axhline(threshold, color="red", linestyle="--", label="Positive Threshold")
plt.axhline(-threshold, color="red", linestyle="--", label="Negative Threshold")

plt.title("Deviation from Expected Consumption")
plt.xlabel("Date")
plt.ylabel("Deviation")
plt.legend()
plt.tight_layout()
plt.savefig(BASE_DIR / "outputs" / f"deviation.png")
plt.close()

plt.figure(figsize=(12, 4))
plt.plot(central_prophet["ds"], central_prophet["risk_score"], color="orange", linewidth=2)

plt.title("Early Warning Risk Score (0-100)")
plt.xlabel("Date")
plt.ylabel("Risk Score")
plt.ylim(0, 100)
plt.tight_layout()
plt.savefig(BASE_DIR / "outputs" / f"risk score.png")
plt.close()
