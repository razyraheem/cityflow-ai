from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..core.database import get_db
from ..services.camera_service import camera_service

router = APIRouter(prefix="/cameras", tags=["Cameras"])


@router.get("")
def get_cameras(db: Session = Depends(get_db)):
    return camera_service.get_all(db)


@router.get("/{camera_id}")
def get_camera(camera_id: str, db: Session = Depends(get_db)):
    camera = camera_service.get_by_id(db, camera_id)

    if not camera:
        raise HTTPException(
            status_code=404,
            detail=f"Camera {camera_id} not found"
        )

    return camera


@router.get("/{camera_id}/detections")
def get_camera_detections(
    camera_id: str,
    db: Session = Depends(get_db)
):
    camera = camera_service.get_by_id(db, camera_id)

    if not camera:
        raise HTTPException(
            status_code=404,
            detail=f"Camera {camera_id} not found"
        )

    return camera_service.get_detections(db, camera_id)


@router.get("/{camera_id}/traffic")
def get_camera_traffic(
    camera_id: str,
    db: Session = Depends(get_db)
):
    traffic = camera_service.get_traffic(db, camera_id)

    if not traffic:
        raise HTTPException(
            status_code=404,
            detail=f"Camera {camera_id} not found"
        )

    return traffic