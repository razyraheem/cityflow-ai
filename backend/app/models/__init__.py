from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, JSON, ForeignKey, Text
from sqlalchemy.orm import relationship
from ..core.database import Base

class Camera(Base):
    __tablename__ = "cameras"

    id = Column(Integer, primary_key=True, index=True)
    camera_id = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(150), nullable=False)
    road = Column(String(150), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    status = Column(String(20), default="ONLINE")  # ONLINE, OFFLINE, DEGRADED
    vehicles_detected = Column(Integer, default=0)
    average_speed = Column(Float, default=35.0)
    congestion = Column(Integer, default=45)
    last_updated = Column(String(50), default="Just now")
    zone = Column(String(100), default="Central Business District")
    resolution = Column(String(50), default="4K Ultra-HD")
    fps = Column(Integer, default=30)
    stream_type = Column(String(100), default="4K AI-Enhanced Optical Flow")
    optical_flow_rate = Column(Float, default=98.0)
    video_url = Column(String(255), default="/videos/cctv-junction.mp4")
    health = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)

    detections = relationship("Detection", back_populates="camera")

class Vehicle(Base):
    __tablename__ = "vehicles"

    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(String(50), unique=True, index=True, nullable=False)
    plate_number = Column(String(50), unique=True, index=True, nullable=False)
    vehicle_type = Column(String(50), default="Car")  # Car, Bike, Bus, Truck, Ambulance
    color = Column(String(50), default="White")
    confidence = Column(Float, default=98.0)
    current_camera = Column(String(50), default="CAM-001")
    current_location_name = Column(String(150), default="MG Road Junction")
    speed = Column(Float, default=34.0)
    direction = Column(String(50), default="Eastbound")
    first_seen = Column(String(50), default="10:00:00")
    last_seen = Column(String(50), default="10:15:00")
    make_model = Column(String(100), default="Hyundai Creta")
    re_id_score = Column(Float, default=96.5)
    re_id_breakdown = Column(JSON, default=dict)
    trajectory_id = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    detections = relationship("Detection", back_populates="vehicle")

class Detection(Base):
    __tablename__ = "detections"

    id = Column(Integer, primary_key=True, index=True)
    detection_id = Column(String(50), index=True)
    vehicle_id = Column(String(50), ForeignKey("vehicles.vehicle_id"), nullable=True)
    camera_id = Column(String(50), ForeignKey("cameras.camera_id"), nullable=False)
    plate_number = Column(String(50), index=True, nullable=False)
    vehicle_type = Column(String(50), default="Car")
    color = Column(String(50), default="White")
    confidence = Column(Float, default=98.5)
    speed = Column(Float, default=35.0)
    lane = Column(Integer, default=1)
    timestamp = Column(String(50), default="10:02:14")
    bounding_box = Column(JSON, default=dict)  # {left, top, width, height}
    created_at = Column(DateTime, default=datetime.utcnow)

    camera = relationship("Camera", back_populates="detections")
    vehicle = relationship("Vehicle", back_populates="detections")

class Trajectory(Base):
    __tablename__ = "trajectories"

    id = Column(Integer, primary_key=True, index=True)
    trajectory_id = Column(String(50), unique=True, index=True, nullable=False)
    vehicle_id = Column(String(50), index=True, nullable=False)
    plate_number = Column(String(50), index=True, nullable=False)
    vehicle_type = Column(String(50), default="Car")
    color = Column(String(50), default="White")
    origin = Column(String(150), default="MG Road")
    destination = Column(String(150), default="Indiranagar")
    start_time = Column(String(50), default="10:02:14")
    end_time = Column(String(50), default="10:20:45")
    total_travel_time = Column(String(50), default="18m 31s")
    average_speed = Column(Float, default=36.4)
    distance = Column(Float, default=7.8)  # km
    confidence = Column(Float, default=96.4)
    cameras_visited = Column(JSON, default=list)
    path = Column(JSON, default=list)  # list of TrajectoryPoint dicts
    created_at = Column(DateTime, default=datetime.utcnow)

class Intersection(Base):
    __tablename__ = "intersections"

    id = Column(Integer, primary_key=True, index=True)
    intersection_id = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(150), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    north_south_traffic = Column(Integer, default=145)
    east_west_traffic = Column(Integer, default=112)
    current_signal_plan = Column(JSON, default=dict)
    recommended_signal_plan = Column(JSON, default=dict)
    congestion = Column(Integer, default=65)
    predicted_congestion = Column(Integer, default=78)
    queue_length = Column(JSON, default=dict)
    status = Column(String(50), default="NORMAL")  # NORMAL, OPTIMIZING, PRIORITY_CORRIDOR, HEAVY_CONGESTION
    created_at = Column(DateTime, default=datetime.utcnow)

