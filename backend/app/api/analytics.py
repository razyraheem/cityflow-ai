from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..core.database import get_db
from ..services.analytics_service import analytics_service


router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"],
)


@router.get("/overview")
def get_analytics_overview(
    db: Session = Depends(get_db),
):
    return analytics_service.get_overview(db)


@router.get("/cameras")
def get_camera_analytics(
    db: Session = Depends(get_db),
):
    return analytics_service.get_camera_analytics(db)


@router.get("/traffic")
def get_traffic_analytics(
    db: Session = Depends(get_db),
):
    return analytics_service.get_traffic_analytics(db)


@router.get("/vehicle-types")
def get_vehicle_type_analytics(
    db: Session = Depends(get_db),
):
    return analytics_service.get_vehicle_type_analytics(db)


@router.get("/hotspots")
def get_hotspots(
    db: Session = Depends(get_db),
):
    return analytics_service.get_hotspots(db)


@router.get("/flow")
def get_traffic_flow(
    db: Session = Depends(get_db),
):
    return analytics_service.get_flow(db)