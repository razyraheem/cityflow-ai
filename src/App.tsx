import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { ToastProvider } from './context/ToastContext';
import { SimulationProvider } from './context/SimulationContext';
import { Layout } from './components/layout/Layout';

import { cityFlowWebSocket } from './services/WebSocket';

// Page Views
import { DashboardPage } from './pages/DashboardPage';
import { CamerasPage } from './pages/CamerasPage';
import { VehiclesPage } from './pages/VehiclesPage';
import { TrajectoriesPage } from './pages/TrajectoriesPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { PredictionPage } from './pages/PredictionPage';
import { SignalsPage } from './pages/SignalsPage';
import { EmergencyPage } from './pages/EmergencyPage';
import { IncidentsPage } from './pages/IncidentsPage';
import { SimulationPage } from './pages/SimulationPage';
import { SettingsPage } from './pages/SettingsPage';

export function App() {

  // =====================================================
  // CITYFLOW AI - LIVE WEBSOCKET CONNECTION
  // =====================================================

  useEffect(() => {
    cityFlowWebSocket.connect();

    const unsubscribe = cityFlowWebSocket.subscribe((event) => {
      console.log(
        "📡 APP RECEIVED:",
        event.event,
        event.data
      );
    });

    return () => {
      unsubscribe();
      cityFlowWebSocket.disconnect();
    };
  }, []);

  // =====================================================
  // APPLICATION UI
  // =====================================================

  return (
    <ToastProvider>
      <SimulationProvider>
        <BrowserRouter>
          <Routes>

            <Route element={<Layout />}>

              <Route
                index
                element={
                  <Navigate
                    to="/dashboard"
                    replace
                  />
                }
              />

              <Route
                path="/dashboard"
                element={<DashboardPage />}
              />

              <Route
                path="/cameras"
                element={<CamerasPage />}
              />

              <Route
                path="/vehicles"
                element={<VehiclesPage />}
              />

              <Route
                path="/trajectories"
                element={<TrajectoriesPage />}
              />

              <Route
                path="/analytics"
                element={<AnalyticsPage />}
              />

              <Route
                path="/prediction"
                element={<PredictionPage />}
              />

              <Route
                path="/signals"
                element={<SignalsPage />}
              />

              <Route
                path="/emergency"
                element={<EmergencyPage />}
              />

              <Route
                path="/incidents"
                element={<IncidentsPage />}
              />

              <Route
                path="/simulation"
                element={<SimulationPage />}
              />

              <Route
                path="/settings"
                element={<SettingsPage />}
              />

              <Route
                path="*"
                element={
                  <Navigate
                    to="/dashboard"
                    replace
                  />
                }
              />

            </Route>

          </Routes>
        </BrowserRouter>
      </SimulationProvider>
    </ToastProvider>
  );
}

export default App;