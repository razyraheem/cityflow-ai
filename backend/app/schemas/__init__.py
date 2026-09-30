from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

# Auth schemas
class Token(BaseModel):
    access_token: str
    token_type: str
    user_id: int
    username: str
    role: str

class TokenData(BaseModel):
    username: Optional[str] = None
    role: Optional[str] = None

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    role: str
    is_active: bool

# Camera schemas
class CameraHealth(BaseModel):
    latencyMs: float = 14.0
    packetLoss: float = 0.0
    uptime: str = "99.98%"
    temp: float = 41.2

class DetectionSchema(BaseModel):
    id: str
    plateNumber: str
    vehicleType: str
    confidence: float
    speed: float
    timestamp: str
    lane: int
    color: str

class CameraResponse(BaseModel):
    cameraId: str
    name: str
    road: str
    latitude: float
    longitude: float
    status: str
    vehiclesDetected: int
    averageSpeed: float
    congestion: int
    lastUpdated: str
    zone: str
    resolution: str
    fps: int
    streamType: str
    opticalFlowRate: float
    videoUrl: Optional[str] = None
    health: Dict[str, Any] = Field(default_factory=dict)
    recentDetections: List[Dict[str, Any]] = Field(default_factory=list)

# Vehicle & Re-ID schemas
class ReIdBreakdown(BaseModel):
    plateSimilarity: float = 98.4
    appearanceSimilarity: float = 94.6
    timeConsistency: float = 97.2
    routeConsistency: float = 96.0

class VehicleResponse(BaseModel):
    vehicleId: str
    plateNumber: str
    vehicleType: str
    color: str
    confidence: float
    currentCamera: str
    currentLocationName: str
    speed: float
    direction: str
    firstSeen: str
    lastSeen: str
    makeModel: str
    reIdScore: float
    reIdBreakdown: Dict[str, Any] = Field(default_factory=dict)
    trajectoryId: Optional[str] = None

# Trajectory schemas
class TrajectoryPoint(BaseModel):
    cameraId: str
    cameraName: str
    timestamp: str
    latitude: float
    longitude: float
    speed: float
    confidence: float

class TrajectoryResponse(BaseModel):
    trajectoryId: str
    vehicleId: str
    plateNumber: str
    vehicleType: str
    color: str
    origin: str
    destination: str
    startTime: str
    endTime: str
    totalTravelTime: str
    averageSpeed: float
    camerasVisited: List[str]
    path: List[TrajectoryPoint]

# Intersection & Signal schemas
class SignalPlan(BaseModel):
    nsDuration: int
    ewDuration: int
    cycleTime: int
    currentPhase: str = "NS_GREEN"
    timeRemaining: int = 24

class RecommendedSignalPlan(BaseModel):
    nsDuration: int
    ewDuration: int
    cycleTime: int
    predictedWaitReduction: float
    reason: str

class IntersectionResponse(BaseModel):
    intersectionId: str
    name: str
    coordinates: List[float]
    northSouthTraffic: int
    eastWestTraffic: int
    currentSignalPlan: Dict[str, Any]
    recommendedSignalPlan: Dict[str, Any]
    congestion: int
    predictedCongestion: int
    queueLength: Dict[str, Any]
    status: str

class SignalPlanApplyRequest(BaseModel):
    nsDuration: Optional[int] = None
    ewDuration: Optional[int] = None

# Emergency schemas
class EmergencyIntersection(BaseModel):
    id: str
    name: str
    distanceMeters: int
    status: str
    etaSeconds: int

class EmergencyVehicleResponse(BaseModel):
    ambulanceId: str
    vehiclePlate: str
    currentLocation: str
    currentCoords: List[float]
    destination: str
    destinationCoords: List[float]
    route: List[str]
    normalETA: str
    optimizedETA: str
    timeSaved: str
    priorityStatus: str
    intersections: List[Dict[str, Any]]

# Incident schemas
class IncidentResponse(BaseModel):
    id: str
    type: str
    severity: str
    cameraId: str
    cameraName: str
    road: str
    coordinates: List[float]
    timestamp: str
    speedChange: Optional[str] = None
    queueGrowth: Optional[str] = None
    confidence: float
    status: str
    details: str

class IncidentStatusUpdate(BaseModel):
    status: str  # Active, Investigating, Resolved

# Prediction schemas
class PredictionFactors(BaseModel):
    vehicleInflow: float
    queueGrowth: float
    upstreamTraffic: float
    averageSpeedDelta: float
    historicalSimilarity: float

class SimulationImpact(BaseModel):
    baselinePeakCongestion: float
    optimizedPeakCongestion: float
    waitingReductionSec: float
    delayPreventionMin: float

class PredictionResponse(BaseModel):
    intersectionId: str
    intersectionName: str
    currentCongestion: int
    predicted5Min: int
    predicted10Min: int
    predicted15Min: int
    status: str
    factors: Dict[str, Any]
    recommendation: str
    simulationImpact: Dict[str, Any]

# Analytics & Digital Twin schemas
class TrafficTimeSeries(BaseModel):
    time: str
    vehicleFlow: int
    density: float
    averageSpeed: float
    congestion: int
    queueLength: int

class DigitalTwinMetrics(BaseModel):
    baselineWaitingSec: float
    aiWaitingSec: float
    baselineTravelMin: float
    aiTravelMin: float
    baselineQueue: int
    aiQueue: int
    waitingReductionPct: float
    travelReductionPct: float
    queueReductionPct: float

