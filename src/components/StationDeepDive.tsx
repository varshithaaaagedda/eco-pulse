import React, { useState } from 'react';
import type { StationData } from '../types';
import { BarChart2, Cpu, ArrowUpRight, ArrowDownRight, Minus, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface StationDeepDiveProps {
  stations: StationData[];
  selectedStation: StationData;
  onSelectStation: (id: string) => void;
  isSimulating: boolean;
}

export const StationDeepDive: React.FC<StationDeepDiveProps> = ({
  stations,
  selectedStation,
  onSelectStation,
  isSimulating,
}) => {
  const [activeMetricTab, setActiveMetricTab] = useState<'ph' | 'do' | 'turbidity'>('turbidity');

  const station = selectedStation;
  const isCritical = station.status === 'critical' || (isSimulating && station.id === 'ST-03');

  // Render High-Precision 24h Area Telemetry Chart with Clear Baseline Threshold Line
  const renderMetricChart = () => {
    let dataset = station.history24h.turbidity;
    let label = 'Turbidity (NTU)';
    let color = isCritical ? '#f43f5e' : '#38bdf8';
    let thresholdVal = 10.0; // Baseline threshold NTU
    let unit = 'NTU';

    if (activeMetricTab === 'ph') {
      dataset = station.history24h.ph;
      label = 'pH Level Stream';
      color = '#fbbf24';
      thresholdVal = 6.5; // Baseline threshold pH
      unit = 'pH';
    } else if (activeMetricTab === 'do') {
      dataset = station.history24h.do;
      label = 'Dissolved Oxygen (D.O.)';
      color = '#38bdf8';
      thresholdVal = 5.0; // Baseline threshold D.O. mg/L
      unit = 'mg/L';
    }

    const min = Math.min(...dataset, thresholdVal) * 0.85;
    const max = Math.max(...dataset, thresholdVal) * 1.15 || 1;
    const width = 340;
    const height = 80;

    const points = dataset.map((val, i) => {
      const x = (i / (dataset.length - 1)) * width;
      const y = height - ((val - min) / (max - min)) * height;
      return { x, y, val };
    });

    const thresholdY = height - ((thresholdVal - min) / (max - min)) * height;

    const pathD = points.reduce(
      (acc, pt, i) => (i === 0 ? `M ${pt.x},${pt.y}` : `${acc} L ${pt.x},${pt.y}`),
      ''
    );

    const areaD = `${pathD} L ${width},${height} L 0,${height} Z`;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 500 }}>
            {label} (24-Hour Telemetry Stream)
          </span>
          <span style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: '#64748b' }}>
            Safe Baseline: <strong style={{ color: '#f8fafc' }}>{thresholdVal} {unit}</strong>
          </span>
        </div>

        <div
          style={{
            position: 'relative',
            height: '90px',
            width: '100%',
            backgroundColor: '#0b131a',
            border: '1px solid #1e293b',
            borderRadius: '8px',
            padding: '6px 8px',
            overflow: 'hidden',
          }}
        >
          <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
            <defs>
              <linearGradient id={`gisTelemetryGrad-${activeMetricTab}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                <stop offset="100%" stopColor={color} stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Baseline Threshold Line */}
            <line
              x1="0"
              y1={thresholdY}
              x2={width}
              y2={thresholdY}
              stroke="#f43f5e"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />

            {/* Area Fill */}
            <path d={areaD} fill={`url(#gisTelemetryGrad-${activeMetricTab})`} />

            {/* Precision Line Path */}
            <path d={pathD} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

            {/* Telemetry Points */}
            {points.map((pt, idx) => (
              <circle key={idx} cx={pt.x} cy={pt.y} r="2.5" fill={color} />
            ))}
          </svg>

          {/* Time axis ticks */}
          <div
            style={{
              position: 'absolute',
              bottom: 3,
              left: 10,
              right: 10,
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.58rem',
              fontFamily: 'var(--font-mono)',
              color: '#64748b',
              pointerEvents: 'none',
            }}
          >
            <span>00:00</span>
            <span>08:00</span>
            <span>16:00</span>
            <span>Now ({station.history24h.time[station.history24h.time.length - 1]})</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="gis-panel" style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* HEADER & DROPDOWN SELECTOR */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BarChart2 size={18} style={{ color: '#38bdf8' }} />
          <h2 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#f8fafc', letterSpacing: '-0.2px' }}>
            Station Deep-Dive Analytics
          </h2>
        </div>

        {/* Dropdown Selector */}
        <select
          value={station.id}
          onChange={(e) => onSelectStation(e.target.value)}
          style={{
            backgroundColor: '#0b131a',
            border: '1px solid #1e293b',
            color: '#38bdf8',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem',
            fontWeight: 700,
            padding: '5px 10px',
            borderRadius: '6px',
            outline: 'none',
            cursor: 'pointer',
          }}
        >
          {stations.map((st) => (
            <option key={st.id} value={st.id} style={{ backgroundColor: '#0f172a', color: '#fff' }}>
              {st.name} ({st.status.toUpperCase()})
            </option>
          ))}
        </select>
      </div>

      {/* 3 COMPACT PARAMETER CARDS SIDE-BY-SIDE: pH, D.O., TURBIDITY */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
        {/* pH Card */}
        <div
          onClick={() => setActiveMetricTab('ph')}
          style={{
            backgroundColor: activeMetricTab === 'ph' ? 'rgba(251, 191, 36, 0.12)' : '#0b131a',
            border: `1px solid ${activeMetricTab === 'ph' ? '#fbbf24' : '#1e293b'}`,
            borderRadius: '6px',
            padding: '8px 10px',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <div style={{ fontSize: '0.6rem', color: '#64748b', fontWeight: 600 }}>pH LEVEL</div>
          <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#f8fafc', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
            {station.ph}
            {station.phTrend === 'down' ? <ArrowDownRight size={13} color="#f43f5e" /> : <Minus size={13} color="#38bdf8" />}
          </div>
          <div style={{ fontSize: '0.58rem', color: station.ph < 6.5 ? '#f43f5e' : '#38bdf8', display: 'flex', alignItems: 'center', gap: '3px', marginTop: '4px' }}>
            {station.ph < 6.5 ? <AlertTriangle size={10} /> : <CheckCircle2 size={10} />}
            <span>{station.ph < 6.5 ? 'Acid Shift Warning' : 'Normal Range'}</span>
          </div>
        </div>

        {/* Dissolved Oxygen Card */}
        <div
          onClick={() => setActiveMetricTab('do')}
          style={{
            backgroundColor: activeMetricTab === 'do' ? 'rgba(56, 189, 248, 0.12)' : '#0b131a',
            border: `1px solid ${activeMetricTab === 'do' ? '#38bdf8' : '#1e293b'}`,
            borderRadius: '6px',
            padding: '8px 10px',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <div style={{ fontSize: '0.6rem', color: '#64748b', fontWeight: 600 }}>D.O. (OXYGEN)</div>
          <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#f8fafc', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
            {station.doLevel} mg/L
            {station.doTrend === 'down' ? <ArrowDownRight size={13} color="#f43f5e" /> : <ArrowUpRight size={13} color="#38bdf8" />}
          </div>
          <div style={{ fontSize: '0.58rem', color: station.doLevel < 5.0 ? '#f43f5e' : '#38bdf8', display: 'flex', alignItems: 'center', gap: '3px', marginTop: '4px' }}>
            {station.doLevel < 5.0 ? <AlertTriangle size={10} /> : <CheckCircle2 size={10} />}
            <span>{station.doLevel < 5.0 ? 'Hypoxia Warning' : 'Adequate Saturation'}</span>
          </div>
        </div>

        {/* Turbidity Card */}
        <div
          onClick={() => setActiveMetricTab('turbidity')}
          style={{
            backgroundColor: activeMetricTab === 'turbidity' ? 'rgba(244, 63, 94, 0.12)' : '#0b131a',
            border: `1px solid ${activeMetricTab === 'turbidity' ? '#f43f5e' : '#1e293b'}`,
            borderRadius: '6px',
            padding: '8px 10px',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <div style={{ fontSize: '0.6rem', color: '#64748b', fontWeight: 600 }}>TURBIDITY (NTU)</div>
          <div style={{ fontSize: '0.95rem', fontWeight: 800, color: isCritical ? '#f43f5e' : '#f8fafc', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
            {station.turbidity} NTU
            {station.turbidityTrend === 'up' ? <ArrowUpRight size={13} color="#f43f5e" /> : <Minus size={13} color="#38bdf8" />}
          </div>
          <div style={{ fontSize: '0.58rem', color: station.turbidity > 15 ? '#f43f5e' : '#38bdf8', display: 'flex', alignItems: 'center', gap: '3px', marginTop: '4px' }}>
            {station.turbidity > 15 ? <AlertTriangle size={10} /> : <CheckCircle2 size={10} />}
            <span>{station.turbidity > 15 ? 'Sediment Spike' : 'Optimal Clarity'}</span>
          </div>
        </div>
      </div>

      {/* 24H HIGH-PRECISION TELEMETRY STREAM CHART */}
      {renderMetricChart()}

      {/* AI IMPACT & IMPACT ZONE SUMMARY */}
      <div
        style={{
          backgroundColor: '#0b131a',
          border: '1px solid #1e293b',
          borderRadius: '6px',
          padding: '10px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Cpu size={14} style={{ color: '#38bdf8' }} />
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>
            HYDRO-AI DIAGNOSTIC SUMMARY
          </span>
        </div>
        <p style={{ fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1.35 }}>
          {station.aiInsight}
        </p>
      </div>

    </div>
  );
};
