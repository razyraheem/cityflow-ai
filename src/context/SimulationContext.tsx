import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef
} from 'react';

import {
  Camera,
  Vehicle,
  Intersection,
  EmergencyVehicle,
  Incident,
  AlertNotification,
  PredictionData
} from '../types';

import {
  INITIAL_CAMERAS,
  INITIAL_VEHICLES,
  INITIAL_INTERSECTIONS,
  INITIAL_EMERGENCY_VEHICLES,
  INITIAL_INCIDENTS,
  INITIAL_ALERTS,
  PREDICTION_J12
} from '../data/mockData';

import { useToast } from './ToastContext';
import { cityFlowWebSocket } from '../services/WebSocket';

interface SimulationContextType {
  cameras: Camera[];
  vehicles: Vehicle[];
  intersections: Intersection[];
  emergencyVehicles: EmergencyVehicle[];
  incidents: Incident[];
  alerts: AlertNotification[];
  predictionJ12: PredictionData;
  isSimulating: boolean;
  demoMode: boolean;
  simulationSpeed: number;
  totalTrackedVehicles: number;
  cityAvgSpeed: number;
  cityCongestionIndex: number;
  activeAlertsCount: number;

  toggleSimulation: () => void;
  setSimulationSpeed: (speed: number) => void;
  toggleDemoMode: () => void;
  applyAiSignalPlan: (intersectionId: string) => Promise<boolean>;
  activateEmergencyCorridor: (ambulanceId: string) => Promise<void>;
  investigateIncident: (id: string) => void;
  resolveIncident: (id: string) => void;
  markAlertRead: (id: string) => void;
  clearAllAlerts: () => void;
  triggerMockAlert: (
    title: string,
    description: string,
    type: 'emergency' | 'warning' | 'info' | 'success'
  ) => void;
}

const SimulationContext = createContext<
  SimulationContextType | undefined
>(undefined);

export const useSimulation = () => {
  const context = useContext(SimulationContext);

  if (!context) {
    throw new Error(
      'useSimulation must be used within a SimulationProvider'
    );
  }

  return context;
};

const EMERGENCY_API_BASE =
  `${import.meta.env.VITE_API_BASE_URL}/api/emergency`;

