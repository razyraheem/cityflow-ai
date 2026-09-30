from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..core.database import get_db
from ..services.trajectory_service import trajectory_service

router = APIRouter(
    prefix="/trajectories",
    tags=["Trajectories"],
)


@router.get("")
def get_trajectories(
    db: Session = Depends(get_db),
):
    return trajectory_service.get_all(db)


@router.get("/vehicle/{identifier}")
def get_vehicle_trajectory(
    identifier: str,
    db: Session = Depends(get_db),
):
    trajectory = trajectory_service.get_by_vehicle_or_plate(
        db,
        identifier,
    )

    if not trajectory:
        raise HTTPException(
            status_code=404,
            detail=f"No trajectory found for {identifier}",
        )

    return trajectory


@router.get("/{trajectory_id}")
def get_trajectory(
    trajectory_id: str,
    db: Session = Depends(get_db),
):
    trajectory = trajectory_service.get_by_id(
        db,
        trajectory_id,
    )

    if not trajectory:
        raise HTTPException(
            status_code=404,
            detail=f"Trajectory {trajectory_id} not found",
        )

    return trajectory