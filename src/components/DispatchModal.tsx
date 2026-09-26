import React, { useState } from 'react';
import type { AlertItem } from '../types';
import { X, Send, Crosshair } from 'lucide-react';

interface DispatchModalProps {
  isOpen: boolean;
  alertItem?: AlertItem | null;
  onClose: () => void;
  onConfirmDispatch: () => void;
}

export const DispatchModal: React.FC<DispatchModalProps> = ({
  isOpen,
  alertItem,
  onClose,
  onConfirmDispatch,
}) => {
  const [unitType, setUnitType] = useState<string>('Autonomous Hydro-Drone Alpha-9');
  const [priority, setPriority] = useState<string>('HIGH - Immediate Bio-Sampling');

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
          maxWidth: '500px',
          padding: '24px',
          borderRadius: '20px',
          border: '1px solid rgba(255, 183, 3, 0.5)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.8), 0 0 30px rgba(255, 183, 3, 0.2)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Crosshair size={24} className="text-amber glow-amber" />
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>
                Field Inspection Dispatch
              </h3>
              <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                Target: {alertItem ? alertItem.stationName : 'Sector 4 Estuary Confluence'}
              </p>
            </div>
          </div>

          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ background: 'rgba(6, 20, 28, 0.8)', border: '1px solid rgba(0, 242, 254, 0.15)', borderRadius: '12px', padding: '14px', marginBottom: '16px' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '4px' }}>ALERT BRIEFING</div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>
            {alertItem ? alertItem.briefing : 'High turbidity spike & sediment surge reported downstream.'}
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Select Reconnaissance Unit
            </label>
            <select
              value={unitType}
              onChange={(e) => setUnitType(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(6, 22, 30, 0.9)',
                border: '1px solid rgba(255, 183, 3, 0.3)',
                color: '#fff',
                padding: '10px 12px',
                borderRadius: '10px',
                fontSize: '0.82rem',
                outline: 'none',
              }}
            >
              <option value="Autonomous Hydro-Drone Alpha-9">Autonomous Hydro-Drone Alpha-9 (Water Surface + Multispectral)</option>
              <option value="Rapid Hazmat Sampling Team B">Rapid Hazmat Sampling Team B (Ground Unit)</option>
              <option value="Submersible Bio-Sensor Array Unit 3">Submersible Bio-Sensor Array Unit 3</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Mission Protocol Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(6, 22, 30, 0.9)',
                border: '1px solid rgba(255, 183, 3, 0.3)',
                color: 'var(--accent-amber)',
                fontWeight: 700,
                padding: '10px 12px',
                borderRadius: '10px',
                fontSize: '0.82rem',
                outline: 'none',
              }}
            >
              <option value="CRITICAL - Emergency Containment & Public Advisory">CRITICAL - Emergency Containment & Public Advisory</option>
              <option value="HIGH - Immediate Bio-Sampling">HIGH - Immediate Bio-Sampling & Water Profiling</option>
              <option value="ROUTINE - Standard Telemetry Inspection">ROUTINE - Standard Telemetry Inspection</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: 'var(--text-muted)',
                padding: '8px 16px',
                borderRadius: '10px',
                fontSize: '0.8rem',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>

            <button
              onClick={() => {
                onConfirmDispatch();
                onClose();
              }}
              style={{
                background: 'linear-gradient(135deg, #ffb703, #ff8800)',
                border: 'none',
                color: '#030a0e',
                fontWeight: 800,
                padding: '8px 20px',
                borderRadius: '10px',
                fontSize: '0.82rem',
                cursor: 'pointer',
                boxShadow: '0 0 16px rgba(255, 183, 3, 0.4)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Send size={16} /> Authorize & Launch Unit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
