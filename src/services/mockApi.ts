import {
  Camera,
  Vehicle,
  VehicleTrajectory,
  Intersection,
  EmergencyVehicle,
  Incident,
  PredictionData,
  TrafficTimeSeries,
  AlertNotification,
  DigitalTwinMetrics
} from '../types';

import {
  INITIAL_CAMERAS,
  INITIAL_VEHICLES,
  VEHICLE_TRAJECTORIES,
  INITIAL_INTERSECTIONS,
  INITIAL_EMERGENCY_VEHICLES,
  INITIAL_INCIDENTS,
  PREDICTION_J12,
  TIME_SERIES_TRAFFIC,
  INITIAL_ALERTS,
  DIGITAL_TWIN_BENCHMARK
} from '../data/mockData';

// Artificial delay to simulate realistic micro-service REST/WebSocket latency
const delay = <T>(data: T, ms = 180): Promise<T> => {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms));
};

export const mockApi = {
  // Cameras
  async getCameras(): Promise<Camera[]> {
    return delay([...INITIAL_CAMERAS]);
  },

  async getCameraById(cameraId: string): Promise<Camera | undefined> {
    const cam = INITIAL_CAMERAS.find((c) => c.cameraId === cameraId);
    return delay(cam ? { ...cam } : undefined);
  },

  // Vehicles
  async getVehicles(): Promise<Vehicle[]> {
    return delay([...INITIAL_VEHICLES]);
  },

  async searchVehicles(query: string): Promise<Vehicle[]> {
    const clean = query.trim().toUpperCase();
    if (!clean) return delay([...INITIAL_VEHICLES]);
    const results = INITIAL_VEHICLES.filter(
      (v) =>
        v.plateNumber.includes(clean) ||
        v.vehicleId.toUpperCase().includes(clean) ||
        v.vehicleType.toUpperCase().includes(clean) ||
        v.color.toUpperCase().includes(clean)
    );
    return delay(results);
  },

  async getVehicleTrajectory(plateNumber: string): Promise<VehicleTrajectory | null> {
    const cleanPlate = plateNumber.trim().toUpperCase();
    const trj = VEHICLE_TRAJECTORIES[cleanPlate] || null;
    return delay(trj ? JSON.parse(JSON.stringify(trj)) : null);
  },

  // Intersections & Signals
  async getIntersections(): Promise<Intersection[]> {
    return delay([...INITIAL_INTERSECTIONS]);
  },

  async applySignalPlan(intersectionId: string, nsDuration: number, ewDuration: number): Promise<{ success: boolean; message: string }> {
    return delay({
      success: true,
      message: `AI Signal Timing (NS: ${nsDuration}s, EW: ${ewDuration}s) successfully applied to ${intersectionId} in SIMULATION MODE.`
    }, 250);
  },

  // Predictions
  async getPredictions(intersectionId = 'J12'): Promise<PredictionData> {
    if (intersectionId === 'J12') {
      return delay({ ...PREDICTION_J12 });
    }
    return delay({
      ...PREDICTION_J12,
      intersectionId,
      intersectionName: `Intersection ${intersectionId} Node`
    });
  },

  // Emergency Vehicles
  async getEmergencyVehicles(): Promise<EmergencyVehicle[]> {
    return delay(JSON.parse(JSON.stringify(INITIAL_EMERGENCY_VEHICLES)));
  },

  async activateGreenCorridor(ambulanceId: string): Promise<{ success: boolean; timeSaved: string; intersectionsCount: number }> {
    return delay({
      success: true,
      timeSaved: '04:44',
      intersectionsCount: 4
    }, 300);
  },

  // Incidents
  async getIncidents(): Promise<Incident[]> {
    return delay([...INITIAL_INCIDENTS]);
  },

  async updateIncidentStatus(incidentId: string, status: 'Active' | 'Investigating' | 'Resolved'): Promise<Incident | null> {
    const inc = INITIAL_INCIDENTS.find((i) => i.id === incidentId);
    if (!inc) return delay(null);
    inc.status = status;
    return delay({ ...inc });
  },

  // Analytics & Digital Twin
  async getTrafficAnalytics(): Promise<TrafficTimeSeries[]> {
    return delay([...TIME_SERIES_TRAFFIC]);
  },

  async getSimulationMetrics(): Promise<DigitalTwinMetrics> {
    return delay({ ...DIGITAL_TWIN_BENCHMARK });
  },

  async getAlerts(): Promise<AlertNotification[]> {
    return delay([...INITIAL_ALERTS]);
  }
};

