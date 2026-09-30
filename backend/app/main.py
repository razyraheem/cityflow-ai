from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import asyncio
# =========================================================
# CITYFLOW AI - API ROUTERS
# =========================================================

from .api.cameras import router as cameras_router
from .api.vehicles import router as vehicles_router
from .api.trajectories import router as trajectories_router
from .api.analytics import router as analytics_router
from .api.prediction import router as prediction_router
from .api.signals import router as signals_router
from .api.emergency import router as emergency_router
from .core.config import settings

from .websocket.router import (
    router as websocket_router,
    broadcast_traffic_updates,
    broadcast_prediction_updates,
    broadcast_signal_recommendations,
    broadcast_heartbeat,
    broadcast_emergency_updates,
)

# =========================================================
# APPLICATION CONFIGURATION
# =========================================================

app = FastAPI(
    title="CITYFLOW AI API",
    description=(
        "City-Wide AI Engine for Multi-Camera ANPR "
        "Trajectory Tracking and Urban Traffic Analytics"
    ),
    version="2.4.0",
)

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(
        broadcast_traffic_updates()
    )

    asyncio.create_task(
        broadcast_prediction_updates()
    )

    asyncio.create_task(
        broadcast_signal_recommendations()
    )

    asyncio.create_task(
        broadcast_heartbeat()
    )

    asyncio.create_task(
        broadcast_emergency_updates()
    )


# =========================================================
# CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# CAMERA API
# =========================================================

app.include_router(
    cameras_router,
    prefix="/api",
)


# =========================================================
# VEHICLE API
# =========================================================

app.include_router(
    vehicles_router,
    prefix="/api",
)


# =========================================================
# TRAJECTORY API
# =========================================================

app.include_router(
    trajectories_router,
    prefix="/api",
)


# =========================================================
# ANALYTICS API
# =========================================================

app.include_router(
    analytics_router,
    prefix="/api",
)


# =========================================================
# PREDICTION API
# =========================================================

app.include_router(
    prediction_router,
    prefix="/api",
)


# =========================================================
# SIGNAL OPTIMIZATION API
# =========================================================

app.include_router(
    signals_router,
    prefix="/api",
)


# =========================================================
# SYSTEM - HEALTH CHECK
# =========================================================

@app.get(
    "/api/health",
    tags=["System"],
)
def health_check():
    return {
        "status": "healthy",
        "service": "CITYFLOW AI",
        "version": "2.4.0",
    }


# =========================================================
# ROOT
# =========================================================

@app.get(
    "/",
    tags=["System"],
)
def root():
    return {
        "message": "CITYFLOW AI backend is running",
        "service": "CITYFLOW AI",
        "version": "2.4.0",
        "api": "/api",
        "docs": "/docs",
        "health": "/api/health",
    }


# =========================================================
# WEBSOCKET - REAL TIME UPDATES
# =========================================================

app.include_router(
    websocket_router,
)

# =========================================================
# EMERGENCY GREEN CORRIDOR API
# =========================================================

app.include_router(
    emergency_router,
    prefix="/api",
)