class Incident(Base):
    __tablename__ = "incidents"

    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(String(50), unique=True, index=True, nullable=False)
    type = Column(String(100), default="Stationary Vehicle / Stall")
    severity = Column(String(20), default="WARNING")  # CRITICAL, WARNING, INFO
    camera_id = Column(String(50), nullable=False)
    camera_name = Column(String(150), nullable=False)
    road = Column(String(150), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    timestamp = Column(String(50), default="10:15:00")
    speed_change = Column(String(50), default="42 km/h -> 7 km/h")
    queue_growth = Column(String(50), default="+64 vehicles / 3 min")
    confidence = Column(Float, default=91.4)
    status = Column(String(50), default="Active")  # Active, Investigating, Resolved
    details = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)

class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    intersection_id = Column(String(50), index=True, nullable=False)
    intersection_name = Column(String(150), default="")
    prediction_time = Column(String(50), default="10:18:00")
    current_congestion = Column(Integer, default=78)
    predicted_5_min = Column(Integer, default=86)
    predicted_10_min = Column(Integer, default=94)
    predicted_15_min = Column(Integer, default=96)
    status = Column(String(100), default="CRITICAL SURGE DETECTED")
    confidence = Column(Float, default=91.0)
    factors = Column(JSON, default=dict)
    recommendation = Column(Text, default="")
    simulation_impact = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)

class EmergencyVehicle(Base):
    __tablename__ = "emergency_vehicles"

    id = Column(Integer, primary_key=True, index=True)
    ambulance_id = Column(String(50), unique=True, index=True, nullable=False)
    vehicle_plate = Column(String(50), nullable=False)
    origin = Column(String(150), default="Hospital")
    destination = Column(String(150), default="Trauma Center")
    current_location = Column(String(150), default="MG Road Junction")
    current_lat = Column(Float, default=12.978)
    current_lng = Column(Float, default=77.601)
    dest_lat = Column(Float, default=12.934)
    dest_lng = Column(Float, default=77.632)
    route = Column(JSON, default=list)
    normal_eta = Column(String(50), default="17:42")
    optimized_eta = Column(String(50), default="12:58")
    time_saved = Column(String(50), default="04:44")
    priority_status = Column(String(50), default="IDLE")  # IDLE, EN_ROUTE, GREEN_CORRIDOR_ACTIVE, ARRIVED
    intersections = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)

class SignalPlan(Base):
    __tablename__ = "signal_plans"

    id = Column(Integer, primary_key=True, index=True)
    intersection_id = Column(String(50), index=True, nullable=False)
    north_south_duration = Column(Integer, default=45)
    east_west_duration = Column(Integer, default=25)
    cycle_time = Column(Integer, default=78)
    source = Column(String(50), default="AI_SIMULATION")
    status = Column(String(50), default="APPLIED_SIMULATION")
    created_at = Column(DateTime, default=datetime.utcnow)

class SimulationRun(Base):
    __tablename__ = "simulation_runs"

    id = Column(Integer, primary_key=True, index=True)
    simulation_id = Column(String(50), unique=True, index=True, nullable=False)
    baseline_waiting = Column(Float, default=82.0)
    optimized_waiting = Column(Float, default=51.0)
    baseline_travel_time = Column(Float, default=16.4)
    optimized_travel_time = Column(Float, default=12.7)
    baseline_queue = Column(Integer, default=47)
    optimized_queue = Column(Integer, default=29)
    waiting_reduction_pct = Column(Float, default=37.8)
    travel_reduction_pct = Column(Float, default=22.5)
    queue_reduction_pct = Column(Float, default=38.3)
    created_at = Column(DateTime, default=datetime.utcnow)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), default="TRAFFIC_OPERATOR")  # ADMIN, TRAFFIC_OPERATOR, ANALYST, VIEWER
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user = Column(String(50), default="SYSTEM")
    action = Column(String(100), nullable=False)
    entity_type = Column(String(50), nullable=False)
    entity_id = Column(String(100), default="")
    details = Column(Text, default="")
    timestamp = Column(DateTime, default=datetime.utcnow)

