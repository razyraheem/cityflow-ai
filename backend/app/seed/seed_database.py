from datetime import datetime, timedelta

from app.core.database import SessionLocal, Base, engine
from app.models import (
    Camera,
    Vehicle,
    Detection,
    Trajectory,
    Intersection,
    Incident,
    Prediction,
    EmergencyVehicle,
    SignalPlan,
    SimulationRun,
    User,
    AuditLog,
)


# =========================================================
# CITYFLOW AI - DATABASE SEED
# =========================================================

def seed_database():
    print("Seeding CITYFLOW AI database...")

    # Create tables if they do not exist
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    try:
        # -------------------------------------------------
        # PREVENT DUPLICATE SEEDING
        # -------------------------------------------------

        if db.query(Camera).count() > 0:
            print("Database already contains data. Skipping seed.")
            return

        # =================================================
        # CAMERAS
        # =================================================

        cameras = [
            Camera(
                camera_id="CAM-001",
                name="MG Road - Brigade Junction",
                road="MG Road",
                latitude=12.9716,
                longitude=77.5946,
                status="ONLINE",
                vehicles_detected=624,
                average_speed=34.0,
                congestion=67,
                last_updated="Just now",
                zone="Central Business District",
                resolution="4K Ultra-HD",
                fps=30,
                stream_type="4K AI-Enhanced Optical Flow",
                optical_flow_rate=98.0,
                video_url="/videos/cctv-junction.mp4",
                health={
                    "latencyMs": 14,
                    "packetLoss": 0.0,
                    "uptime": "99.98%",
                    "temp": 41.2,
                },
            ),
            Camera(
                camera_id="CAM-002",
                name="Lalbagh Junction",
                road="Lalbagh Road",
                latitude=12.9507,
                longitude=77.5848,
                status="ONLINE",
                vehicles_detected=481,
                average_speed=31.0,
                congestion=72,
                last_updated="Just now",
                zone="South Zone",
                resolution="4K Ultra-HD",
                fps=30,
                stream_type="4K AI-Enhanced Optical Flow",
                optical_flow_rate=98.0,
                video_url="/videos/cctv-junction.mp4",
                health={
                    "latencyMs": 14,
                    "packetLoss": 0.0,
                    "uptime": "99.98%",
                    "temp": 41.2,
                },
            ),
            Camera(
                camera_id="CAM-003",
                name="Richmond Road Junction",
                road="Richmond Road",
                latitude=12.9645,
                longitude=77.6005,
                status="ONLINE",
                vehicles_detected=392,
                average_speed=38.0,
                congestion=54,
                last_updated="Just now",
                zone="Central Zone",
                resolution="4K Ultra-HD",
                fps=30,
                stream_type="4K AI-Enhanced Optical Flow",
                optical_flow_rate=98.0,
                video_url="/videos/cctv-junction.mp4",
                health={
                    "latencyMs": 14,
                    "packetLoss": 0.0,
                    "uptime": "99.98%",
                    "temp": 41.2,
                },
            ),
            Camera(
                camera_id="CAM-004",
                name="Indiranagar 100 Feet Road",
                road="100 Feet Road",
                latitude=12.9784,
                longitude=77.6408,
                status="ONLINE",
                vehicles_detected=715,
                average_speed=28.0,
                congestion=81,
                last_updated="Just now",
                zone="East Zone",
                resolution="4K Ultra-HD",
                fps=30,
                stream_type="4K AI-Enhanced Optical Flow",
                optical_flow_rate=98.0,
                video_url="/videos/cctv-junction.mp4",
                health={
                    "latencyMs": 14,
                    "packetLoss": 0.0,
                    "uptime": "99.98%",
                    "temp": 41.2,
                },
            ),
            Camera(
                camera_id="CAM-005",
                name="Koramangala Junction",
                road="Koramangala",
                latitude=12.9352,
                longitude=77.6245,
                status="DEGRADED",
                vehicles_detected=543,
                average_speed=29.0,
                congestion=76,
                last_updated="Just now",
                zone="South-East Zone",
                resolution="4K Ultra-HD",
                fps=30,
                stream_type="4K AI-Enhanced Optical Flow",
                optical_flow_rate=98.0,
                video_url="/videos/cctv-junction.mp4",
                health={
                    "latencyMs": 14,
                    "packetLoss": 0.0,
                    "uptime": "99.98%",
                    "temp": 41.2,
                },
            ),
            Camera(
                camera_id="CAM-006",
                name="Hebbal Flyover",
                road="Bellary Road",
                latitude=13.0358,
                longitude=77.5970,
                status="ONLINE",
                vehicles_detected=698,
                average_speed=41.0,
                congestion=49,
                last_updated="Just now",
                zone="North Zone",
                resolution="4K Ultra-HD",
                fps=30,
                stream_type="4K AI-Enhanced Optical Flow",
                optical_flow_rate=98.0,
                video_url="/videos/cctv-junction.mp4",
                health={
                    "latencyMs": 14,
                    "packetLoss": 0.0,
                    "uptime": "99.98%",
                    "temp": 41.2,
                },
            ),
        ]

        db.add_all(cameras)

        # =================================================
        # VEHICLES
        # =================================================

        vehicles = [
            Vehicle(
                vehicle_id="VH-0001",
                plate_number="KA19AB1234",
                vehicle_type="Car",
                color="White",
                confidence=98.7,
                current_camera="CAM-001",
                current_location_name="MG Road Junction",
                speed=34.0,
                direction="Eastbound",
                first_seen="10:02:14",
                last_seen="10:15:32",
                make_model="Hyundai Creta",
                re_id_score=96.5,
                re_id_breakdown={
                    "plateSimilarity": 98.4,
                    "appearanceSimilarity": 94.6,
                    "timeConsistency": 97.2,
                    "routeConsistency": 96.0,
                },
                trajectory_id="TRJ-KA19AB1234",
            ),
            Vehicle(
                vehicle_id="VH-0002",
                plate_number="KA01MN4582",
                vehicle_type="Bike",
                color="Black",
                confidence=97.8,
                current_camera="CAM-002",
                current_location_name="Lalbagh Junction",
                speed=42.0,
                direction="Northbound",
                first_seen="10:04:21",
                last_seen="10:16:08",
                make_model="Royal Enfield Hunter",
                re_id_score=94.8,
                re_id_breakdown={
                    "plateSimilarity": 98.4,
                    "appearanceSimilarity": 94.6,
                    "timeConsistency": 97.2,
                    "routeConsistency": 96.0,
                },
                trajectory_id="TRJ-KA01MN4582",
            ),
            Vehicle(
                vehicle_id="VH-0003",
                plate_number="KA05MK7721",
                vehicle_type="Car",
                color="Blue",
                confidence=99.1,
                current_camera="CAM-004",
                current_location_name="Indiranagar 100 Feet Road",
                speed=27.0,
                direction="Westbound",
                first_seen="10:01:42",
                last_seen="10:17:12",
                make_model="Maruti Suzuki Baleno",
                re_id_score=97.2,
                re_id_breakdown={
                    "plateSimilarity": 98.4,
                    "appearanceSimilarity": 94.6,
                    "timeConsistency": 97.2,
                    "routeConsistency": 96.0,
                },
                trajectory_id="TRJ-KA05MK7721",
            ),
            Vehicle(
                vehicle_id="VH-0004",
                plate_number="KA03ZP9021",
                vehicle_type="Bus",
                color="Red",
                confidence=96.4,
                current_camera="CAM-006",
                current_location_name="Hebbal Flyover",
                speed=39.0,
                direction="Southbound",
                first_seen="10:03:11",
                last_seen="10:18:04",
                make_model="Ashok Leyland",
                re_id_score=92.7,
                re_id_breakdown={
                    "plateSimilarity": 98.4,
                    "appearanceSimilarity": 94.6,
                    "timeConsistency": 97.2,
                    "routeConsistency": 96.0,
                },
                trajectory_id="TRJ-KA03ZP9021",
            ),
            Vehicle(
                vehicle_id="VH-0005",
                plate_number="KA41EF7712",
                vehicle_type="Truck",
                color="White",
                confidence=95.9,
                current_camera="CAM-005",
                current_location_name="Koramangala Junction",
                speed=22.0,
                direction="Northbound",
                first_seen="10:05:18",
                last_seen="10:18:42",
                make_model="Tata Prima",
                re_id_score=91.8,
                re_id_breakdown={
                    "plateSimilarity": 98.4,
                    "appearanceSimilarity": 94.6,
                    "timeConsistency": 97.2,
                    "routeConsistency": 96.0,
                },
                trajectory_id="TRJ-KA41EF7712",
            ),
            Vehicle(
                vehicle_id="VH-AMB01",
                plate_number="KA02EM1122",
                vehicle_type="Ambulance",
                color="White",
                confidence=99.5,
                current_camera="CAM-001",
                current_location_name="MG Road Junction",
                speed=46.0,
                direction="Southbound",
                first_seen="10:12:10",
                last_seen="10:18:55",
                make_model="Force Traveller Ambulance",
                re_id_score=98.8,
                re_id_breakdown={
                    "plateSimilarity": 98.4,
                    "appearanceSimilarity": 94.6,
                    "timeConsistency": 97.2,
                    "routeConsistency": 96.0,
                },
                trajectory_id="TRJ-KA02EM1122",
            ),
        ]

        db.add_all(vehicles)

        # =================================================
        # DETECTIONS
        # =================================================

        detections = [
            Detection(
                detection_id="DET-AMB01",
                vehicle_id="VH-AMB01",
                camera_id="CAM-001",
                plate_number="KA02EM1122",
                vehicle_type="Ambulance",
                color="White",
                confidence=99.5,
                speed=46.0,
                lane=1,
                timestamp="10:18:55",
                bounding_box={
                    "x": 420,
                    "y": 180,
                    "width": 160,
                    "height": 120,
                },
            ),
            Detection(
                detection_id="DET-10001",
                vehicle_id="VH-0001",
                camera_id="CAM-001",
                plate_number="KA19AB1234",
                vehicle_type="Car",
                color="White",
                confidence=98.7,
                speed=34.0,
                lane=2,
                timestamp="10:15:32",
                bounding_box={
                    "x": 300,
                    "y": 190,
                    "width": 150,
                    "height": 110,
                },
            ),
            Detection(
                detection_id="DET-10002",
                vehicle_id="VH-0001",
                camera_id="CAM-003",
                plate_number="KA19AB1234",
                vehicle_type="Car",
                color="White",
                confidence=97.9,
                speed=37.0,
                lane=1,
                timestamp="10:11:21",
                bounding_box={
                    "x": 260,
                    "y": 180,
                    "width": 150,
                    "height": 110,
                },
            ),
            Detection(
                detection_id="DET-10003",
                vehicle_id="VH-0002",
                camera_id="CAM-002",
                plate_number="KA01MN4582",
                vehicle_type="Bike",
                color="Black",
                confidence=97.8,
                speed=42.0,
                lane=3,
                timestamp="10:16:08",
                bounding_box={
                    "x": 500,
                    "y": 220,
                    "width": 90,
                    "height": 120,
                },
            ),
            Detection(
                detection_id="DET-10004",
                vehicle_id="VH-0003",
                camera_id="CAM-004",
                plate_number="KA05MK7721",
                vehicle_type="Car",
                color="Blue",
                confidence=99.1,
                speed=27.0,
                lane=2,
                timestamp="10:17:12",
                bounding_box={
                    "x": 340,
                    "y": 180,
                    "width": 150,
                    "height": 110,
                },
            ),
            Detection(
                detection_id="DET-10005",
                vehicle_id="VH-0004",
                camera_id="CAM-006",
                plate_number="KA03ZP9021",
                vehicle_type="Bus",
                color="Red",
                confidence=96.4,
                speed=39.0,
                lane=1,
                timestamp="10:18:04",
                bounding_box={
                    "x": 240,
                    "y": 160,
                    "width": 220,
                    "height": 160,
                },
            ),
            Detection(
                detection_id="DET-10006",
                vehicle_id="VH-0005",
                camera_id="CAM-005",
                plate_number="KA41EF7712",
                vehicle_type="Truck",
                color="White",
                confidence=95.9,
                speed=22.0,
                lane=2,
                timestamp="10:18:42",
                bounding_box={
                    "x": 280,
                    "y": 170,
                    "width": 200,
                    "height": 150,
                },
            ),
        ]

        db.add_all(detections)

        # =================================================
        # TRAJECTORIES
        # =================================================

        trajectories = [
            # ---------------------------------------------
            # VEHICLE 1
            # Richmond Road -> MG Road
            # ---------------------------------------------
            Trajectory(
                trajectory_id="TRJ-KA19AB1234",
                vehicle_id="VH-0001",
                plate_number="KA19AB1234",
                vehicle_type="Car",
                color="White",
                origin="Richmond Road",
                destination="MG Road Junction",
                start_time="10:02:14",
                end_time="10:15:32",
                total_travel_time="13m 18s",
                average_speed=35.4,
                distance=7.8,
                confidence=96.5,
                cameras_visited=[
                    "CAM-003",
                    "CAM-001",
                ],
                path=[
                    {
                        "cameraId": "CAM-003",
                        "cameraName": "Richmond Road Junction",
                        "timestamp": "10:02:14",
                        "latitude": 12.9645,
                        "longitude": 77.6005,
                        "speed": 37.0,
                        "confidence": 97.9,
                    },
                    {
                        "cameraId": "CAM-001",
                        "cameraName": "MG Road - Brigade Junction",
                        "timestamp": "10:15:32",
                        "latitude": 12.9716,
                        "longitude": 77.5946,
                        "speed": 34.0,
                        "confidence": 98.7,
                    },
                ],
            ),

            # ---------------------------------------------
            # VEHICLE 2
            # Lalbagh
            # ---------------------------------------------
            Trajectory(
                trajectory_id="TRJ-KA01MN4582",
                vehicle_id="VH-0002",
                plate_number="KA01MN4582",
                vehicle_type="Bike",
                color="Black",
                origin="Lalbagh",
                destination="Lalbagh Junction",
                start_time="10:04:21",
                end_time="10:16:08",
                total_travel_time="11m 47s",
                average_speed=40.2,
                distance=6.2,
                confidence=94.8,
                cameras_visited=[
                    "CAM-002",
                ],
                path=[
                    {
                        "cameraId": "CAM-002",
                        "cameraName": "Lalbagh Junction",
                        "timestamp": "10:16:08",
                        "latitude": 12.9507,
                        "longitude": 77.5848,
                        "speed": 42.0,
                        "confidence": 97.8,
                    },
                ],
            ),

            # ---------------------------------------------
            # AMBULANCE
            # City Hospital -> Trauma Center
            # ---------------------------------------------
            Trajectory(
                trajectory_id="TRJ-KA02EM1122",
                vehicle_id="VH-AMB01",
                plate_number="KA02EM1122",
                vehicle_type="Ambulance",
                color="White",
                origin="City Hospital",
                destination="Trauma Center",
                start_time="10:12:10",
                end_time="10:18:55",
                total_travel_time="6m 45s",
                average_speed=46.0,
                distance=5.9,
                confidence=98.8,
                cameras_visited=[
                    "CAM-003",
                    "CAM-001",
                ],
                path=[
                    {
                        "cameraId": "CAM-003",
                        "cameraName": "Richmond Road Junction",
                        "timestamp": "10:12:10",
                        "latitude": 12.9645,
                        "longitude": 77.6005,
                        "speed": 44.0,
                        "confidence": 98.5,
                    },
                    {
                        "cameraId": "CAM-001",
                        "cameraName": "MG Road - Brigade Junction",
                        "timestamp": "10:18:55",
                        "latitude": 12.9716,
                        "longitude": 77.5946,
                        "speed": 46.0,
                        "confidence": 99.5,
                    },
                ],
            ),
        ]

        db.add_all(trajectories)

        # =================================================
        # INTERSECTIONS
        # =================================================

        intersections = [
            Intersection(
                intersection_id="INT-001",
                name="MG Road - Brigade Junction",
                latitude=12.9716,
                longitude=77.5946,
                north_south_traffic=620,
                east_west_traffic=810,
                current_signal_plan={
                    "northSouth": 45,
                    "eastWest": 60,
                },
                recommended_signal_plan={
                    "northSouth": 55,
                    "eastWest": 50,
                },
                congestion=67,
                predicted_congestion=78,
                queue_length={
                    "north": 47,
                    "south": 38,
                    "east": 52,
                    "west": 44,
                },
                status="OPTIMIZING",
            ),
            Intersection(
                intersection_id="INT-002",
                name="Lalbagh Junction",
                latitude=12.9507,
                longitude=77.5848,
                north_south_traffic=540,
                east_west_traffic=690,
                current_signal_plan={
                    "northSouth": 40,
                    "eastWest": 55,
                },
                recommended_signal_plan={
                    "northSouth": 48,
                    "eastWest": 47,
                },
                congestion=72,
                predicted_congestion=82,
                queue_length={
                    "north": 51,
                    "south": 43,
                    "east": 59,
                    "west": 46,
                },
                status="OPTIMIZING",
            ),
        ]

        db.add_all(intersections)

        # =================================================
        # INCIDENTS
        # =================================================

        incidents = [
            Incident(
                incident_id="INC-001",
                type="CONGESTION_SPIKE",
                severity="HIGH",
                camera_id="CAM-004",
                camera_name="Indiranagar 100 Feet Road",
                road="100 Feet Road",
                latitude=12.9784,
                longitude=77.6408,
                timestamp="10:18:10",
                speed_change=-18.0,
                queue_growth=31.0,
                confidence=94.2,
                status="ACTIVE",
                details="Rapid increase in vehicle density detected.",
            ),
            Incident(
                incident_id="INC-002",
                type="SLOW_TRAFFIC",
                severity="MEDIUM",
                camera_id="CAM-005",
                camera_name="Koramangala Junction",
                road="Koramangala",
                latitude=12.9352,
                longitude=77.6245,
                timestamp="10:18:30",
                speed_change=-12.0,
                queue_growth=19.0,
                confidence=91.6,
                status="MONITORING",
                details="Average speed falling below expected road speed.",
            ),
        ]

        db.add_all(incidents)

        # =================================================
        # PREDICTIONS
        # =================================================

        predictions = [
            Prediction(
                intersection_id="INT-001",
                intersection_name="MG Road - Brigade Junction",
                prediction_time="10:28:00",
                current_congestion=67,
                predicted_5_min=74,
                predicted_10_min=82,
                predicted_15_min=86,
                status="RISING",
                confidence=94.0,
                factors=[
                    "Increasing vehicle density",
                    "Reduced average speed",
                    "Queue growth",
                    "Peak-hour flow",
                ],
                recommendation="Increase east-west green time and activate adaptive signal plan.",
                simulation_impact={
                    "waitingReduction": 31,
                    "travelTimeReduction": 18,
                },
            ),
            Prediction(
                intersection_id="INT-002",
                intersection_name="Lalbagh Junction",
                prediction_time="10:28:00",
                current_congestion=72,
                predicted_5_min=78,
                predicted_10_min=84,
                predicted_15_min=88,
                status="RISING",
                confidence=92.0,
                factors=[
                    "High traffic volume",
                    "Queue accumulation",
                    "Low average speed",
                ],
                recommendation="Extend north-south green phase and coordinate upstream junction.",
                simulation_impact={
                    "waitingReduction": 27,
                    "travelTimeReduction": 15,
                },
            ),
        ]

        db.add_all(predictions)

        # =================================================
        # EMERGENCY VEHICLES
        # =================================================

        emergency_vehicles = [
            EmergencyVehicle(
                ambulance_id="A17",
                vehicle_plate="KA02EM1122",
                origin="City Hospital",
                destination="Trauma Center",
                current_location="Richmond Road Junction",
                current_lat=12.9645,
                current_lng=77.6005,
                dest_lat=12.9716,
                dest_lng=77.5946,
                route=[
                    "CAM-003",
                    "CAM-001",
                ],
                normal_eta="17:42",
                optimized_eta="12:58",
                time_saved="04:44",
                priority_status="GREEN_CORRIDOR_ACTIVE",
                intersections=[
                    "INT-001",
                    "INT-002",
                ],
            ),
        ]

        db.add_all(emergency_vehicles)

        # =================================================
        # SIGNAL PLANS
        # =================================================

        signal_plans = [
            SignalPlan(
                intersection_id="INT-001",
                north_south_duration=55,
                east_west_duration=50,
                cycle_time=105,
                source="AI_OPTIMIZER",
                status="ACTIVE",
            ),
            SignalPlan(
                intersection_id="INT-002",
                north_south_duration=48,
                east_west_duration=47,
                cycle_time=95,
                source="AI_OPTIMIZER",
                status="ACTIVE",
            ),
        ]

        db.add_all(signal_plans)

        # =================================================
        # SIMULATION
        # =================================================

        simulation_runs = [
            SimulationRun(
                simulation_id="SIM-001",
                baseline_waiting=82.0,
                optimized_waiting=51.0,
                baseline_travel_time=16.4,
                optimized_travel_time=12.7,
                baseline_queue=47.0,
                optimized_queue=29.0,
                waiting_reduction_pct=37.8,
                travel_reduction_pct=22.6,
                queue_reduction_pct=38.3,
            ),
        ]

        db.add_all(simulation_runs)

        # =================================================
        # DEMO USER
        # =================================================

        users = [
            User(
                username="admin",
                email="admin@cityflow.ai",
                hashed_password="DEMO_PASSWORD_HASH",
                role="admin",
                is_active=True,
            ),
        ]

        db.add_all(users)

        # =================================================
        # AUDIT LOG
        # =================================================

        audit_logs = [
            AuditLog(
                user="admin",
                action="DATABASE_SEED",
                entity_type="SYSTEM",
                entity_id="CITYFLOW",
                details="Initial CITYFLOW AI demonstration database seeded.",
            ),
        ]

        db.add_all(audit_logs)

        # =================================================
        # COMMIT
        # =================================================

        db.commit()

        # =================================================
        # SUMMARY
        # =================================================

        print("CITYFLOW AI database seeded successfully.")
        print(f"Cameras: {db.query(Camera).count()}")
        print(f"Vehicles: {db.query(Vehicle).count()}")
        print(f"Detections: {db.query(Detection).count()}")
        print(f"Trajectories: {db.query(Trajectory).count()}")
        print(f"Intersections: {db.query(Intersection).count()}")
        print(f"Incidents: {db.query(Incident).count()}")
        print(f"Predictions: {db.query(Prediction).count()}")
        print(f"Emergency vehicles: {db.query(EmergencyVehicle).count()}")
        print(f"Signal plans: {db.query(SignalPlan).count()}")
        print(f"Simulation runs: {db.query(SimulationRun).count()}")
        print(f"Users: {db.query(User).count()}")
        print(f"Audit logs: {db.query(AuditLog).count()}")

    except Exception as e:
        db.rollback()
        print("ERROR while seeding database:")
        print(e)
        raise

    finally:
        db.close()


# =========================================================
# ENTRY POINT
# =========================================================

if __name__ == "__main__":
    seed_database()
