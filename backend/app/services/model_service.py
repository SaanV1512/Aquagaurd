import pickle
from pathlib import Path

MODEL = None

def load_model():
    global MODEL
    if MODEL is None:
        model_path = Path(__file__).resolve().parents[3] / "models" / "model.pkl"
        with open(model_path, "rb") as f:
            MODEL = pickle.load(f)
    return MODEL
