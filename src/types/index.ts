export type CameraStatus = 'ONLINE' | 'OFFLINE' | 'DEGRADED';
export type VehicleType = 'Car' | 'Bike' | 'Bus' | 'Truck' | 'Ambulance';
export type IncidentSeverity = 'CRITICAL' | 'WARNING' | 'INFO';
export type IncidentStatus = 'Active' | 'Investigating' | 'Resolved';

export interface ANPRDetection {
  id: string;
  plateNumber: string;
  vehicleType: VehicleType;
  confidence: number;
  speed: number;
  timestamp: string;
  lane: number;
  color: string;
}

export interface CameraHealth {
  latencyMs: number;
  packetLoss: number;
  uptime: string;
  temp: number;
}

export interface Camera {
  cameraId: string;
  name: string;
  road: string;
  latitude: number;
  longitude: number;
  status: CameraStatus;
  vehiclesDetected: number;
  averageSpeed: number;
  congestion: number;
  lastUpdated: string;
  zone: string;
  resolution: string;
  fps: number;
  streamType: string;
  opticalFlowRate: number;
  health: CameraHealth;
  recentDetections: ANPRDetection[];
}

export interface ReIdBreakdown {
  plateSimilarity: number;
  appearanceSimilarity: number;
  timeConsistency: number;
  routeConsistency: number;
}

export interface Vehicle {
  vehicleId: string;
  plateNumber: string;
  vehicleType: VehicleType;
  color: string;
  confidence: number;
  currentCamera: string;
  currentLocationName: string;
  speed: number;
  direction: string;
  firstSeen: string;
  lastSeen: string;
  makeModel: string;
  reIdScore: number;
  reIdBreakdown: ReIdBreakdown;
  trajectoryId: string;
}

export interface TrajectoryPoint {
  cameraId: string;
  cameraName: string;
  timestamp: string;
  latitude: number;
  longitude: number;
  speed: number;
  confidence: number;
}

export interface VehicleTrajectory {
  trajectoryId: string;
  vehicleId: string;
  plateNumber: string;
  vehicleType: VehicleType;
  color: string;
  origin: string;
  destination: string;
  startTime: string;
  endTime: string;
  totalTravelTime: string;
  averageSpeed: number;
  camerasVisited: string[];
  path: TrajectoryPoint[];
}

export interface SignalPlan {
  nsDuration: number;
  ewDuration: number;
  cycleTime: number;
  currentPhase: 'NS_GREEN' | 'NS_YELLOW' | 'EW_GREEN' | 'EW_YELLOW';
  timeRemaining: number;
}

export interface RecommendedSignalPlan {
  nsDuration: number;
  ewDuration: number;
  cycleTime: number;
  predictedWaitReduction: number;
  reason: string;
}

export interface Intersection {
  intersectionId: string;
  name: string;
  coordinates: [number, number];
  northSouthTraffic: number;
  eastWestTraffic: number;
  currentSignalPlan: SignalPlan;
  recommendedSignalPlan: RecommendedSignalPlan;
  congestion: number;
  predictedCongestion: number;
  queueLength: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  status: 'NORMAL' | 'OPTIMIZING' | 'PRIORITY_CORRIDOR' | 'HEAVY_CONGESTION';
}

export interface EmergencyIntersection {
  id: string;
  name: string;
  distanceMeters: number;
  status: 'Normal' | 'Switching' | 'Priority' | 'Cleared';
  etaSeconds: number;
}

export interface EmergencyVehicle {
  ambulanceId: string;
  vehiclePlate: string;
  currentLocation: string;
  currentCoords: [number, number];
  destination: string;
  destinationCoords: [number, number];
  route: string[];
  normalETA: string;
  optimizedETA: string;
  timeSaved: string;
  priorityStatus: 'IDLE' | 'EN_ROUTE' | 'GREEN_CORRIDOR_ACTIVE' | 'ARRIVED';
  intersections: EmergencyIntersection[];
}

export interface Incident {
  id: string;
  type: string;
  severity: IncidentSeverity;
  cameraId: string;
  cameraName: string;
  road: string;
  coordinates: [number, number];
  timestamp: string;
  speedChange?: string;
  queueGrowth?: string;
  confidence: number;
  status: IncidentStatus;
  details: string;
}

export interface PredictionFactors {
  vehicleInflow: number;
  queueGrowth: number;
  upstreamTraffic: number;
  averageSpeedDelta: number;
  historicalSimilarity: number;
}

export interface SimulationImpact {
  baselinePeakCongestion: number;
  optimizedPeakCongestion: number;
  waitingReductionSec: number;
  delayPreventionMin: number;
}

export interface PredictionData {
  intersectionId: string;
  intersectionName: string;
  currentCongestion: number;
  predicted5Min: number;
  predicted10Min: number;
  predicted15Min: number;
  status: string;
  factors: PredictionFactors;
  recommendation: string;
  simulationImpact: SimulationImpact;
}

export interface TrafficTimeSeries {
  time: string;
  vehicleFlow: number;
  density: number;
  averageSpeed: number;
  congestion: number;
  queueLength: number;
}

export interface AlertNotification {
  id: string;
  title: string;
  description: string;
  type: 'emergency' | 'warning' | 'info' | 'success';
  timestamp: string;
  location: string;
  read: boolean;
}

export interface DigitalTwinMetrics {
  baselineWaitingSec: number;
  aiWaitingSec: number;
  baselineTravelMin: number;
  aiTravelMin: number;
  baselineQueue: number;
  aiQueue: number;
  waitingReductionPct: number;
  travelReductionPct: number;
  queueReductionPct: number;
}

