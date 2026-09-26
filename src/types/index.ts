export type StationStatus = 'safe' | 'caution' | 'critical';

export interface StationData {
  id: string;
  name: string;
  location: string;
  coordinates: { x: number; y: number }; // normalized 0-100 for tactical map
  status: StationStatus;
  healthScore: number;
  ph: number;
  phTrend: 'up' | 'down' | 'stable';
  doLevel: number; // Dissolved Oxygen in mg/L
  doTrend: 'up' | 'down' | 'stable';
  turbidity: number; // NTU
  turbidityTrend: 'up' | 'down' | 'stable';
  flowRate: number; // m3/s
  temperature: number; // Celsius
  eColiRisk: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  lastUpdated: string;
  history24h: {
    time: string[];
    ph: number[];
    do: number[];
    turbidity: number[];
  };
  aiInsight: string;
  impactRadiusKm: number;
  affectedPopulation: number;
}

export interface AlertItem {
  id: string;
  stationId: string;
  stationName: string;
  severity: 'critical' | 'warning' | 'info';
  timestamp: string;
  title: string;
  briefing: string;
  riskTriggers: string[];
  actionRequired: string;
  acknowledged: boolean;
  dispatched?: boolean;
}

export interface CitizenUpload {
  id: string;
  username: string;
  avatar: string;
  stationName: string;
  ph: number;
  turbidity: string;
  timestamp: string;
  note: string;
  verified: boolean;
}

export interface MapLayers {
  hexGrid: boolean;
  streamFlow: boolean;
  riskHeatmap: boolean;
  sensorNodes: boolean;
  dronePath: boolean;
}
