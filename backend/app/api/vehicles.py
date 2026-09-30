from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..core.database import get_db
from ..services.vehicle_service import vehicle_service

router = APIRouter(prefix="/vehicles", tags=["Vehicles"])


@router.get("")
def get_vehicles(
    query: Optional[str] = None,
    vehicle_type: Optional[str] = None,
    db: Session = Depends(get_db),
):
    return vehicle_service.get_all(
        db,
        query=query,
        vehicle_type=vehicle_type,
    )


@router.get("/search/plate/{plate}")
def search_vehicle_by_plate(
    plate: str,
    db: Session = Depends(get_db),
):
    return vehicle_service.search_by_plate(db, plate)


@router.get("/{vehicle_id}")
def get_vehicle(
    vehicle_id: str,
    db: Session = Depends(get_db),
):
    vehicle = vehicle_service.get_by_id(db, vehicle_id)

    if not vehicle:
        raise HTTPException(
            status_code=404,
            detail=f"Vehicle {vehicle_id} not found",
        )

    return vehicle


@router.get("/{vehicle_id}/detections")
def get_vehicle_detections(
    vehicle_id: str,
    db: Session = Depends(get_db),
):
    return vehicle_service.get_detections_for_vehicle(
        db,
        vehicle_id,
    )