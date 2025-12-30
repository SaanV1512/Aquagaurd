import pickle
from pathlib import Path

MODEL = None

def load_model():
    global MODEL
    if MODEL is None:
        model_path = Path(__file__).resolve().parents[3] / "models" / "aquaguard_model.pkl"
        try:
            with open(model_path, "rb") as f:
                MODEL = pickle.load(f)
            print(f"Improved AquaGuard model loaded successfully from {model_path}")
        except FileNotFoundError:
            print(f"Model file not found at {model_path}. Please train the model first.")
            MODEL = None
        except Exception as e:
            print(f"Error loading model: {e}")
            MODEL = None
    return MODEL

def get_model_info():
    """Get information about the loaded model"""
    model = load_model()
    if model is None:
        return {"status": "error", "message": "Model not loaded"}
    
    return {
        "status": "loaded",
        "regions": list(model['models'].keys()) if 'models' in model else [],
        "model_type": "ImprovedAquaGuardModel",
        "features": ["seasonality", "multi_region", "ml_anomaly_detection", "adaptive_thresholds"]
    }
