import pandas as pd
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
df = pd.read_csv(BASE_DIR / 'data' / 'water_consumption_cleaned.csv')

df = df.rename(columns={"daily usage": "consumption"})
df["date"] = pd.to_datetime(df["date"])
region  = "Central"
central = df[df["region"] == region].copy()
central = central.sort_values(by="date")
print(central.head())
print(central.tail())
# Recent baseline: 7-day rolling mean
window = 7
central["expected"] = (
    central["daily_usage"]
    .rolling(window=window)
    .mean()
)

print(
    central[["date", "daily_usage", "expected"]]
    .dropna()
    .head(10)
)
# Deviation from recent baseline
central["deviation"] = central["daily_usage"] - central["expected"]

print(
    central[["date", "daily_usage", "expected", "deviation"]]
    .dropna()
    .head(10)
)



