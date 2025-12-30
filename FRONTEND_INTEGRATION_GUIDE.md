# AquaGuard Model Integration Guide for Frontend

## 🎯 Overview

This guide shows your frontend teammate how to integrate the improved AquaGuard model with the backend API. The model provides water consumption predictions and anomaly detection for 5 regions.

## 📁 Project Structure

```
├── src/
│   ├── improved_model.py          # Main model class (YOUR UPDATED VERSION)
│   ├── Test_new_model.py          # Your testing script (YOUR UPDATED VERSION)
│   ├── baseline.py                # Original baseline (keep)
│   ├── prophet_baseline.py        # Original Prophet baseline (keep)
│   └── load_and_plot.py          # Data visualization (keep)
├── models/
│   └── aquaguard_model.pkl        # Trained model (ready for production)
├── backend/app/services/
│   ├── model_service.py           # Updated to load improved model
│   ├── data_service.py            # Data loading service
│   └── prediction_service.py      # Prediction service
└── data/
    └── water_consumption_cleaned.csv  # Training data
```

## 🔧 Model Interface

### Loading the Model

```python
from src.improved_model import ImprovedAquaGuardModel

# Initialize and load trained model
model = ImprovedAquaGuardModel()
model.load_models("models/aquaguard_model.pkl")
```

### Key Methods

#### 1. `load_and_preprocess_data(data_path)`
Loads and preprocesses water consumption data with feature engineering.

```python
df = model.load_and_preprocess_data("data/water_consumption_cleaned.csv")
```

**Returns:** DataFrame with additional features:
- `day_of_week`, `month`, `is_weekend`
- `prev_day_usage`, `prev_week_usage`
- `rolling_mean_7d`, `rolling_std_7d`

#### 2. `predict_and_detect_anomalies(df, region, deployment_date=None)`
Main prediction method that generates forecasts and detects anomalies.

```python
results = model.predict_and_detect_anomalies(df, "Central", deployment_date="2023-01-25")
```

**Parameters:**
- `df`: Preprocessed DataFrame
- `region`: Region name ("North", "West", "South", "Central", "East")
- `deployment_date`: Optional cutoff date for training data

**Returns:** DataFrame with columns:
- `predicted_usage`: Prophet forecast
- `residual`: Actual - Predicted
- `abs_residual`: Absolute residual
- `if_score`: Isolation Forest anomaly score
- `is_anomaly_ml`: Binary anomaly flag (0/1)
- `combined_risk_score`: Final risk score (0-100)

## 🚀 Backend API Integration

### Updated Model Service

The `backend/app/services/model_service.py` has been updated to load your improved model:

```python
def load_model():
    """Loads the improved AquaGuard model"""
    model_path = Path(__file__).resolve().parents[3] / "models" / "aquaguard_model.pkl"
    with open(model_path, "rb") as f:
        return pickle.load(f)

def get_model_info():
    """Returns model information for API"""
    return {
        "status": "loaded",
        "regions": ["North", "West", "South", "Central", "East"],
        "model_type": "ImprovedAquaGuardModel",
        "features": ["seasonality", "multi_region", "ml_anomaly_detection", "adaptive_thresholds"]
    }
```

### API Endpoints to Update

#### 1. `/regions` - Get Available Regions
```python
@router.get("/regions")
def regions():
    return ["North", "West", "South", "Central", "East"]
```

#### 2. `/timeseries/{region}` - Get Time Series Data
```python
@router.get("/timeseries/{region}")
def timeseries(region: str):
    # Load model and data
    model = ImprovedAquaGuardModel()
    model.load_models("models/aquaguard_model.pkl")
    df = model.load_and_preprocess_data("data/water_consumption_cleaned.csv")
    
    # Get predictions
    results = model.predict_and_detect_anomalies(df, region)
    
    # Return relevant columns
    return results[['date', 'daily_usage', 'predicted_usage', 'combined_risk_score']].to_dict(orient="records")
```

#### 3. `/risk/{region}` - Get Risk Analysis
```python
@router.get("/risk/{region}")
def risk(region: str):
    model = ImprovedAquaGuardModel()
    model.load_models("models/aquaguard_model.pkl")
    df = model.load_and_preprocess_data("data/water_consumption_cleaned.csv")
    
    results = model.predict_and_detect_anomalies(df, region)
    
    # Return risk-focused data
    return results[['date', 'combined_risk_score', 'is_anomaly_ml', 'residual']].to_dict(orient="records")
```

#### 4. `/ranking` - Get Regional Risk Ranking
Based on your `Test_new_model.py`, here's the ranking logic:

