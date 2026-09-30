from datetime import datetime, timezone
from typing import Optional, List

from sqlalchemy.orm import Session

from ..models import Camera


class PredictionService:

    @staticmethod
    def clamp(value: float, minimum: float = 0, maximum: float = 100) -> float:
        return round(max(minimum, min(maximum, value)), 1)

    def calculate_prediction(
        self,
        congestion: float,
        average_speed: float,
        vehicles_detected: int,
        horizon: int,
    ) -> float:
        """
        Simple baseline prediction.

        This is NOT an ML model.
        It estimates future congestion using current traffic pressure.
        """

        # Traffic pressure increases when:
        # - congestion is high
        # - speed is low
        # - vehicle volume is high

        congestion_pressure = congestion

        # Convert speed into a pressure score.
        # Lower speed => higher traffic pressure.
        speed_pressure = max(0, min(100, (50 - average_speed) * 2))

        # Normalize observed vehicle count.
        # 700 vehicles is treated as heavy camera traffic.
        volume_pressure = max(
            0,
            min(100, (vehicles_detected / 700) * 100)
        )

        traffic_pressure = (
            congestion_pressure * 0.55
            + speed_pressure * 0.25
            + volume_pressure * 0.20
        )

        # Congestion tends to increase slightly over the prediction horizon.
        if horizon == 5:
            growth_factor = 0.04
        elif horizon == 10:
            growth_factor = 0.08
        else:
            growth_factor = 0.12

        predicted = congestion + (
            traffic_pressure * growth_factor
        )

        return self.clamp(predicted)

    def get_status(self, congestion: float) -> str:
        if congestion >= 80:
            return "CRITICAL"
        elif congestion >= 65:
            return "HIGH"
        elif congestion >= 40:
            return "MODERATE"
        else:
            return "LOW"

    def get_trend(
        self,
        current: float,
        predicted_15: float
    ) -> str:

        difference = predicted_15 - current

        if difference >= 5:
            return "RISING"
        elif difference <= -5:
            return "FALLING"
        else:
            return "STABLE"

    def get_recommendation(self, predicted: float) -> str:

        if predicted >= 85:
            return (
                "Severe congestion predicted. "
                "Consider adaptive signal timing and alternate routing."
            )

        if predicted >= 70:
            return (
                "Heavy congestion predicted. "
                "Increase green time for the dominant traffic direction."
            )

        if predicted >= 50:
            return (
                "Moderate congestion predicted. "
                "Monitor traffic flow and prepare signal adjustment."
            )

        return "Traffic flow expected to remain manageable."

    def get_camera_predictions(
        self,
        db: Session,
        camera_ids: Optional[List[str]] = None,
    ):

        query = db.query(Camera)

        if camera_ids:
            query = query.filter(Camera.camera_id.in_(camera_ids))

        cameras = query.order_by(Camera.congestion.desc()).all()

        predictions = []

        for camera in cameras:

            current = float(camera.congestion or 0)
            speed = float(camera.average_speed or 0)
            vehicles = int(camera.vehicles_detected or 0)

            predicted_5 = self.calculate_prediction(
                current,
                speed,
                vehicles,
                5,
            )

            predicted_10 = self.calculate_prediction(
                current,
                speed,
                vehicles,
                10,
            )

            predicted_15 = self.calculate_prediction(
                current,
                speed,
                vehicles,
                15,
            )

            trend = self.get_trend(
                current,
                predicted_15,
            )

            status = self.get_status(predicted_10)

            # Baseline confidence.
            # Higher confidence when the camera has strong traffic observations.
            confidence = 70.0

            if vehicles >= 500:
                confidence += 8

            if speed > 0:
                confidence += 5

            confidence = min(confidence, 95)

            congestion_pressure = round(current, 1)

            speed_pressure = round(
                max(0, min(100, (50 - speed) * 2)),
                1,
            )

            volume_pressure = round(
                max(0, min(100, (vehicles / 700) * 100)),
                1,
            )

            predictions.append({
                "cameraId": camera.camera_id,
                "cameraName": camera.name,
                "road": camera.road,

                "currentCongestion": current,

                "predicted5Min": predicted_5,
                "predicted10Min": predicted_10,
                "predicted15Min": predicted_15,

                "averageSpeed": speed,
                "vehiclesDetected": vehicles,

                "congestionTrend": trend,
                "status": status,
                "confidence": confidence,

                "factors": {
                    "congestionPressure": congestion_pressure,
                    "speedPressure": speed_pressure,
                    "volumePressure": volume_pressure,
                },

                "recommendation": self.get_recommendation(
                    predicted_10
                ),
            })

        return predictions

    def get_prediction_overview(
        self,
        db: Session,
        camera_ids: Optional[List[str]] = None,
    ):

        predictions = self.get_camera_predictions(
            db,
            camera_ids,
        )

        if not predictions:
            return {
                "generatedAt": datetime.now(timezone.utc).isoformat(),
                "model": "CITYFLOW Baseline Predictor v1",
                "predictionType": "traffic_congestion",
                "averageCurrentCongestion": 0,
                "averagePredicted5Min": 0,
                "averagePredicted10Min": 0,
                "averagePredicted15Min": 0,
                "highRiskCameras": 0,
                "predictions": [],
            }

        def average(field):
            return round(
                sum(item[field] for item in predictions)
                / len(predictions),
                1,
            )

        high_risk = sum(
            1
            for item in predictions
            if item["status"] in ["HIGH", "CRITICAL"]
        )

        return {
            "generatedAt": datetime.now(timezone.utc).isoformat(),
            "model": "CITYFLOW Baseline Predictor v1",
            "predictionType": "traffic_congestion",

            "averageCurrentCongestion": average(
                "currentCongestion"
            ),

            "averagePredicted5Min": average(
                "predicted5Min"
            ),

            "averagePredicted10Min": average(
                "predicted10Min"
            ),

            "averagePredicted15Min": average(
                "predicted15Min"
            ),

            "highRiskCameras": high_risk,

            "predictions": predictions,
        }


prediction_service = PredictionService()