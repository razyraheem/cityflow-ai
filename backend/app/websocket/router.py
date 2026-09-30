import asyncio
from datetime import datetime, timezone

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session

from .manager import manager
from ..core.database import SessionLocal
from ..models import Camera, EmergencyVehicle
from ..services.prediction_service import prediction_service
from ..services.signal_service import signal_service


router = APIRouter(tags=["WebSocket"])


def create_event(event: str, data: dict):
    return {
        "event": event,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "version": "1.0",
        "data": data,
    }


async def broadcast_traffic_updates():
    while True:
        db: Session = SessionLocal()

        try:
            cameras = (
                db.query(Camera)
                .order_by(Camera.camera_id)
                .all()
            )

            for camera in cameras:
                event = create_event(
                    "traffic.updated",
                    {
                        "cameraId": camera.camera_id,
                        "cameraName": camera.name,
                        "road": camera.road,
                        "vehiclesDetected": int(
                            camera.vehicles_detected or 0
                        ),
                        "averageSpeed": float(
                            camera.average_speed or 0
                        ),
                        "congestion": float(
                            camera.congestion or 0
                        ),
                        "status": camera.status,
                        "health": camera.health,
                    },
                )

                await manager.broadcast(event)

        except Exception as error:
            print(
                f"[WebSocket] Traffic update error: {error}"
            )

        finally:
            db.close()

        await asyncio.sleep(5)


async def broadcast_prediction_updates():
    while True:
        db: Session = SessionLocal()

        try:
            predictions = prediction_service.get_camera_predictions(
                db
            )

            for prediction in predictions:
                event = create_event(
                    "prediction.updated",
                    {
                        "cameraId": prediction["cameraId"],
                        "cameraName": prediction["cameraName"],
                        "road": prediction["road"],

                        "currentCongestion": prediction[
                            "currentCongestion"
                        ],

                        "predicted5Min": prediction[
                            "predicted5Min"
                        ],

                        "predicted10Min": prediction[
                            "predicted10Min"
                        ],

                        "predicted15Min": prediction[
                            "predicted15Min"
                        ],

                        "averageSpeed": prediction[
                            "averageSpeed"
                        ],

                        "vehiclesDetected": prediction[
                            "vehiclesDetected"
                        ],

                        "congestionTrend": prediction[
                            "congestionTrend"
                        ],

                        "status": prediction[
                            "status"
                        ],

                        "confidence": prediction[
                            "confidence"
                        ],

                        "factors": prediction[
                            "factors"
                        ],

                        "recommendation": prediction[
                            "recommendation"
                        ],
                    },
                )

                await manager.broadcast(event)

        except Exception as error:
            print(
                f"[WebSocket] Prediction update error: {error}"
            )

        finally:
            db.close()

        await asyncio.sleep(10)

async def broadcast_signal_recommendations():
    while True:
        db: Session = SessionLocal()

        try:
            from ..models import Intersection

            intersections = (
                db.query(Intersection)
                .order_by(Intersection.intersection_id)
                .all()
            )

            for intersection in intersections:
                result = signal_service.calculate_optimization(
                    db,
                    intersection.intersection_id
                )

                if not result:
                    continue

                event = create_event(
                    "signal.recommended",
                    {
                        "intersectionId": result["intersectionId"],
                        "name": result["name"],
                        "latitude": result["latitude"],
                        "longitude": result["longitude"],
                        "currentCongestion": result[
                            "currentCongestion"
                        ],
                        "predictedCongestion": result[
                            "predictedCongestion"
                        ],
                        "traffic": result["traffic"],
                        "currentSignalPlan": result[
                            "currentSignalPlan"
                        ],
                        "recommendedSignalPlan": result[
                            "recommendedSignalPlan"
                        ],
                        "expectedCongestionReduction": result[
                            "expectedCongestionReduction"
                        ],
                        "expectedQueueReduction": result[
                            "expectedQueueReduction"
                        ],
                        "reason": result["reason"],
                        "confidence": result["confidence"],
                        "status": result["status"],
                    },
                )

                await manager.broadcast(event)

        except Exception as error:
            print(
                f"[WebSocket] Signal recommendation error: {error}"
            )

        finally:
            db.close()

        await asyncio.sleep(15)

async def broadcast_emergency_updates():
    while True:
        db: Session = SessionLocal()

        try:
            from ..services.emergency_service import emergency_service

            emergencies = (
                db.query(EmergencyVehicle)
                .filter(
                    EmergencyVehicle.priority_status != "COMPLETED"
                )
                .order_by(EmergencyVehicle.ambulance_id)
                .all()
            )

            for emergency in emergencies:
                data = emergency_service._format(emergency)

                event = create_event(
                    "emergency.updated",
                    data,
                )

                await manager.broadcast(event)

        except Exception as error:
            print(
                f"[WebSocket] Emergency update error: {error}"
            )

        finally:
            db.close()

        await asyncio.sleep(5)


async def broadcast_heartbeat():
    while True:
        try:
            await manager.broadcast(
                create_event(
                    "system.heartbeat",
                    {
                        "status": "healthy",
                        "service": "CITYFLOW AI",
                    },
                )
            )

        except Exception as error:
            print(
                f"[WebSocket] Heartbeat error: {error}"
            )

        await asyncio.sleep(10)


@router.websocket("/ws")
async def websocket_endpoint(
    websocket: WebSocket
):
    await manager.connect(websocket)

    try:
        await websocket.send_json(
            create_event(
                "system.connected",
                {
                    "status": "connected",
                    "service": "CITYFLOW AI",
                },
            )
        )

        while True:
            await websocket.receive_text()

    except WebSocketDisconnect:
        manager.disconnect(websocket)

    except Exception as error:
        print(
            f"[WebSocket] Connection error: {error}"
        )

        manager.disconnect(websocket)