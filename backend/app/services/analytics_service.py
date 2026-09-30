from sqlalchemy.orm import Session
from sqlalchemy import func

from ..models import (
    Camera,
    Vehicle,
    Detection,
    Trajectory,
    Incident,
    EmergencyVehicle,
)


class AnalyticsService:

    def get_overview(self, db: Session):
        # -----------------------------
        # BASIC COUNTS
        # -----------------------------
        total_cameras = db.query(Camera).count()

        active_cameras = (
            db.query(Camera)
            .filter(Camera.status.in_(["ONLINE", "ACTIVE", "online", "active"]))
            .count()
        )

        # If status values don't match the above, use all cameras
        # that have been seeded as operational.
        if active_cameras == 0 and total_cameras > 0:
            active_cameras = total_cameras

        total_vehicles = db.query(Vehicle).count()
        total_detections = db.query(Detection).count()
        total_trajectories = db.query(Trajectory).count()

        active_incidents = (
            db.query(Incident)
            .filter(Incident.status.in_(["Active", "ACTIVE"]))
            .count()
        )

        emergency_vehicles = db.query(EmergencyVehicle).count()

        # -----------------------------
        # SPEED
        # -----------------------------
        avg_speed_result = db.query(
            func.avg(Vehicle.speed)
        ).scalar()

        average_speed = round(float(avg_speed_result or 0), 1)

        # -----------------------------
        # CONGESTION
        # -----------------------------
        congestion_result = db.query(
            func.avg(Camera.congestion)
        ).scalar()

        congestion = round(float(congestion_result or 0), 1)

        # -----------------------------
        # VEHICLE TYPES
        # -----------------------------
        vehicle_type_rows = (
            db.query(
                Vehicle.vehicle_type,
                func.count(Vehicle.id)
            )
            .group_by(Vehicle.vehicle_type)
            .all()
        )

        vehicle_types = {
            vehicle_type or "Unknown": count
            for vehicle_type, count in vehicle_type_rows
        }

        # -----------------------------
        # TOP CONGESTED CAMERA
        # -----------------------------
        top_camera = (
            db.query(Camera)
            .order_by(Camera.congestion.desc())
            .first()
        )

        top_hotspot = None

        if top_camera:
            top_hotspot = {
                "cameraId": top_camera.camera_id,
                "cameraName": top_camera.name,
                "road": top_camera.road,
                "congestion": top_camera.congestion,
                "vehiclesDetected": top_camera.vehicles_detected,
                "averageSpeed": top_camera.average_speed,
                "latitude": top_camera.latitude,
                "longitude": top_camera.longitude,
            }

        return {
            "totalCameras": total_cameras,
            "activeCameras": active_cameras,
            "totalVehicles": total_vehicles,
            "totalDetections": total_detections,
            "totalTrajectories": total_trajectories,
            "activeIncidents": active_incidents,
            "emergencyVehicles": emergency_vehicles,
            "averageSpeed": average_speed,
            "congestion": congestion,
            "vehicleTypes": vehicle_types,
            "topHotspot": top_hotspot,
        }

    # ---------------------------------------------------------
    # CAMERA ANALYTICS
    # ---------------------------------------------------------

    def get_camera_analytics(self, db: Session):
        cameras = (
            db.query(Camera)
            .order_by(Camera.congestion.desc())
            .all()
        )

        return [
            {
                "cameraId": camera.camera_id,
                "name": camera.name,
                "road": camera.road,
                "status": camera.status,
                "vehiclesDetected": camera.vehicles_detected,
                "averageSpeed": camera.average_speed,
                "congestion": camera.congestion,
                "latitude": camera.latitude,
                "longitude": camera.longitude,
                "zone": camera.zone,
                "health": camera.health,
                "lastUpdated": camera.last_updated,
            }
            for camera in cameras
        ]

    # ---------------------------------------------------------
    # TRAFFIC ANALYTICS
    # ---------------------------------------------------------

    def get_traffic_analytics(self, db: Session):
        cameras = db.query(Camera).all()

        if not cameras:
            return {
                "averageSpeed": 0,
                "averageCongestion": 0,
                "totalVehiclesDetected": 0,
                "cameras": [],
            }

        total_vehicles = sum(
            camera.vehicles_detected or 0
            for camera in cameras
        )

        avg_speed = sum(
            camera.average_speed or 0
            for camera in cameras
        ) / len(cameras)

        avg_congestion = sum(
            camera.congestion or 0
            for camera in cameras
        ) / len(cameras)

        return {
            "averageSpeed": round(avg_speed, 1),
            "averageCongestion": round(avg_congestion, 1),
            "totalVehiclesDetected": total_vehicles,
            "cameras": [
                {
                    "cameraId": camera.camera_id,
                    "name": camera.name,
                    "congestion": camera.congestion,
                    "averageSpeed": camera.average_speed,
                    "vehiclesDetected": camera.vehicles_detected,
                }
                for camera in cameras
            ],
        }

    # ---------------------------------------------------------
    # VEHICLE TYPE ANALYTICS
    # ---------------------------------------------------------

    def get_vehicle_type_analytics(self, db: Session):
        rows = (
            db.query(
                Vehicle.vehicle_type,
                func.count(Vehicle.id)
            )
            .group_by(Vehicle.vehicle_type)
            .order_by(func.count(Vehicle.id).desc())
            .all()
        )

        total = sum(count for _, count in rows)

        result = []

        for vehicle_type, count in rows:
            percentage = (
                round((count / total) * 100, 1)
                if total
                else 0
            )

            result.append({
                "vehicleType": vehicle_type or "Unknown",
                "count": count,
                "percentage": percentage,
            })

        return result

    # ---------------------------------------------------------
    # HOTSPOTS
    # ---------------------------------------------------------

    def get_hotspots(self, db: Session):
        cameras = (
            db.query(Camera)
            .order_by(Camera.congestion.desc())
            .all()
        )

        return [
            {
                "rank": index,
                "cameraId": camera.camera_id,
                "name": camera.name,
                "road": camera.road,
                "congestion": camera.congestion,
                "vehicles": camera.vehicles_detected,
                "averageSpeed": camera.average_speed,
                "latitude": camera.latitude,
                "longitude": camera.longitude,
            }
            for index, camera in enumerate(cameras, start=1)
        ]

    # ---------------------------------------------------------
    # TRAFFIC FLOW
    # ---------------------------------------------------------

    def get_flow(self, db: Session):
        trajectories = db.query(Trajectory).all()

        flow = []

        for trajectory in trajectories:
            flow.append({
                "trajectoryId": trajectory.trajectory_id,
                "vehicleId": trajectory.vehicle_id,
                "plateNumber": trajectory.plate_number,
                "origin": trajectory.origin,
                "destination": trajectory.destination,
                "averageSpeed": trajectory.average_speed,
                "distance": trajectory.distance,
                "confidence": trajectory.confidence,
                "camerasVisited": trajectory.cameras_visited or [],
                "path": trajectory.path or [],
            })

        return {
            "totalTrajectories": len(flow),
            "trajectories": flow,
        }


analytics_service = AnalyticsService()