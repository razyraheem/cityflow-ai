from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..core.database import get_db
from ..services.prediction_service import prediction_service


router = APIRouter(
    prefix="/prediction",
    tags=["Prediction"],
)


@router.get("/overview")
def get_prediction_overview(
    db: Session = Depends(get_db),
):
    """
    Returns city-wide baseline traffic congestion predictions.
    """

    return prediction_service.get_prediction_overview(db)


@router.get("/cameras")
def get_camera_predictions(
    camera_ids: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """
    Get predictions for all cameras or selected cameras.

    Example:
    /api/prediction/cameras

    Selected cameras:
    /api/prediction/cameras?camera_ids=CAM-004,CAM-005
    """

    ids = None

    if camera_ids:
        ids = [
            camera_id.strip()
            for camera_id in camera_ids.split(",")
            if camera_id.strip()
        ]

    predictions = prediction_service.get_camera_predictions(
        db,
        ids,
    )

    return {
        "model": "CITYFLOW Baseline Predictor v1",
        "predictions": predictions,
    }


@router.get("/camera/{camera_id}")
def get_single_camera_prediction(
    camera_id: str,
    db: Session = Depends(get_db),
):
    """
    Get prediction for one camera.
    """

    predictions = prediction_service.get_camera_predictions(
        db,
        [camera_id],
    )

    if not predictions:
        raise HTTPException(
            status_code=404,
            detail=f"Camera {camera_id} not found",
        )

    return predictions[0]