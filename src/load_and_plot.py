import pandas as pd
import matplotlib.pyplot as plt
import os

# Load dataset
df = pd.read_csv("data/water_consumption_forecasting.csv")

# Parse date
df['date'] = pd.to_datetime(df['date'])

# Sort
df = df.sort_values(['region', 'date'])

# Quick sanity check
print(df.head())
print(df.info())

# Plot consumption per region
os.makedirs("outputs", exist_ok=True)

for region in df['region'].unique():
    temp = df[df['region'] == region]
    plt.figure(figsize=(10, 4))
    plt.plot(temp['date'], temp['consumption_liters'])
    plt.title(f"Water Consumption – Region {region}")
    plt.xlabel("Date")
    plt.ylabel("Consumption (liters)")
    plt.tight_layout()
    plt.savefig(f"outputs/consumption_{region}.png")
    plt.close()