export const SimulationProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { addToast } = useToast();

  const [cameras, setCameras] =
    useState<Camera[]>(INITIAL_CAMERAS);

  const [vehicles, setVehicles] =
    useState<Vehicle[]>(INITIAL_VEHICLES);

  const [intersections, setIntersections] =
    useState<Intersection[]>(INITIAL_INTERSECTIONS);

  const [emergencyVehicles, setEmergencyVehicles] =
    useState<EmergencyVehicle[]>(
      INITIAL_EMERGENCY_VEHICLES
    );

  const [incidents, setIncidents] =
    useState<Incident[]>(INITIAL_INCIDENTS);

  const [alerts, setAlerts] =
    useState<AlertNotification[]>(INITIAL_ALERTS);

  const [predictionJ12, setPredictionJ12] =
    useState<PredictionData>(PREDICTION_J12);

  const [isSimulating, setIsSimulating] =
    useState<boolean>(true);

  const [demoMode, setDemoMode] =
    useState<boolean>(true);

  const [simulationSpeed, setSimulationSpeed] =
    useState<number>(1);

  const [totalTrackedVehicles, setTotalTrackedVehicles] =
    useState<number>(12482);

  const [cityAvgSpeed, setCityAvgSpeed] =
    useState<number>(34.2);

  const [cityCongestionIndex, setCityCongestionIndex] =
    useState<number>(67);

  /*
   * Keeps emergency-priority intersections outside the normal
   * simulation state so the 3.5 second simulation loop cannot
   * accidentally overwrite PRIORITY_CORRIDOR.
   */
  const emergencyPriorityMap =
    useRef<Map<string, Set<string>>>(new Map());

  const activeAlertsCount =
    alerts.filter((a) => !a.read).length;

  /*
   * Convert backend emergency data into the structure expected
   * by the existing frontend.
   *
   * Backend:
   * route = [
   *   {
   *     intersectionId,
   *     name,
   *     sequence
   *   }
   * ]
   *
   * Frontend:
   * route = string[]
   * intersections = frontend node objects
   */
  const normalizeEmergencyVehicle = (
    data: any,
    existing?: EmergencyVehicle
  ): EmergencyVehicle => {
    const existingWithExtras =
      existing as
        | (EmergencyVehicle & {
            origin?: string;
            destination?: string;
            currentLocation?: string;
            currentLat?: number;
            currentLng?: number;
            destinationLat?: number;
            destinationLng?: number;
            normalETA?: string;
            optimizedETA?: string;
            timeSaved?: string;
            priorityStatus?: string;
          })
        | undefined;

    const existingWithCoordinates =
      existingWithExtras;

    const backendRoute = Array.isArray(data?.route)
      ? data.route
      : [];

    const routeNames =
      backendRoute.length > 0
        ? backendRoute.map((node: any) =>
            typeof node === 'string'
              ? node
              : node?.name || node?.intersectionId || ''
          )
        : existing?.route || [];

    const backendIntersections =
      Array.isArray(data?.prioritizedIntersections)
        ? data.prioritizedIntersections
        : [];

    const frontendIntersections =
      backendRoute.length > 0
        ? backendRoute.map(
            (node: any, index: number) => ({
              id:
                node?.intersectionId ||
                backendIntersections[index] ||
                `INT-${index + 1}`,

              name:
                node?.name ||
                node?.intersectionId ||
                `Intersection ${index + 1}`,

              status:
                data?.greenCorridorActive
                  ? 'Priority'
                  : 'Standby',

              distanceMeters:
                existing?.intersections?.[index]
                  ?.distanceMeters ?? 0,

              etaSeconds:
                existing?.intersections?.[index]
                  ?.etaSeconds ?? index * 60
            })
          )
        : existing?.intersections || [];

    return {
      ...(existing || {}),
      ambulanceId:
        data?.ambulanceId ||
        existing?.ambulanceId ||
        '',

      vehiclePlate:
        data?.vehiclePlate ??
        existing?.vehiclePlate ??
        '',

      origin:
        data?.origin ??
        existingWithExtras?.origin ??
        data?.currentLocation ??
        '',

      destination:
        data?.destination ??
        existingWithExtras?.destination ??
        '',

      currentLocation:
        data?.currentLocation ??
        existingWithExtras?.currentLocation ??
        '',

      currentLat:
        data?.currentLat ??
        existingWithCoordinates?.currentLat ??
        0,

      currentLng:
        data?.currentLng ??
        existingWithCoordinates?.currentLng ??
        0,

      destinationLat:
        data?.destinationLat ??
        existingWithCoordinates?.destinationLat ??
        0,

      destinationLng:
        data?.destinationLng ??
        existingWithCoordinates?.destinationLng ??
        0,

      normalETA:
        data?.normalEta ??
        existingWithExtras?.normalETA ??
        '0',

      optimizedETA:
        data?.optimizedEta ??
        existingWithExtras?.optimizedETA ??
        '0',

      timeSaved:
        data?.timeSaved ??
        existingWithExtras?.timeSaved ??
        '0',

      priorityStatus:
        data?.priorityStatus ??
        existingWithExtras?.priorityStatus ??
        'DETECTED',

      route: routeNames,

      intersections: frontendIntersections
    } as EmergencyVehicle & {
      currentLat?: number;
      currentLng?: number;
      destinationLat?: number;
      destinationLng?: number;
    } as EmergencyVehicle;
  };

  /*
   * Apply backend emergency state to frontend.
   */
  const applyEmergencyBackendData = (
    data: any,
    showToast = false
  ) => {
    if (!data?.ambulanceId) {
      return;
    }

    const ambulanceId = data.ambulanceId;

    const routeIds = new Set<string>(
      Array.isArray(data?.route)
        ? data.route
            .map((node: any) =>
              typeof node === 'string'
                ? node
                : node?.intersectionId
            )
            .filter(Boolean)
        : []
    );

    /*
     * Store priority state separately from the normal
     * simulation engine.
     */
    if (data.greenCorridorActive) {
      emergencyPriorityMap.current.set(
        ambulanceId,
        routeIds
      );
    } else {
      emergencyPriorityMap.current.delete(
        ambulanceId
      );
    }

    setEmergencyVehicles((previous) => {
      const existing = previous.find(
        (vehicle) =>
          vehicle.ambulanceId === ambulanceId
      );

      const normalized =
        normalizeEmergencyVehicle(
          data,
          existing
        );

      if (!existing) {
        return [...previous, normalized];
      }

      return previous.map((vehicle) =>
        vehicle.ambulanceId === ambulanceId
          ? normalized
          : vehicle
      );
    });

    /*
     * Immediately apply the corridor to the actual
     * intersection state.
     */
    if (data.greenCorridorActive) {
      setIntersections((previous) =>
        previous.map((intersection) => {
          if (
            routeIds.has(
              intersection.intersectionId
            )
          ) {
            return {
              ...intersection,
              status: 'PRIORITY_CORRIDOR'
            };
          }

          return intersection;
        })
      );

      if (showToast) {
        addToast(
          '✓ GREEN CORRIDOR ACTIVE',
          `Traffic signal priority activated for Ambulance ${ambulanceId}.`,
          'success',
          5000
        );
      }
    }
  };

  /*
   * ============================================================
   * BACKEND EMERGENCY SYNCHRONIZATION
   * ============================================================
   */

  useEffect(() => {
    let mounted = true;

    const syncEmergencyVehicles = async () => {
      try {
        const response = await fetch(
          EMERGENCY_API_BASE
        );

        if (!response.ok) {
          throw new Error(
            `Emergency API returned ${response.status}`
          );
        }

        const result = await response.json();

        if (!mounted) {
          return;
        }

        const backendVehicles =
          Array.isArray(result?.emergencyVehicles)
            ? result.emergencyVehicles
            : [];

        backendVehicles.forEach(
          (vehicle: any) => {
            applyEmergencyBackendData(vehicle);
          }
        );
      } catch (error) {
        /*
         * Do not spam the UI with errors while the backend
         * is temporarily unavailable.
         *
         * The existing mock data remains usable.
         */
        console.warn(
          '[CITYFLOW] Emergency sync unavailable:',
          error
        );
      }
    };

    /*
     * Initial synchronization.
     */
    syncEmergencyVehicles();

    /*
     * Safety-net synchronization.
     *
     * WebSocket provides live updates.
     * This polling keeps the frontend synchronized if the
     * WebSocket reconnects or misses an event.
     */
    const syncTimer = window.setInterval(
      syncEmergencyVehicles,
      5000
    );

    return () => {
      mounted = false;
      window.clearInterval(syncTimer);
    };
  }, []);

  /*
   * ============================================================
   * EMERGENCY WEBSOCKET
   * ============================================================
   */

  useEffect(() => {
    const handleEmergencyUpdate = (
      event: any
    ) => {
      if (
        event?.event !==
        'emergency.updated'
      ) {
        return;
      }

      applyEmergencyBackendData(
        event.data,
        false
      );
    };

    cityFlowWebSocket.subscribe(
      handleEmergencyUpdate
    );

    return () => {
      const webSocketWithUnsubscribe =
        cityFlowWebSocket as typeof cityFlowWebSocket & {
          unsubscribe?: (
            handler: typeof handleEmergencyUpdate
          ) => void;
        };

      if (
        typeof webSocketWithUnsubscribe.unsubscribe ===
        'function'
      ) {
        webSocketWithUnsubscribe.unsubscribe(
          handleEmergencyUpdate
        );
      }
    };
  }, []);

  /*
   * ============================================================
   * REAL-TIME CITY SIMULATION
   * ============================================================
   */

  useEffect(() => {
    if (!isSimulating) {
      return;
    }

    const intervalMs = Math.max(
      1000,
      Math.floor(
        3500 / simulationSpeed
      )
    );

    const timer = window.setInterval(() => {
      /*
       * --------------------------------------------------------
       * 1. Aggregate city metrics
       * --------------------------------------------------------
       */

      setTotalTrackedVehicles(
        (previous) =>
          Math.max(
            0,
            previous +
              Math.floor(
                Math.random() * 7
              ) -
              2
          )
      );

      setCityAvgSpeed((previous) => {
        const delta =
          (Math.random() - 0.5) * 0.8;

        return Number(
          Math.min(
            48,
            Math.max(
              24,
              previous + delta
            )
          ).toFixed(1)
        );
      });

      setCityCongestionIndex(
        (previous) => {
          const delta =
            (Math.random() - 0.5) *
            1.5;

          return Math.round(
            Math.min(
              95,
              Math.max(
                45,
                previous + delta
              )
            )
          );
        }
      );

      /*
       * --------------------------------------------------------
       * 2. Camera updates
       * --------------------------------------------------------
       */

      setCameras((previousCameras) =>
        previousCameras.map(
          (camera) => {
            const deltaVehicles =
              Math.floor(
                Math.random() * 5
              ) - 2;

            const deltaSpeed =
              Math.floor(
                Math.random() * 3
              ) - 1;

            const newSpeed = Math.max(
              8,
              Math.min(
                65,
                camera.averageSpeed +
                  deltaSpeed
              )
            );

            const newVehicles =
              Math.max(
                10,
                camera.vehiclesDetected +
                  deltaVehicles
              );

            const newCongestion =
              Math.max(
                15,
                Math.min(
                  98,
                  camera.congestion +
                    (Math.floor(
                      Math.random() * 3
                    ) -
                      1)
                )
              );

            return {
              ...camera,

              vehiclesDetected:
                newVehicles,

              averageSpeed:
                newSpeed,

              congestion:
                newCongestion,

              lastUpdated: '1s ago',

              health: {
                ...camera.health,

                latencyMs:
                  Math.max(
                    8,
                    Math.min(
                      28,
                      camera.health
                        .latencyMs +
                        (Math.floor(
                          Math.random() *
                            3
                        ) -
                          1)
                    )
                  )
              }
            };
          }
        )
      );

      /*
       * --------------------------------------------------------
       * 3. Intersection signal simulation
       * --------------------------------------------------------
       *
       * IMPORTANT:
       * Emergency priority intersections are NOT allowed
       * to be overwritten by the normal signal simulation.
       */

      setIntersections(
        (previousIntersections) =>
          previousIntersections.map(
            (intersection) => {
              /*
               * Check whether this intersection belongs
               * to ANY active emergency corridor.
               */
              let isEmergencyPriority =
                false;

              for (
                const ids of
                  emergencyPriorityMap.current.values()
              ) {
                if (
                  ids.has(
                    intersection.intersectionId
                  )
                ) {
                  isEmergencyPriority =
                    true;
                  break;
                }
              }

              /*
               * Emergency corridor owns this intersection.
               * Do not cycle its status.
               */
              if (isEmergencyPriority) {
                return {
                  ...intersection,
                  status:
                    'PRIORITY_CORRIDOR'
                };
              }

              /*
               * Normal signal simulation.
               */
              const plan =
                intersection.currentSignalPlan;

              let remaining =
                plan.timeRemaining - 1;

              let phase =
                plan.currentPhase;

              if (remaining <= 0) {
                if (
                  phase ===
                  'NS_GREEN'
                ) {
                  phase =
                    'NS_YELLOW';

                  remaining = 4;
                } else if (
                  phase ===
                  'NS_YELLOW'
                ) {
                  phase =
                    'EW_GREEN';

                  remaining =
                    plan.ewDuration;
                } else if (
                  phase ===
                  'EW_GREEN'
                ) {
                  phase =
                    'EW_YELLOW';

                  remaining = 4;
                } else {
                  phase =
                    'NS_GREEN';

                  remaining =
                    plan.nsDuration;
                }
              }

              return {
                ...intersection,

                currentSignalPlan: {
                  ...plan,

                  currentPhase:
                    phase,

                  timeRemaining:
                    remaining
                }
              };
            }
          )
      );
    }, intervalMs);

    return () =>
      window.clearInterval(timer);
  }, [
    isSimulating,
    simulationSpeed
  ]);

  /*
   * ============================================================
   * GENERAL SIMULATION CONTROLS
   * ============================================================
   */

  const toggleSimulation = () => {
    setIsSimulating(
      (previous) => !previous
    );

    addToast(
      isSimulating
        ? 'Simulation Paused'
        : 'Simulation Resumed',

      isSimulating
        ? 'Live pipeline updates paused.'
        : 'Live city perception engine active.',

      'info',
      2500
    );
  };

  const toggleDemoMode = () => {
    setDemoMode(
      (previous) => !previous
    );

    addToast(
      demoMode
        ? 'Simulation Controls Locked'
        : 'Demo / Simulation Mode Active',

      demoMode
        ? 'Read-only surveillance view.'
        : 'Interactive AI signal controls & green corridor triggers enabled.',

      'info',
      3000
    );
  };

  /*
   * ============================================================
   * AI SIGNAL PLAN
   * ============================================================
   */

  const applyAiSignalPlan = async (
    intersectionId: string
  ): Promise<boolean> => {
    const target =
      intersections.find(
        (intersection) =>
          intersection.intersectionId ===
          intersectionId
      );

    if (!target) {
      return false;
    }

    const recommendation =
      target.recommendedSignalPlan;

    setIntersections(
      (previousIntersections) =>
        previousIntersections.map(
          (intersection) => {
            if (
              intersection.intersectionId !==
              intersectionId
            ) {
              return intersection;
            }

            /*
             * Do not allow manual AI signal optimization
             * to override an active emergency corridor.
             */
            if (
              emergencyPriorityMap.current
                .values()
            ) {
              for (
                const ids of
                  emergencyPriorityMap.current.values()
              ) {
                if (
                  ids.has(
                    intersectionId
                  )
                ) {
                  return {
                    ...intersection,
                    status:
                      'PRIORITY_CORRIDOR'
                  };
                }
              }
            }

            return {
              ...intersection,

              status:
                'OPTIMIZING',

              congestion:
                Math.max(
                  38,
                  intersection.congestion -
                    18
                ),

              predictedCongestion:
                Math.max(
                  45,
                  intersection.predictedCongestion -
                    24
                ),

              currentSignalPlan: {
                ...intersection.currentSignalPlan,

                nsDuration:
                  recommendation.nsDuration,

                ewDuration:
                  recommendation.ewDuration,

                cycleTime:
                  recommendation.cycleTime,

                timeRemaining:
                  recommendation.nsDuration,

                currentPhase:
                  'NS_GREEN'
              }
            };
          }
        )
    );

    if (intersectionId === 'J12') {
      setPredictionJ12(
        (previous) => ({
          ...previous,

          currentCongestion:
            62,

          predicted5Min:
            64,

          predicted10Min:
            68,

          status:
            'AI OPTIMIZED (FLOW STABILIZED)'
        })
      );
    }

    addToast(
      'AI Adaptive Signal Plan Applied',

      `Intersection ${intersectionId}: NS Phase extended to ${recommendation.nsDuration}s, EW to ${recommendation.ewDuration}s. Waiting time reduced by ${recommendation.predictedWaitReduction}%. [SIMULATION MODE]`,

      'success',
      5500
    );

    return true;
  };

  /*
   * ============================================================
   * REAL EMERGENCY GREEN CORRIDOR
   * ============================================================
   *
   * NO setTimeout().
   * NO fake frontend activation.
   * Backend decides whether the corridor is active.
   */

  const activateEmergencyCorridor = async (
    ambulanceId: string
  ): Promise<void> => {
    const ambulance =
      emergencyVehicles.find(
        (vehicle) =>
          vehicle.ambulanceId ===
          ambulanceId
      );

    if (!ambulance) {
      addToast(
        'Emergency Vehicle Not Found',
        `Ambulance ${ambulanceId} is not available in the current CITYFLOW state.`,

        'warning',
        4000
      );

      return;
    }

    addToast(
      '🚨 Activating Green Corridor',

      `Requesting backend signal priority for Ambulance ${ambulanceId} (${ambulance.vehiclePlate}).`,

      'emergency',
      5000
    );

    try {
      const response =
        await fetch(
          `${EMERGENCY_API_BASE}/${encodeURIComponent(
            ambulanceId
          )}/activate`,
          {
            method: 'POST',
            headers: {
              Accept:
                'application/json'
            }
          }
        );

      if (!response.ok) {
        let errorMessage =
          `Backend returned HTTP ${response.status}`;

        try {
          const errorBody =
            await response.json();

          if (
            errorBody?.detail
          ) {
            errorMessage =
              errorBody.detail;
          }
        } catch {
          /*
           * Keep the original HTTP error
           * if the response is not JSON.
           */
        }

        throw new Error(
          errorMessage
        );
      }

      const result =
        await response.json();

      /*
       * Backend response:
       *
       * {
       *   status:
       *     "GREEN_CORRIDOR_ACTIVE",
       *   message: "...",
       *   data: {...}
       * }
       */

      const backendData =
        result?.data;

      if (!backendData) {
        throw new Error(
          'Backend activation succeeded but returned no emergency data.'
        );
      }

      /*
       * Update immediately.
       * WebSocket will continue sending the same state
       * every few seconds.
       */
      applyEmergencyBackendData(
        backendData,
        true
      );

      /*
       * Explicitly update priority intersections
       * immediately instead of waiting for WebSocket.
       */
      const priorityIds =
        new Set<string>(
          Array.isArray(
            backendData?.route
          )
            ? backendData.route
                .map((node: any) =>
                  typeof node ===
                  'string'
                    ? node
                    : node?.intersectionId
                )
                .filter(Boolean)
            : []
        );

      emergencyPriorityMap.current.set(
        ambulanceId,
        priorityIds
      );

      setIntersections(
        (previous) =>
          previous.map(
            (intersection) =>
              priorityIds.has(
                intersection.intersectionId
              )
                ? {
                    ...intersection,
                    status:
                      'PRIORITY_CORRIDOR'
                  }
                : intersection
          )
      );

      addToast(
        '✓ GREEN CORRIDOR ACTIVE',

        `Ambulance ${ambulanceId} now has backend-controlled signal priority. ETA reduced from ${backendData.normalEta} min to ${backendData.optimizedEta} min.`,

        'success',
        6000
      );
    } catch (error) {
      console.error(
        '[CITYFLOW] Emergency activation failed:',
        error
      );

      addToast(
        'Emergency Activation Failed',

        error instanceof Error
          ? error.message
          : 'Could not activate the emergency corridor. Check that the FastAPI backend is running.',

        'warning',
        6000
      );
    }
  };

  /*
   * ============================================================
   * INCIDENT MANAGEMENT
   * ============================================================
   */

  const investigateIncident = (
    id: string
  ) => {
    setIncidents(
      (previous) =>
        previous.map(
          (incident) =>
            incident.id === id
              ? {
                  ...incident,
                  status:
                    'Investigating'
                }
              : incident
        )
    );

    addToast(
      'Incident Status: Investigating',

      `Dispatched nearest patrol unit and camera zoom tracker to incident ${id}.`,

      'warning',
      3500
    );
  };

  const resolveIncident = (
    id: string
  ) => {
    setIncidents(
      (previous) =>
        previous.map(
          (incident) =>
            incident.id === id
              ? {
                  ...incident,
                  status:
                    'Resolved'
                }
              : incident
        )
    );

    addToast(
      '✓ Incident Resolved',

      `Incident ${id} marked as resolved. Normal lane clearance restored.`,

      'success',
      4000
    );
  };

  /*
   * ============================================================
   * ALERT MANAGEMENT
   * ============================================================
   */

  const markAlertRead = (
    id: string
  ) => {
    setAlerts(
      (previous) =>
        previous.map(
          (alert) =>
            alert.id === id
              ? {
                  ...alert,
                  read: true
                }
              : alert
        )
    );
  };

  const clearAllAlerts = () => {
    setAlerts(
      (previous) =>
        previous.map(
          (alert) => ({
            ...alert,
            read: true
          })
        )
    );

    addToast(
      'Alerts Cleared',
      'All notifications marked as read.',
      'info',
      2000
    );
  };

  const triggerMockAlert = (
    title: string,
    description: string,
    type:
      | 'emergency'
      | 'warning'
      | 'info'
      | 'success'
  ) => {
    const newAlert:
      AlertNotification = {
      id: `ALT-${Date.now()}`,

      title,

      description,

      type,

      timestamp:
        new Date().toLocaleTimeString(
          'en-US',
          {
            hour12: false
          }
        ),

      location:
        'Central Traffic Sector',

      read: false
    };

    setAlerts(
      (previous) => [
        newAlert,
        ...previous
      ]
    );

    addToast(
      title,
      description,
      type === 'emergency'
        ? 'emergency'
        : type === 'warning'
        ? 'warning'
        : 'info',
      5000
    );
  };

  /*
   * ============================================================
   * PROVIDER
   * ============================================================
   */

  return (
    <SimulationContext.Provider
      value={{
        cameras,

        vehicles,

        intersections,

        emergencyVehicles,

        incidents,

        alerts,

        predictionJ12,

        isSimulating,

        demoMode,

        simulationSpeed,

        totalTrackedVehicles,

        cityAvgSpeed,

        cityCongestionIndex,

        activeAlertsCount,

        toggleSimulation,

        setSimulationSpeed,

        toggleDemoMode,

        applyAiSignalPlan,

        activateEmergencyCorridor,

        investigateIncident,

        resolveIncident,

        markAlertRead,

        clearAllAlerts,

        triggerMockAlert
      }}
    >
      {children}
    </SimulationContext.Provider>
  );
};