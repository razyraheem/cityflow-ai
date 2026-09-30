from datetime import datetime, timezone

from sqlalchemy.orm import Session

from ..models import Intersection, SignalPlan
from .prediction_service import prediction_service


class SignalOptimizationService:

    INTERSECTION_CAMERA_MAP = {
        "INT-001": "CAM-001",
        "INT-002": "CAM-002",
    }

    def _clamp(self, value, minimum, maximum):
        return max(minimum, min(maximum, value))

    def _refresh_intersection_prediction(
        self,
        db: Session,
        intersection: Intersection,
    ):
        camera_id = self.INTERSECTION_CAMERA_MAP.get(
            intersection.intersection_id
        )

        if not camera_id:
            return {
                "updated": False,
                "reason": "No camera mapping configured",
            }

        predictions = prediction_service.get_camera_predictions(
            db,
            [camera_id],
        )

        if not predictions:
            return {
                "updated": False,
                "reason": f"Camera {camera_id} prediction unavailable",
            }

        prediction = predictions[0]

        predicted_congestion = float(
            prediction["predicted10Min"]
        )

        # Update the in-memory ORM object.
        # The caller decides whether this change is committed.
        intersection.predicted_congestion = predicted_congestion

        return {
            "updated": True,
            "cameraId": camera_id,
            "currentCongestion":
                prediction["currentCongestion"],
            "predicted5Min":
                prediction["predicted5Min"],
            "predicted10Min":
                prediction["predicted10Min"],
            "predicted15Min":
                prediction["predicted15Min"],
            "confidence":
                prediction["confidence"],
            "status":
                prediction["status"],
            "recommendation":
                prediction["recommendation"],
        }

    def _calculate_plan(self, intersection):

        ns_traffic = float(
            intersection.north_south_traffic or 0
        )

        ew_traffic = float(
            intersection.east_west_traffic or 0
        )

        current_congestion = float(
            intersection.congestion or 0
        )

        predicted_congestion = float(
            intersection.predicted_congestion
            or current_congestion
        )

        total_traffic = ns_traffic + ew_traffic

        if total_traffic <= 0:
            ns_ratio = 0.5
            ew_ratio = 0.5
        else:
            ns_ratio = ns_traffic / total_traffic
            ew_ratio = ew_traffic / total_traffic

        base_green = 45

        congestion_boost = self._clamp(
            predicted_congestion * 0.25,
            0,
            25,
        )

        available_green = base_green + congestion_boost

        north_south_green = round(
            self._clamp(
                available_green *
                (0.55 + ns_ratio * 0.45),
                30,
                90,
            )
        )

        east_west_green = round(
            self._clamp(
                available_green *
                (0.55 + ew_ratio * 0.45),
                30,
                90,
            )
        )

        cycle_time = round(
            self._clamp(
                north_south_green
                + east_west_green
                + 10,
                90,
                180,
            )
        )

        congestion_reduction = round(
            self._clamp(
                predicted_congestion * 0.12,
                4,
                15,
            ),
            1,
        )

        queue_reduction = round(
            self._clamp(
                predicted_congestion * 0.15,
                5,
                20,
            ),
            1,
        )

        optimized_congestion = round(
            max(
                0,
                predicted_congestion
                - congestion_reduction,
            ),
            1,
        )

        return {
            "northSouthGreen": north_south_green,
            "eastWestGreen": east_west_green,
            "cycleTime": cycle_time,
            "expectedCongestionReduction":
                congestion_reduction,
            "expectedQueueReduction":
                queue_reduction,
            "expectedCongestionAfterOptimization":
                optimized_congestion,
            "nsTraffic":
                ns_traffic,
            "ewTraffic":
                ew_traffic,
            "predictedCongestion":
                predicted_congestion,
        }

    def _get_reason(self, plan):

        ns = plan["nsTraffic"]
        ew = plan["ewTraffic"]
        congestion = plan["predictedCongestion"]

        if congestion >= 80:

            if ns > ew:
                return (
                    "Critical congestion predicted. "
                    "AI prioritizes North-South traffic "
                    "and extends its green phase to "
                    "reduce queue buildup."
                )

            return (
                "Critical congestion predicted. "
                "AI prioritizes East-West traffic "
                "and extends its green phase to "
                "reduce queue buildup."
            )

        if ns > ew:
            return (
                "North-South traffic demand is higher. "
                "AI allocates additional green time "
                "to the North-South direction."
            )

        if ew > ns:
            return (
                "East-West traffic demand is higher. "
                "AI allocates additional green time "
                "to the East-West direction."
            )

        return (
            "Traffic demand is balanced. "
            "AI maintains a balanced signal cycle."
        )

    def _get_confidence(self, plan):

        confidence = 75.0

        if plan["predictedCongestion"] >= 70:
            confidence += 8

        if (
            plan["nsTraffic"] > 0
            or plan["ewTraffic"] > 0
        ):
            confidence += 5

        return min(confidence, 95.0)

    def calculate_optimization(
        self,
        db: Session,
        intersection_id: str,
    ):
        """
        Calculate an optimization without creating
        a SignalPlan database record.

        Used by GET /api/signals.
        """

        intersection = (
            db.query(Intersection)
            .filter(
                Intersection.intersection_id
                == intersection_id
            )
            .first()
        )

        if not intersection:
            return None

        prediction_data = (
            self._refresh_intersection_prediction(
                db,
                intersection,
            )
        )

        plan = self._calculate_plan(intersection)

        reason = self._get_reason(plan)

        confidence = self._get_confidence(plan)

        if prediction_data.get("updated"):

            prediction_confidence = float(
                prediction_data.get(
                    "confidence",
                    70,
                )
            )

            confidence = round(
                (
                    confidence
                    + prediction_confidence
                ) / 2,
                1,
            )

        recommended_plan = {
            "northSouthGreen":
                plan["northSouthGreen"],

            "eastWestGreen":
                plan["eastWestGreen"],

            "cycleTime":
                plan["cycleTime"],

            "expectedCongestionReduction":
                plan["expectedCongestionReduction"],

            "expectedQueueReduction":
                plan["expectedQueueReduction"],

            "expectedCongestionAfterOptimization":
                plan[
                    "expectedCongestionAfterOptimization"
                ],

            "reason":
                reason,

            "confidence":
                confidence,

            "status":
                "AI_OPTIMIZED",

            "predictionSource":
                prediction_data,

            "optimizedAt":
                datetime.now(
                    timezone.utc
                ).isoformat(),
        }

        return self._format_intersection(
            intersection,
            recommended_plan,
        )

    def save_optimization(
        self,
        db: Session,
        intersection_id: str,
    ):
        """
        Calculate and explicitly save an optimization.

        Used by POST /api/signals/optimize.
        """

        result = self.calculate_optimization(
            db,
            intersection_id,
        )

        if not result:
            return None

        intersection = (
            db.query(Intersection)
            .filter(
                Intersection.intersection_id
                == intersection_id
            )
            .first()
        )

        recommended_plan = (
            result["recommendedSignalPlan"]
        )

        intersection.recommended_signal_plan = (
            recommended_plan
        )

        signal_plan = SignalPlan(
            intersection_id=intersection_id,
            north_south_duration=
                recommended_plan[
                    "northSouthGreen"
                ],
            east_west_duration=
                recommended_plan[
                    "eastWestGreen"
                ],
            cycle_time=
                recommended_plan[
                    "cycleTime"
                ],
            source="AI",
            status="AI_OPTIMIZED",
        )

        db.add(signal_plan)

        db.commit()

        db.refresh(intersection)

        return result

    def get_all(self, db: Session):
        """
        READ-ONLY.

        Calculates recommendations for all
        intersections without inserting SignalPlan rows.
        """

        intersections = (
            db.query(Intersection)
            .order_by(
                Intersection.congestion.desc()
            )
            .all()
        )

        results = []

        for intersection in intersections:

            result = self.calculate_optimization(
                db,
                intersection.intersection_id,
            )

            if result:
                results.append(result)

        # Important:
        # Prediction refresh changes the ORM object
        # in memory. Roll it back so GET does not persist
        # predicted_congestion changes either.
        db.rollback()

        return results

    def get_one(
        self,
        db: Session,
        intersection_id: str,
    ):
        """
        READ-ONLY single-intersection calculation.
        """

        result = self.calculate_optimization(
            db,
            intersection_id,
        )

        # Do not persist prediction refresh.
        db.rollback()

        return result

    def _format_intersection(
        self,
        intersection,
        recommended,
    ):

        return {
            "intersectionId":
                intersection.intersection_id,

            "name":
                intersection.name,

            "latitude":
                intersection.latitude,

            "longitude":
                intersection.longitude,

            "currentCongestion":
                intersection.congestion,

            "predictedCongestion":
                recommended[
                    "predictionSource"
                ].get(
                    "predicted10Min",
                    intersection.predicted_congestion,
                ),

            "traffic": {
                "northSouth":
                    intersection.north_south_traffic,

                "eastWest":
                    intersection.east_west_traffic,
            },

            "currentSignalPlan":
                intersection.current_signal_plan
                or {},

            "recommendedSignalPlan":
                recommended,

            "expectedCongestionReduction":
                recommended.get(
                    "expectedCongestionReduction",
                    0,
                ),

            "expectedQueueReduction":
                recommended.get(
                    "expectedQueueReduction",
                    0,
                ),

            "reason":
                recommended.get(
                    "reason",
                    "",
                ),

            "confidence":
                recommended.get(
                    "confidence",
                    0,
                ),

            "status":
                recommended.get(
                    "status",
                    "AI_OPTIMIZED",
                ),
        }


signal_service = SignalOptimizationService()