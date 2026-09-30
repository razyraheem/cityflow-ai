from datetime import datetime, timezone
from typing import Optional

from sqlalchemy.orm import Session

from ..models import EmergencyVehicle, Intersection, Camera


class EmergencyService:

    # Demo corridor for the current seeded CITYFLOW network.
    # Later this can be replaced with a graph/OSRM/Google Maps routing engine.
    ROUTES = {
        "CITY-CORRIDOR-01": {
            "name": "MG Road → Lalbagh Emergency Corridor",
            "origin": "MG Road",
            "destination": "Lalbagh",
            "intersections": ["INT-001", "INT-002"],
            "route": [
                {
                    "intersectionId": "INT-001",
                    "name": "MG Road Brigade Junction",
                    "sequence": 1,
                },
                {
                    "intersectionId": "INT-002",
                    "name": "Lalbagh Junction",
                    "sequence": 2,
                },
            ],
        }
    }

    def _calculate_eta(
        self,
        db: Session,
        intersection_ids: list[str],
    ):
        """
        Estimate normal and optimized ETA using current intersection
        congestion.

        This is a prototype estimation model, not real-world navigation.
        """

        base_minutes = 12.0
        traffic_delay = 0.0

        intersections = (
            db.query(Intersection)
            .filter(Intersection.intersection_id.in_(intersection_ids))
            .all()
        )

        for intersection in intersections:
            congestion = float(intersection.congestion or 0)

            # Traffic delay contribution.
            traffic_delay += congestion * 0.025

        normal_eta = round(base_minutes + traffic_delay, 2)

        # Emergency green corridor reduces signal waiting.
        # Keep this conservative for demo purposes.
        optimized_eta = round(
            max(base_minutes * 0.55, normal_eta - len(intersection_ids) * 2.2),
            2,
        )

        time_saved = round(
            max(0, normal_eta - optimized_eta),
            2,
        )

        return normal_eta, optimized_eta, time_saved

    def detect_ambulance(
        self,
        db: Session,
        ambulance_id: str,
        vehicle_plate: Optional[str],
        current_location: str,
        destination: str,
        current_lat: float,
        current_lng: float,
        dest_lat: float,
        dest_lng: float,
    ):

        # Reuse existing active ambulance if already detected.
        existing = (
            db.query(EmergencyVehicle)
            .filter(
                EmergencyVehicle.ambulance_id == ambulance_id,
                EmergencyVehicle.priority_status != "COMPLETED",
            )
            .first()
        )

        if existing:
            return self._format(existing)

        route_info = self._select_route(
            current_location,
            destination,
        )

        intersection_ids = [
            item["intersectionId"]
            for item in route_info["route"]
        ]

        normal_eta, optimized_eta, time_saved = self._calculate_eta(
            db,
            intersection_ids,
        )

        emergency = EmergencyVehicle(
            ambulance_id=ambulance_id,
            vehicle_plate=vehicle_plate,
            origin=current_location,
            destination=destination,
            current_location=current_location,
            current_lat=current_lat,
            current_lng=current_lng,
            dest_lat=dest_lat,
            dest_lng=dest_lng,
            route=route_info["route"],
            normal_eta=normal_eta,
            optimized_eta=optimized_eta,
            time_saved=time_saved,
            priority_status="DETECTED",
            intersections=intersection_ids,
        )

        db.add(emergency)
        db.commit()
        db.refresh(emergency)

        return self._format(emergency)

    def _select_route(
        self,
        origin: str,
        destination: str,
    ):
        """
        Prototype route selector.

        Matches the current CITYFLOW demo network.
        """

        origin_lower = origin.lower()
        destination_lower = destination.lower()

        if (
            "mg road" in origin_lower
            and "lalbagh" in destination_lower
        ):
            return self.ROUTES["CITY-CORRIDOR-01"]

        # Default corridor for demo fallback.
        return self.ROUTES["CITY-CORRIDOR-01"]

    def recalculate_eta(
        self,
        db: Session,
        ambulance_id: str,
    ):

        emergency = (
            db.query(EmergencyVehicle)
            .filter(
                EmergencyVehicle.ambulance_id == ambulance_id
            )
            .first()
        )

        if not emergency:
            return None

        intersection_ids = emergency.intersections or []

        normal_eta, optimized_eta, time_saved = self._calculate_eta(
            db,
            intersection_ids,
        )

        emergency.normal_eta = normal_eta
        emergency.optimized_eta = optimized_eta
        emergency.time_saved = time_saved

        db.commit()
        db.refresh(emergency)

        return self._format(emergency)

    def activate_corridor(
        self,
        db: Session,
        ambulance_id: str,
    ):

        emergency = (
            db.query(EmergencyVehicle)
            .filter(
                EmergencyVehicle.ambulance_id == ambulance_id
            )
            .first()
        )

        if not emergency:
            return None

        # Recalculate before activation.
        result = self.recalculate_eta(db, ambulance_id)

        emergency.priority_status = "GREEN_CORRIDOR_ACTIVE"

        db.commit()
        db.refresh(emergency)

        return self._format(emergency)

    def complete_corridor(
        self,
        db: Session,
        ambulance_id: str,
    ):

        emergency = (
            db.query(EmergencyVehicle)
            .filter(
                EmergencyVehicle.ambulance_id == ambulance_id
            )
            .first()
        )

        if not emergency:
            return None

        emergency.priority_status = "COMPLETED"

        db.commit()
        db.refresh(emergency)

        return self._format(emergency)

    def get_all(self, db: Session):

        emergencies = (
            db.query(EmergencyVehicle)
            .order_by(EmergencyVehicle.created_at.desc())
            .all()
        )

        return [self._format(item) for item in emergencies]

    def get_one(
        self,
        db: Session,
        ambulance_id: str,
    ):

        emergency = (
            db.query(EmergencyVehicle)
            .filter(
                EmergencyVehicle.ambulance_id == ambulance_id
            )
            .first()
        )

        if not emergency:
            return None

        return self._format(emergency)

    def _format(
        self,
        emergency: EmergencyVehicle,
    ):

        return {
            "ambulanceId": emergency.ambulance_id,
            "vehiclePlate": emergency.vehicle_plate,
            "origin": emergency.origin,
            "destination": emergency.destination,
            "currentLocation": emergency.current_location,
            "currentLat": emergency.current_lat,
            "currentLng": emergency.current_lng,
            "destinationLat": emergency.dest_lat,
            "destinationLng": emergency.dest_lng,
            "normalEta": emergency.normal_eta,
            "optimizedEta": emergency.optimized_eta,
            "timeSaved": emergency.time_saved,
            "priorityStatus": emergency.priority_status,
            "prioritizedIntersections": emergency.intersections or [],
            "route": emergency.route or [],
            "greenCorridorActive": (
                emergency.priority_status
                == "GREEN_CORRIDOR_ACTIVE"
            ),
            "updatedAt": datetime.now(timezone.utc).isoformat(),
        }


emergency_service = EmergencyService()