```python
@router.get("/ranking")
def ranking():
    model = ImprovedAquaGuardModel()
    model.load_models("models/aquaguard_model.pkl")
    df = model.load_and_preprocess_data("data/water_consumption_cleaned.csv")
    
    deployment_date = pd.to_datetime("2023-01-25")
    lookback_days = 14
    
    ranking_data = []
    
    for region in df["region"].unique():
        results = model.predict_and_detect_anomalies(df, region, deployment_date)
        
        # Calculate metrics (from your Test_new_model.py)
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
        
        # Priority score
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
    
    # Sort by priority score
    ranking_data.sort(key=lambda x: x["priority_score"], reverse=True)
    
    # Add inspection priority
    for i, item in enumerate(ranking_data):
        item["inspection_priority"] = i + 1
    
    return ranking_data
```

## 📊 Frontend Data Structure

### Time Series Response Format
```json
[
  {
    "date": "2023-01-01T00:00:00",
    "daily_usage": 14490.80,
    "predicted_usage": 13117.97,
    "combined_risk_score": 25.4
  },
  ...
]
```

### Risk Analysis Response Format
```json
[
  {
    "date": "2023-01-01T00:00:00",
    "combined_risk_score": 25.4,
    "is_anomaly_ml": 0,
    "residual": 1372.83
  },
  ...
]
```

### Regional Ranking Response Format
```json
[
  {
    "region": "West",
    "current_risk": 45.67,
    "recent_peak_risk": 78.23,
    "risk_level": "High",
    "persistence_days": 3,
    "priority_score": 67.89,
    "inspection_priority": 1
  },
  ...
]
```

## 🎨 Frontend Implementation Examples

### React Component for Risk Dashboard

```jsx
import React, { useState, useEffect } from 'react';

const RiskDashboard = () => {
  const [rankings, setRankings] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [timeSeriesData, setTimeSeriesData] = useState([]);

  useEffect(() => {
    // Fetch regional rankings
    fetch('/api/ranking')
      .then(res => res.json())
      .then(setRankings);
  }, []);

  const handleRegionSelect = (region) => {
    setSelectedRegion(region);
    
    // Fetch time series data for selected region
    fetch(`/api/timeseries/${region}`)
      .then(res => res.json())
      .then(setTimeSeriesData);
  };

  return (
    <div className="risk-dashboard">
      <h2>Regional Risk Ranking</h2>
      
      {/* Risk Ranking Table */}
      <table>
        <thead>
          <tr>
            <th>Priority</th>
            <th>Region</th>
            <th>Risk Level</th>
            <th>Current Risk</th>
            <th>Peak Risk (14d)</th>
            <th>Persistence</th>
          </tr>
        </thead>
        <tbody>
          {rankings.map(region => (
            <tr 
              key={region.region}
              onClick={() => handleRegionSelect(region.region)}
              className={`risk-${region.risk_level.toLowerCase()}`}
            >
              <td>{region.inspection_priority}</td>
              <td>{region.region}</td>
              <td>{region.risk_level}</td>
              <td>{region.current_risk}</td>
              <td>{region.recent_peak_risk}</td>
              <td>{region.persistence_days} days</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Time Series Chart */}
      {selectedRegion && (
        <div className="time-series-chart">
          <h3>{selectedRegion} Region - Usage & Risk Trends</h3>
          {/* Implement your chart component here */}
          <TimeSeriesChart data={timeSeriesData} />
        </div>
      )}
    </div>
  );
};
```

## 🔧 Testing the Integration

### 1. Start Backend Server
```bash
cd backend
uvicorn app.main:app --reload
```

### 2. Test API Endpoints
```bash
# Test health
curl http://localhost:8000/health

# Test regions
curl http://localhost:8000/regions

# Test ranking
curl http://localhost:8000/ranking

# Test specific region
curl http://localhost:8000/timeseries/Central
```

### 3. Verify Model Loading
Check the console output when starting the server. You should see:
```
Improved AquaGuard model loaded successfully from models/aquaguard_model.pkl
```

## 🚨 Important Notes

1. **Model File**: Ensure `models/aquaguard_model.pkl` exists and is accessible
2. **Data Path**: Update data paths if your file structure differs
3. **Error Handling**: Add proper error handling for missing regions or model failures
4. **Performance**: Consider caching predictions for frequently accessed regions
5. **Real-time Updates**: For live data, implement periodic model retraining

## 📈 Risk Score Interpretation

- **0-30**: Low risk (normal operation)
- **30-50**: Medium risk (monitor closely)
- **50-70**: High risk (investigate soon)
- **70-100**: Critical risk (immediate inspection needed)

The `combined_risk_score` combines:
- **60%** Residual severity (how far from predicted)
- **40%** ML anomaly score (pattern-based detection)

This provides a comprehensive risk assessment for prioritizing maintenance efforts.