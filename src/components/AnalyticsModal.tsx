import React from 'react';
import { X, Sparkles, Activity, Cpu, Database } from 'lucide-react';

interface AnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AnalyticsModal: React.FC<AnalyticsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(3, 10, 14, 0.85)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        padding: '16px',
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '700px',
          padding: '28px',
          borderRadius: '24px',
          border: '1px solid rgba(0, 242, 254, 0.4)',
          boxShadow: '0 25px 60px rgba(0,0,0,0.85), 0 0 35px rgba(0, 242, 254, 0.2)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Sparkles size={26} className="text-cyan glow-cyan" />
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>
                One Health Hydro-Intelligence Engine
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Basin-Wide Ecological & Public Risk Diagnostic Matrix
              </p>
            </div>
          </div>

          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={22} />
          </button>
        </div>

        {/* ANALYTICS GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
          
          <div style={{ background: 'rgba(8, 24, 34, 0.7)', border: '1px solid rgba(0, 242, 254, 0.2)', borderRadius: '14px', padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--accent-cyan)' }}>
              <Cpu size={18} />
              <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>Hydrological Neural Model</span>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>
              Integrates real-time optical turbidity, dissolved oxygen decay kinetics, and watershed precipitation models to predict hypoxia 12 hours in advance.
            </p>
            <div style={{ marginTop: '10px', fontSize: '0.7rem', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
              Accuracy Score: 98.4% • Model Latency: 42ms
            </div>
          </div>

          <div style={{ background: 'rgba(8, 24, 34, 0.7)', border: '1px solid rgba(0, 242, 254, 0.2)', borderRadius: '14px', padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--accent-amber)' }}>
              <Activity size={18} />
              <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>Ecotoxicology Vectoring</span>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>
              Tracks chemical run-off pathways from industrial outfalls and agricultural tributaries, calculating population exposure radii across urban sectors.
            </p>
            <div style={{ marginTop: '10px', fontSize: '0.7rem', color: 'var(--accent-amber)', fontFamily: 'var(--font-mono)' }}>
              Active Sensors: 48 IoT Telemetry Nodes
            </div>
          </div>

        </div>

        {/* ECOPULSE PRINCIPLES & ONE HEALTH FRAMEWORK */}
        <div style={{ background: 'rgba(6, 18, 26, 0.8)', border: '1px solid rgba(0, 242, 254, 0.15)', borderRadius: '14px', padding: '16px', marginBottom: '20px' }}>
          <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: '#fff', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Database size={16} className="text-cyan" />
            The One Health Hydro-Safety Framework
          </h4>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            EcoPulse links environmental river sensors with community health indicators. Early detection of turbidity spikes, pH acid shifts, and bacterial runoff allows municipal authorities to issue automated public health alerts before water contamination spreads into local water supplies or recreational zones.
          </p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              background: 'linear-gradient(135deg, #00f2fe, #0077b6)',
              border: 'none',
              color: '#030a0e',
              fontWeight: 800,
              padding: '10px 24px',
              borderRadius: '12px',
              fontSize: '0.85rem',
              cursor: 'pointer',
              boxShadow: '0 0 16px rgba(0, 242, 254, 0.4)',
            }}
          >
            Close Diagnostics
          </button>
        </div>
      </div>
    </div>
  );
};
