/**
 * EcoPulse FastAPI Backend API Client Service
 * Connects React Frontend to http://localhost:8000 (Local) or /api (Vercel)
 */

const getApiBaseUrl = (): string => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  return '/api';
};

async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const primaryUrl = `${getApiBaseUrl()}${endpoint}`;
  try {
    const res = await fetch(primaryUrl, options);
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    return await res.json();
  } catch (err) {
    // Local dev fallback if relative /api fetch fails
    if (getApiBaseUrl() === '/api') {
      const fallbackUrl = `http://localhost:8000/api${endpoint}`;
      try {
        const res = await fetch(fallbackUrl, options);
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        return await res.json();
      } catch (fallbackErr) {
        console.warn(`[EcoPulse API] Primary (${primaryUrl}) and Fallback (${fallbackUrl}) failed.`, fallbackErr);
        throw fallbackErr;
      }
    }
    throw err;
  }
}

export interface ApiBasinSummary {
  overall_score: number;
  trend_7d_percent: number;
  active_alerts_count: number;
  critical_alerts_count: number;
  caution_alerts_count: number;
  total_stations: number;
  timestamp: string;
}

export interface ApiStationMetadata {
  station_id: string;
  name: string;
  sector: string;
  latitude: number;
  longitude: number;
  risk_status: 'SAFE' | 'CAUTION' | 'CRITICAL';
  health_score: number;
  latest_telemetry?: {
    station_id: string;
    timestamp: string;
    ph: number;
    dissolved_oxygen: number;
    turbidity: number;
    water_temperature: number;
  };
}

export interface ApiTelemetryRecord {
  station_id: string;
  timestamp: string;
  ph: number;
  dissolved_oxygen: number;
  turbidity: number;
  water_temperature: number;
}

export interface ApiAlertModel {
  alert_id: string;
  station_id: string;
  severity: 'critical' | 'caution' | 'info';
  message: string;
  timestamp: string;
  resolved: boolean;
  risk_triggers?: string[];
  action_required?: string;
}

export interface ApiSurgeSimulationResponse {
  status: string;
  station_id: string;
  injected_metrics: ApiTelemetryRecord;
  new_wqi_score: number;
  new_risk_status: 'SAFE' | 'CAUTION' | 'CRITICAL';
  generated_alert: ApiAlertModel;
  insight: string;
}

export interface ApiTelemetryIngestResponse {
  status: string;
  telemetry: ApiTelemetryRecord;
  wqi_score: number;
  risk_status: 'SAFE' | 'CAUTION' | 'CRITICAL';
  insight: string;
  alert_generated?: ApiAlertModel;
}

/**
 * Fetch global basin health summary aggregate
 */
export async function fetchBasinSummary(): Promise<ApiBasinSummary> {
  return apiFetch<ApiBasinSummary>('/basin/summary');
}

/**
 * Fetch all monitoring stations with latest telemetry and scores
 */
export async function fetchStations(): Promise<ApiStationMetadata[]> {
  return apiFetch<ApiStationMetadata[]>('/stations');
}

/**
 * Fetch 24-hour time-series telemetry data for a specific station
 */
export async function fetchStationTelemetry(stationId: string): Promise<ApiTelemetryRecord[]> {
  return apiFetch<ApiTelemetryRecord[]>(`/stations/${stationId}/telemetry`);
}

/**
 * Fetch live stack of One Health alerts
 */
export async function fetchAlerts(severity?: string): Promise<ApiAlertModel[]> {
  const endpoint = severity ? `/alerts?severity=${severity}` : '/alerts';
  return apiFetch<ApiAlertModel[]>(endpoint);
}

/**
 * Ingest new citizen-science telemetry payload
 */
export async function ingestTelemetry(payload: {
  station_id: string;
  ph: number;
  dissolved_oxygen: number;
  turbidity: number;
  water_temperature: number;
}): Promise<ApiTelemetryIngestResponse> {
  return apiFetch<ApiTelemetryIngestResponse>('/telemetry/ingest', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

/**
 * Trigger mock pollution surge simulation on target station
 */
export async function triggerSurgeSimulation(stationId: string = 'ST-03'): Promise<ApiSurgeSimulationResponse> {
  return apiFetch<ApiSurgeSimulationResponse>(`/simulation/trigger-surge?station_id=${stationId}`, {
    method: 'POST',
  });
}
