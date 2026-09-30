from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from ..core.database import get_db
from ..services.emergency_service import emergency_service


router = APIRouter(
    prefix="/emergency",
    tags=["Emergency Green Corridor"],
)


class AmbulanceDetectionRequest(BaseModel):
    ambulance_id: str = Field(..., min_length=2)
    vehicle_plate: Optional[str] = None

    current_location: str
    destination: str

    current_lat: float
    current_lng: float

    dest_lat: float
    dest_lng: float


@router.post("/detect")
def detect_ambulance(
    request: AmbulanceDetectionRequest,
    db: Session = Depends(get_db),
):
    """
    Detect/register an emergency ambulance and automatically
    select an emergency corridor.
    """

    return emergency_service.detect_ambulance(
        db=db,
        ambulance_id=request.ambulance_id,
        vehicle_plate=request.vehicle_plate,
        current_location=request.current_location,
        destination=request.destination,
        current_lat=request.current_lat,
        current_lng=request.current_lng,
        dest_lat=request.dest_lat,
        dest_lng=request.dest_lng,
    )


@router.get("")
def get_emergency_vehicles(
    db: Session = Depends(get_db),
):
    return {
        "status": "OK",
        "count": len(emergency_service.get_all(db)),
        "emergencyVehicles": emergency_service.get_all(db),
    }


@router.get("/{ambulance_id}")
def get_emergency_vehicle(
    ambulance_id: str,
    db: Session = Depends(get_db),
):
    result = emergency_service.get_one(
        db,
        ambulance_id,
    )

    if not result:
        raise HTTPException(
            status_code=404,
            detail=f"Ambulance {ambulance_id} not found",
        )

    return result


@router.post("/{ambulance_id}/recalculate")
def recalculate_eta(
    ambulance_id: str,
    db: Session = Depends(get_db),
):
    result = emergency_service.recalculate_eta(
        db,
        ambulance_id,
    )

    if not result:
        raise HTTPException(
            status_code=404,
            detail=f"Ambulance {ambulance_id} not found",
        )

    return result


@router.post("/{ambulance_id}/activate")
def activate_green_corridor(
    ambulance_id: str,
    db: Session = Depends(get_db),
):
    result = emergency_service.activate_corridor(
        db,
        ambulance_id,
    )

    if not result:
        raise HTTPException(
            status_code=404,
            detail=f"Ambulance {ambulance_id} not found",
        )

    return {
        "status": "GREEN_CORRIDOR_ACTIVE",
        "message": "Emergency signal priority activated.",
        "data": result,
    }


@router.post("/{ambulance_id}/complete")
def complete_green_corridor(
    ambulance_id: str,
    db: Session = Depends(get_db),
):
    result = emergency_service.complete_corridor(
        db,
        ambulance_id,
    )

    if not result:
        raise HTTPException(
            status_code=404,
            detail=f"Ambulance {ambulance_id} not found",
        )

    return {
        "status": "COMPLETED",
        "data": result,
    }