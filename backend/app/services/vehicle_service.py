from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import or_
from ..models import Vehicle, Detection

class VehicleService:
    def get_all(self, db: Session, query: Optional[str] = None, vehicle_type: Optional[str] = None) -> List[Dict[str, Any]]:
        q = db.query(Vehicle)
        if query:
            clean = query.strip().upper()
            q = q.filter(
                or_(
                    Vehicle.plate_number.contains(clean),
                    Vehicle.vehicle_id.ilike(f"%{clean}%"),
                    Vehicle.color.ilike(f"%{clean}%"),
                    Vehicle.make_model.ilike(f"%{clean}%")
                )
            )
        if vehicle_type:
            q = q.filter(Vehicle.vehicle_type.ilike(vehicle_type.strip()))
            
        vehicles = q.all()
        return [self._format_vehicle(v) for v in vehicles]

    def get_by_id(self, db: Session, vehicle_id: str) -> Optional[Dict[str, Any]]:
        v = db.query(Vehicle).filter(
            or_(
                Vehicle.vehicle_id.ilike(vehicle_id),
                Vehicle.plate_number.ilike(vehicle_id)
            )
        ).first()
        return self._format_vehicle(v) if v else None

    def search_by_plate(self, db: Session, plate: str) -> List[Dict[str, Any]]:
        clean = plate.strip().upper()
        vehicles = db.query(Vehicle).filter(Vehicle.plate_number.contains(clean)).all()
        return [self._format_vehicle(v) for v in vehicles]

    def get_detections_for_vehicle(self, db: Session, identifier: str) -> List[Dict[str, Any]]:
        dets = db.query(Detection).filter(
            or_(
                Detection.vehicle_id.ilike(identifier),
                Detection.plate_number.ilike(identifier)
            )
        ).order_by(Detection.id.desc()).all()
        return [
            {
                "id": d.detection_id or f"DET-{d.id}",
                "plateNumber": d.plate_number,
                "vehicleType": d.vehicle_type,
                "confidence": d.confidence,
                "speed": d.speed,
                "timestamp": d.timestamp,
                "lane": d.lane,
                "color": d.color,
                "cameraId": d.camera_id
            }
            for d in dets
        ]

    def _format_vehicle(self, v: Vehicle) -> Dict[str, Any]:
        return {
            "vehicleId": v.vehicle_id,
            "plateNumber": v.plate_number,
            "vehicleType": v.vehicle_type,
            "color": v.color,
            "confidence": v.confidence,
            "currentCamera": v.current_camera,
            "currentLocationName": v.current_location_name,
            "speed": v.speed,
            "direction": v.direction,
            "firstSeen": v.first_seen,
            "lastSeen": v.last_seen,
            "makeModel": v.make_model,
            "reIdScore": v.re_id_score,
            "reIdBreakdown": v.re_id_breakdown or {
                "plateSimilarity": 98.4,
                "appearanceSimilarity": 94.6,
                "timeConsistency": 97.2,
                "routeConsistency": 96.0
            },
            "trajectoryId": v.trajectory_id or f"TRJ-{v.plate_number}"
        }

vehicle_service = VehicleService()

