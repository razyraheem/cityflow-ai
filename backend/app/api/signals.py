from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ..core.database import get_db
from ..services.signal_service import signal_service


router = APIRouter(
    prefix="/signals",
    tags=["Signals"],
)


class SignalOptimizationRequest(BaseModel):
    intersection_id: str


class SignalOptimizationResponse(BaseModel):
    intersectionId: str
    name: str

    latitude: float
    longitude: float

    currentCongestion: float
    predictedCongestion: float

    traffic: dict
    currentSignalPlan: dict
    recommendedSignalPlan: dict

    expectedCongestionReduction: float
    expectedQueueReduction: float

    reason: str
    confidence: float
    status: str


# =========================================================
# POST /api/signals/optimize
# =========================================================

@router.post(
    "/optimize",
    response_model=SignalOptimizationResponse,
)
def optimize_signal(
    request: SignalOptimizationRequest,
    db: Session = Depends(get_db),
):
    result = signal_service.optimize_intersection(
        db,
        request.intersection_id,
    )

    if not result:
        raise HTTPException(
            status_code=404,
            detail=(
                f"Intersection "
                f"{request.intersection_id} not found"
            ),
        )

    return result


# =========================================================
# GET /api/signals
# =========================================================

@router.get("")
def get_signals(
    db: Session = Depends(get_db),
):
    signals = signal_service.get_all(db)

    return {
        "status": "AI_OPTIMIZED",
        "count": len(signals),
        "signals": signals,
    }


# =========================================================
# GET /api/signals/{intersection_id}
# =========================================================

@router.get(
    "/{intersection_id}",
    response_model=SignalOptimizationResponse,
)
def get_signal(
    intersection_id: str,
    db: Session = Depends(get_db),
):
    result = signal_service.get_one(
        db,
        intersection_id,
    )

    if not result:
        raise HTTPException(
            status_code=404,
            detail=(
                f"Intersection "
                f"{intersection_id} not found"
            ),
        )

    return result