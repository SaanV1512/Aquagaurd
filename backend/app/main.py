from fastapi import FastAPI
from app.api.routes import router

app = FastAPI(title="AquaGuard Backend")

app.include_router(router)
