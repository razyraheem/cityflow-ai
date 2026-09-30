from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from ..models import Camera, Detection

class CameraService:
    def get_all(self, db: Session) -> List[Dict[str, Any]]:
        cameras = db.query(Camera).all()
        result = []
        for cam in cameras:
            # Fetch 3 latest detections
            dets = (
                db.query(Detection)
                .filter(Detection.camera_id == cam.camera_id)
                .order_by(Detection.id.desc())
                .limit(3)
                .all()
            )
            recent = [
                {
                    "id": d.detection_id or f"DET-{d.id}",
                    "plateNumber": d.plate_number,
                    "vehicleType": d.vehicle_type,
                    "confidence": d.confidence,
                    "speed": d.speed,
                    "timestamp": d.timestamp,
                    "lane": d.lane,
                    "color": d.color
                }
                for d in dets
            ]
            result.append({
                "cameraId": cam.camera_id,
                "name": cam.name,
                "road": cam.road,
                "latitude": cam.latitude,
                "longitude": cam.longitude,
                "status": cam.status,
                "vehiclesDetected": cam.vehicles_detected,
                "averageSpeed": cam.average_speed,
                "congestion": cam.congestion,
                "lastUpdated": cam.last_updated,
                "zone": cam.zone,
                "resolution": cam.resolution,
                "fps": cam.fps,
                "streamType": cam.stream_type,
                "opticalFlowRate": cam.optical_flow_rate,
                "videoUrl": cam.video_url,
                "health": cam.health or {"latencyMs": 14, "packetLoss": 0.0, "uptime": "99.98%", "temp": 41.2},
                "recentDetections": recent
            })
        return result

    def get_by_id(self, db: Session, camera_id: str) -> Optional[Dict[str, Any]]:
        cam = db.query(Camera).filter(Camera.camera_id.ilike(camera_id)).first()
        if not cam:
            return None
        dets = (
            db.query(Detection)
            .filter(Detection.camera_id == cam.camera_id)
            .order_by(Detection.id.desc())
            .limit(10)
            .all()
        )
        recent = [
            {
                "id": d.detection_id or f"DET-{d.id}",
                "plateNumber": d.plate_number,
                "vehicleType": d.vehicle_type,
                "confidence": d.confidence,
                "speed": d.speed,
                "timestamp": d.timestamp,
                "lane": d.lane,
                "color": d.color
            }
            for d in dets
        ]
        return {
            "cameraId": cam.camera_id,
            "name": cam.name,
            "road": cam.road,
            "latitude": cam.latitude,
            "longitude": cam.longitude,
            "status": cam.status,
            "vehiclesDetected": cam.vehicles_detected,
            "averageSpeed": cam.average_speed,
            "congestion": cam.congestion,
            "lastUpdated": cam.last_updated,
            "zone": cam.zone,
            "resolution": cam.resolution,
            "fps": cam.fps,
            "streamType": cam.stream_type,
            "opticalFlowRate": cam.optical_flow_rate,
            "videoUrl": cam.video_url,
            "health": cam.health or {"latencyMs": 14, "packetLoss": 0.0, "uptime": "99.98%", "temp": 41.2},
            "recentDetections": recent
        }

    def get_detections(self, db: Session, camera_id: str) -> List[Dict[str, Any]]:
        dets = (
            db.query(Detection)
            .filter(Detection.camera_id.ilike(camera_id))
            .order_by(Detection.id.desc())
            .limit(50)
            .all()
        )
        return [
            {
                "id": d.detection_id or f"DET-{d.id}",
                "plateNumber": d.plate_number,
                "vehicleType": d.vehicle_type,
                "confidence": d.confidence,
                "speed": d.speed,
                "timestamp": d.timestamp,
                "lane": d.lane,
                "color": d.color
            }
            for d in dets
        ]

    def get_traffic(self, db: Session, camera_id: str) -> Dict[str, Any]:
        cam = db.query(Camera).filter(Camera.camera_id.ilike(camera_id)).first()
        if not cam:
            return {}
        return {
            "cameraId": cam.camera_id,
            "vehiclesDetected": cam.vehicles_detected,
            "averageSpeed": cam.average_speed,
            "congestion": cam.congestion,
            "opticalFlowRate": cam.optical_flow_rate,
            "status": cam.status
        }

camera_service = CameraService()

