import pandas as pd
import numpy as np
import pickle
from pathlib import Path
from prophet import Prophet
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_absolute_error, mean_squared_error
import matplotlib.pyplot as plt
import warnings
warnings.filterwarnings('ignore')

class ImprovedAquaGuardModel:
    def __init__(self):
        self.BASE_DIR = Path(__file__).resolve().parent.parent
        self.models = {}  
        self.scalers = {} 
        self.anomaly_detectors = {}  
        self.thresholds = {}  
        
    def load_and_preprocess_data(self, data_path):

        df = pd.read_csv(data_path)
        df['date'] = pd.to_datetime(df['date'])
        df = df.sort_values(['region', 'date'])
        df['day_of_week'] = df['date'].dt.dayofweek
        df['month'] = df['date'].dt.month
        df['day_of_month'] = df['date'].dt.day
        df['is_weekend'] = (df['day_of_week'] >= 5).astype(int)
        df['prev_day_usage'] = df.groupby('region')['daily_usage'].shift(1)
        df['prev_week_usage'] = df.groupby('region')['daily_usage'].shift(7) 
        df['rolling_mean_7d'] = df.groupby('region')['daily_usage'].rolling(window=7, min_periods=1).mean().reset_index(0, drop=True)
        df['rolling_std_7d'] = df.groupby('region')['daily_usage'].rolling(window=7, min_periods=1).std().reset_index(0, drop=True)
        
        return df
    
    def train_region_model(self, region_data, region_name):
        prophet_data = region_data[['date', 'daily_usage']].copy()
        prophet_data = prophet_data.rename(columns={'date': 'ds', 'daily_usage': 'y'})
        model = Prophet(
            yearly_seasonality=True,
            weekly_seasonality=True,
            daily_seasonality=False,
            seasonality_mode='multiplicative',
            changepoint_prior_scale=0.05,
            seasonality_prior_scale=10.0
        )
        model.add_regressor('is_weekend')
        train_data = prophet_data.merge(
            region_data[['date', 'is_weekend']], 
            left_on='ds', 
            right_on='date'
        ).drop('date', axis=1)
        
        model.fit(train_data)
        return model
    
    def train_anomaly_detector(self, region_data, region_name):

        features = ['daily_usage', 'day_of_week', 'month', 'is_weekend']
        if 'prev_day_usage' in region_data.columns:
            features.extend(['prev_day_usage', 'rolling_mean_7d', 'rolling_std_7d'])

        clean_data = region_data[features].dropna()
        scaler = StandardScaler()
        scaled_features = scaler.fit_transform(clean_data)
        anomaly_detector = IsolationForest(
            contamination=0.1,
            random_state=42,
            n_estimators=100
        )
        anomaly_detector.fit(scaled_features)
        
        return anomaly_detector, scaler
    
    def calculate_adaptive_threshold(self, residuals):
        clean_residuals = residuals[~np.isnan(residuals)]
        
        if len(clean_residuals) == 0:
            return 1000.0        
        q75, q25 = np.percentile(clean_residuals, [75, 25])
        iqr = q75 - q25
        threshold = q75 + 1.5 * iqr
        
        return threshold if not np.isnan(threshold) else 1000.0
    
    def train_all_regions(self, df):
        print("Training models for all regions")
        
        for region in df['region'].unique():
            print(f"Training model for {region} region")
            region_data = df[df['region'] == region].copy()
            prophet_model = self.train_region_model(region_data, region)
            anomaly_detector, scaler = self.train_anomaly_detector(region_data, region)
            prophet_data = region_data[['date', 'daily_usage', 'is_weekend']].copy()
            prophet_data = prophet_data.rename(columns={'date': 'ds', 'daily_usage': 'y'})
            
            forecast = prophet_model.predict(prophet_data)
            residuals = np.abs(region_data['daily_usage'] - forecast['yhat'])
            threshold = self.calculate_adaptive_threshold(residuals)
            self.models[region] = prophet_model
            self.anomaly_detectors[region] = anomaly_detector
            self.scalers[region] = scaler
            self.thresholds[region] = threshold

            print(f"Adaptive threshold: {threshold:.2f}")
    
    def predict_and_detect_anomalies(self, df, region, deployment_date=None):
        if region not in self.models:
            raise ValueError(f"No trained model found for region: {region}")

        region_data = df[df["region"] == region].copy()
        region_data = region_data.sort_values("date").reset_index(drop=True)
        prophet_df = region_data[
            ["date", "daily_usage", "is_weekend"]
        ].copy()

        if deployment_date is not None:
            prophet_df.loc[
                prophet_df["date"] > deployment_date,
                "daily_usage"
            ] = np.nan

        prophet_df = prophet_df.rename(
            columns={"date": "ds", "daily_usage": "y"}
        )

        forecast = self.models[region].predict(prophet_df)
        region_data["predicted_usage"] = forecast["yhat"]
        region_data["residual"] = (
            region_data["daily_usage"] - region_data["predicted_usage"]
        )
        region_data["abs_residual"] = region_data["residual"].abs()
        features = [
            "daily_usage",
            "day_of_week",
            "month",
            "is_weekend",
            "prev_day_usage",
            "rolling_mean_7d",
            "rolling_std_7d"
        ]

        valid_idx = region_data[features].dropna().index
        scaled = self.scalers[region].transform(
            region_data.loc[valid_idx, features]
        )
        if_scores = -self.anomaly_detectors[region].decision_function(scaled)
        region_data["if_score"] = 0.0
        region_data.loc[valid_idx, "if_score"] = if_scores
        if_threshold = np.percentile(if_scores, 95)
        region_data["is_anomaly_ml"] = 0
        region_data.loc[
            valid_idx,
            "is_anomaly_ml"
        ] = (if_scores >= if_threshold).astype(int)
        region_data["residual_severity"] = (
            region_data["abs_residual"].rank(pct=True).fillna(0)
        )
        region_data["if_severity"] = (
            region_data["if_score"].rank(pct=True).fillna(0)
        )

        region_data["raw_risk"] = (
            0.6 * region_data["residual_severity"]
            + 0.4 * region_data["if_severity"]
        ) * 100

        region_data["combined_risk_score"] = (
            region_data["raw_risk"]
            .rolling(window=3, min_periods=1)
            .mean()
        )

        return region_data

    
    def evaluate_model_performance(self, df, test_size=0.2):
        print("\nModel Performance")
        
        performance_results = {}
        
        for region in df['region'].unique():
            region_data = df[df['region'] == region].copy()
            split_idx = int(len(region_data) * (1 - test_size))
            train_data = region_data[:split_idx]
            test_data = region_data[split_idx:]
            temp_model = self.train_region_model(train_data, region)
            test_prophet_data = test_data[['date', 'daily_usage', 'is_weekend']].copy()
            test_prophet_data = test_prophet_data.rename(columns={'date': 'ds', 'daily_usage': 'y'})
            
            test_forecast = temp_model.predict(test_prophet_data)



            actual = test_data['daily_usage'].values
            predicted = test_forecast['yhat'].values
            
            mae = mean_absolute_error(actual, predicted)
            rmse = np.sqrt(mean_squared_error(actual, predicted))
            mape = np.mean(np.abs((actual - predicted) / actual)) * 100
            
            performance_results[region] = {
                'mae': mae,
                'rmse': rmse,
                'mape': mape,
                'train_size': len(train_data),
                'test_size': len(test_data)
            }
            
            print(f"\n{region} Region:")
            print(f"MAE: {mae:.2f}")
            print(f"RMSE: {rmse:.2f}")
            print(f"MAPE: {mape:.2f}%")
        
        return performance_results
    
    def save_models(self, save_path):
        save_dir = Path(save_path)
        save_dir.mkdir(parents=True, exist_ok=True)
        model_data = {
            'models': self.models,
            'anomaly_detectors': self.anomaly_detectors,
            'scalers': self.scalers,
            'thresholds': self.thresholds
        }
        
        with open(save_dir / 'aquaguard_model.pkl', 'wb') as f:
            pickle.dump(model_data, f)
        
        print(f"Models saved to: {save_dir / 'aquaguard_model.pkl'}")
    
    def load_models(self, load_path):
        with open(load_path, 'rb') as f:
            model_data = pickle.load(f)
        
        self.models = model_data['models']
        self.anomaly_detectors = model_data['anomaly_detectors']
        self.scalers = model_data['scalers']
        self.thresholds = model_data['thresholds']
        
        print(f"Models loaded from: {load_path}")
    
    def generate_model_comparison_plots(self, df):
        output_dir = self.BASE_DIR / "outputs" / "improved_model"
        output_dir.mkdir(parents=True, exist_ok=True)
        for region in df['region'].unique():
            results = self.predict_and_detect_anomalies(df, region)
            plt.figure(figsize=(15, 10))
            
            plt.subplot(3, 1, 1)
            plt.plot(results['date'], results['daily_usage'], label='Actual', alpha=0.7)
            plt.plot(results['date'], results['predicted_usage'], label='Predicted (Improved)', linewidth=2)
            plt.title(f'{region} Region - Actual vs Predicted Usage')
            plt.ylabel('Usage (liters)')
            plt.legend()
            plt.grid(True, alpha=0.3)
            plt.subplot(3, 1, 2)
            plt.plot(results['date'], results['residual'], label='Residuals', alpha=0.7)
            plt.axhline(self.thresholds[region], color='red', linestyle='--', label='Threshold')
            plt.axhline(-self.thresholds[region], color='red', linestyle='--')
            
            anomaly_dates = results.loc[results['is_anomaly_ml'] == 1, 'date']

            anomaly_residuals = results.loc[
                results['is_anomaly_ml'] == 1,
                'residual'
            ]
            plt.scatter(anomaly_dates, anomaly_residuals, color='red', s=50, label='ML Anomalies', zorder=5)
            
            plt.title(f'{region} Region - Residuals and Anomaly Detection')
            plt.ylabel('Residual')
            plt.legend()
            plt.grid(True, alpha=0.3)
            
            plt.subplot(3, 1, 3)
            plt.plot(results['date'], results['combined_risk_score'], color='orange', linewidth=2)
            plt.title(f'{region} Region - Combined Risk Score')
            plt.xlabel('Date')
            plt.ylabel('Risk Score (0-100)')
            plt.grid(True, alpha=0.3)
            plt.tight_layout()
            plt.savefig(output_dir / f'{region}_improved_model_analysis.png', dpi=300, bbox_inches='tight')
            plt.close()
        

def main():
    model = ImprovedAquaGuardModel()
    
    print("Loading and preprocessing data")
    df = model.load_and_preprocess_data('data/water_consumption_cleaned.csv')
    model.train_all_regions(df)
    performance = model.evaluate_model_performance(df)
    print("\nAnomoly Detection")
    for region in df['region'].unique():
        results = model.predict_and_detect_anomalies(df, region)
        anomaly_count = results['is_anomaly_ml'].sum()
        high_risk_count = (results['combined_risk_score'] > 70).sum()
        print(f"\n{region} Region:")
        print(f"ML-detected anomalies: {anomaly_count} ({anomaly_count/len(results)*100:.1f}%)")
        print(f"  High-risk periods (>70): {high_risk_count} ({high_risk_count/len(results)*100:.1f}%)")
    model.save_models('models')
    model.generate_model_comparison_plots(df)
if __name__ == "__main__":
    main()