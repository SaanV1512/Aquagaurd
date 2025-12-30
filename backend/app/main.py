from fastapi import FastAPI
from app.api.routes import router
from fastapi.middleware.cors import CORSMiddleware

# 1️⃣ Create FastAPI app first
app = FastAPI(title="AquaGuard Backend")

# 2️⃣ Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://192.168.1.21:3000",  # your LAN IP
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3️⃣ Include your routes
app.include_router(router)
