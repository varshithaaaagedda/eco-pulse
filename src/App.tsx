import React, { useState, useEffect } from 'react';
import { BackgroundCanvas } from './components/BackgroundCanvas';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { LivingMap } from './components/LivingMap';
import { HealthScoreCard } from './components/HealthScoreCard';
import { AlertFeed } from './components/AlertFeed';
import { StationDeepDive } from './components/StationDeepDive';
import { FooterTicker } from './components/FooterTicker';

import { CitizenUploadModal } from './components/CitizenUploadModal';
import { DispatchModal } from './components/DispatchModal';
import { AnalyticsModal } from './components/AnalyticsModal';

import { INITIAL_STATIONS, INITIAL_ALERTS, INITIAL_CITIZEN_UPLOADS } from './data/mockData';
import type { StationData, AlertItem, CitizenUpload } from './types';
import { fetchStations, fetchAlerts, triggerSurgeSimulation, ingestTelemetry } from './services/api';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [stations, setStations] = useState<StationData[]>(INITIAL_STATIONS);
  const [selectedStationId, setSelectedStationId] = useState<string>('ST-03');
  const [alerts, setAlerts] = useState<AlertItem[]>(INITIAL_ALERTS);
  const [citizenUploads, setCitizenUploads] = useState<CitizenUpload[]>(INITIAL_CITIZEN_UPLOADS);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  // Modals state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState<boolean>(false);
  const [activeDispatchAlert, setActiveDispatchAlert] = useState<AlertItem | null>(null);
  const [isAnalyticsModalOpen, setIsAnalyticsModalOpen] = useState<boolean>(false);

  // Fetch live backend data on mount
  useEffect(() => {
    let isMounted = true;

    async function loadBackendData() {
      try {
        const [apiStations, apiAlerts] = await Promise.all([
          fetchStations().catch(() => null),
          fetchAlerts().catch(() => null),
        ]);

        if (!isMounted) return;

        if (apiStations && apiStations.length > 0) {
          setStations((prev) =>
            prev.map((localSt) => {
              const remote = apiStations.find((s) => s.station_id === localSt.id);
              if (!remote) return localSt;
              return {
                ...localSt,
                healthScore: Math.round(remote.health_score),
                status: remote.risk_status.toLowerCase() as any,
                ph: remote.latest_telemetry?.ph ?? localSt.ph,
                doLevel: remote.latest_telemetry?.dissolved_oxygen ?? localSt.doLevel,
                turbidity: remote.latest_telemetry?.turbidity ?? localSt.turbidity,
                temperature: remote.latest_telemetry?.water_temperature ?? localSt.temperature,
              };
            })
          );
        }

        if (apiAlerts && apiAlerts.length > 0) {
          const formattedAlerts: AlertItem[] = apiAlerts.map((a) => ({
            id: a.alert_id,
            stationId: a.station_id,
            stationName: `Station ${a.station_id.replace('ST-', '')} • Reach`,
            severity: a.severity === 'caution' ? 'warning' : (a.severity as any),
            timestamp: new Date(a.timestamp).toLocaleTimeString('en-US', { hour12: false }) + ' UTC',
            title: `ONE HEALTH ADVISORY: ${a.station_id}`,
            briefing: a.message,
            riskTriggers: a.risk_triggers || ['Parameter Anomaly'],
            actionRequired: a.action_required || 'Investigate Site Parameters',
            acknowledged: a.resolved,
          }));
          setAlerts(formattedAlerts);
        }
      } catch (e) {
        console.info('[EcoPulse] Using local state fallback', e);
      }
    }

    loadBackendData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Selected station object
  const selectedStation = stations.find((s) => s.id === selectedStationId) || stations[0];

  // Overall Basin Health Score average calculation
  const overallScore = Math.round(
    stations.reduce((acc, curr) => acc + curr.healthScore, 0) / stations.length
  );

  // Simulation mode toggle handler with FastAPI triggerSurgeSimulation integration
  const handleToggleSimulation = async () => {
    const next = !isSimulating;
    setIsSimulating(next);

    if (next) {
      setSelectedStationId('ST-03');
      try {
        const res = await triggerSurgeSimulation('ST-03');
        if (res && res.generated_alert) {
          const simAlert: AlertItem = {
            id: res.generated_alert.alert_id,
            stationId: res.generated_alert.station_id,
            stationName: 'Station 42 • Lower Estuary',
            severity: 'critical',
            timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }) + ' UTC',
            title: 'SIMULATED CRITICAL: Agricultural Runoff Surge',
            briefing: res.insight || res.generated_alert.message,
            riskTriggers: res.generated_alert.risk_triggers || ['Turbidity > 48 NTU', 'Hypoxia Danger'],
            actionRequired: res.generated_alert.action_required || 'Deploy Autonomous Hydro-Drone',
            acknowledged: false,
          };
          setAlerts((a) => [simAlert, ...a]);

          // Update ST-03 station metrics
          setStations((prev) =>
            prev.map((s) =>
              s.id === 'ST-03'
                ? {
                    ...s,
                    status: 'critical',
                    healthScore: Math.round(res.new_wqi_score),
                    turbidity: res.injected_metrics.turbidity,
                    doLevel: res.injected_metrics.dissolved_oxygen,
                    ph: res.injected_metrics.ph,
                  }
                : s
            )
          );
        }
      } catch (err) {
        console.warn('[EcoPulse] API Simulation trigger failed, using local simulation:', err);
        const simAlert: AlertItem = {
          id: `ALT-SIM-${Date.now().toString().slice(-4)}`,
          stationId: 'ST-03',
          stationName: 'Station 42 • Lower Estuary',
          severity: 'critical',
          timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }) + ' UTC',
          title: 'SIMULATED CRITICAL: Agricultural Runoff Surge',
          briefing: 'Station 42: High turbidity surge detected (48.7 NTU). Dissolved Oxygen rapidly plummeting to 3.4 mg/L. Agricultural fertilizer runoff risk trigger activated!',
          riskTriggers: ['Turbidity > 48 NTU', 'pH 5.8 acid shift', 'Hypoxia Danger'],
          actionRequired: 'Issue Downstream Advisory & Deploy Autonomous Hydro-Drone',
          acknowledged: false,
        };
        setAlerts((a) => [simAlert, ...a]);
      }
    }
  };

  // Export GIS Telemetry Handler
  const handleExportGISTelemetry = () => {
    const geojsonData = {
      type: 'FeatureCollection',
      metadata: {
        platform: 'EcoPulse OneAquaHealth Track 2',
        generatedAt: new Date().toISOString(),
        basinScore: overallScore,
      },
      features: stations.map((st) => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [-122.3321 + (st.coordinates.x - 50) * 0.005, 47.6062 + (st.coordinates.y - 50) * 0.005],
        },
        properties: {
          id: st.id,
          name: st.name,
          healthScore: st.healthScore,
          ph: st.ph,
          doLevel: st.doLevel,
          turbidity: st.turbidity,
          status: st.status,
        },
      })),
    };

    const blob = new Blob([JSON.stringify(geojsonData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ecopulse_gis_telemetry_${Date.now()}.geojson`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Acknowledge alert handler
  const handleAcknowledgeAlert = (id: string) => {
    setAlerts((prev) =>
      prev.map((item) => (item.id === id ? { ...item, acknowledged: true } : item))
    );
  };

  // Open Dispatch Modal handler
  const handleOpenDispatchModal = (alert?: AlertItem) => {
    setActiveDispatchAlert(alert || null);
    setIsDispatchModalOpen(true);
  };

  // Handle Confirm Dispatch
  const handleConfirmDispatch = () => {
    if (activeDispatchAlert) {
      setAlerts((prev) =>
        prev.map((item) =>
          item.id === activeDispatchAlert.id
            ? { ...item, acknowledged: true, dispatched: true }
            : item
        )
      );
    }
  };

  // Add new citizen upload with backend ingestion endpoint integration
  const handleAddCitizenUpload = async (newUpload: CitizenUpload) => {
    setCitizenUploads((prev) => [newUpload, ...prev]);

    // Send to backend ingestion API
    try {
      const targetStationId = newUpload.stationName.includes('ST-02')
        ? 'ST-02'
        : newUpload.stationName.includes('ST-03')
        ? 'ST-03'
        : 'ST-01';

      await ingestTelemetry({
        station_id: targetStationId,
        ph: newUpload.ph,
        dissolved_oxygen: 7.5,
        turbidity: parseFloat(newUpload.turbidity) || 10.0,
        water_temperature: 18.0,
      });
    } catch (err) {
      console.warn('[EcoPulse] Telemetry ingestion call failed:', err);
    }
  };

  return (
    <div className="command-center-layout">
      {/* Background Mesh */}
      <BackgroundCanvas />

      {/* TOP HEADER BAR: Sticky navbar */}
      <Header
        isSimulating={isSimulating}
        onToggleSimulation={handleToggleSimulation}
        onExportGIS={handleExportGISTelemetry}
      />

      {/* MAIN CONTENT AREA: SIDEBAR + 12-COLUMN RESPONSIVE GRID */}
      <div style={{ display: 'flex', flex: 1, padding: '12px 16px', gap: '14px', zIndex: 10 }}>
        {/* LEFT VERTICAL NAVIGATION SIDEBAR */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setActiveTab(tab);
            if (tab === 'analytics' || tab === 'sentinel') {
              setIsAnalyticsModalOpen(true);
            }
          }}
          alertCount={alerts.filter((a) => !a.acknowledged).length}
        />

        {/* 12-COLUMN COMMAND CENTER GRID */}
        <main
          style={{
            flex: 1,
            display: 'grid',
            gridTemplateColumns: 'repeat(12, 1fr)',
            gap: '14px',
            alignItems: 'stretch',
            width: '100%',
          }}
        >
          {/* LEFT PANEL: Geospatial Intelligence Map (~58% width, grid 7 cols) */}
          <section className="left-gis-container">
            <LivingMap
              stations={stations}
              selectedStationId={selectedStationId}
              onSelectStation={(id) => setSelectedStationId(id)}
              isSimulating={isSimulating}
              onDispatchClick={() => handleOpenDispatchModal()}
            />
          </section>

          {/* RIGHT PANEL: Insight Cascade (~42% width, grid 5 cols, flex column stack) */}
          <section className="right-cascade-container">
            {/* Card 1: Global Basin Health Score */}
            <HealthScoreCard
              isSimulating={isSimulating}
              overallScore={overallScore}
            />

            {/* Card 2: Automated One Health Alert Feed */}
            <AlertFeed
              alerts={alerts}
              onAcknowledgeAlert={handleAcknowledgeAlert}
              onDispatchClick={handleOpenDispatchModal}
              onSelectStationOnMap={(stId) => setSelectedStationId(stId)}
            />

            {/* Card 3: Station Deep-Dive Analytics */}
            <StationDeepDive
              stations={stations}
              selectedStation={selectedStation}
              onSelectStation={(id) => setSelectedStationId(id)}
              isSimulating={isSimulating}
            />
          </section>
        </main>
      </div>

      {/* FOOTER TICKER */}
      <FooterTicker
        uploads={citizenUploads}
        onOpenUploadModal={() => setIsUploadModalOpen(true)}
      />

      {/* MODALS */}
      <CitizenUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        stations={stations}
        onAddUpload={handleAddCitizenUpload}
      />

      <DispatchModal
        isOpen={isDispatchModalOpen}
        alertItem={activeDispatchAlert}
        onClose={() => setIsDispatchModalOpen(false)}
        onConfirmDispatch={handleConfirmDispatch}
      />

      <AnalyticsModal
        isOpen={isAnalyticsModalOpen}
        onClose={() => setIsAnalyticsModalOpen(false)}
      />
    </div>
  );
};

export default App;
