import React, { useState } from 'react';
import type { CitizenUpload, StationData } from '../types';
import { X, UploadCloud, CheckCircle2 } from 'lucide-react';

interface CitizenUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  stations: StationData[];
  onAddUpload: (upload: CitizenUpload) => void;
}

export const CitizenUploadModal: React.FC<CitizenUploadModalProps> = ({
  isOpen,
  onClose,
  stations,
  onAddUpload,
}) => {
  const [stationId, setStationId] = useState<string>(stations[0]?.id || 'ST-01');
  const [username, setUsername] = useState<string>('@RiverWatcher_Echo');
  const [ph, setPh] = useState<number>(7.1);
  const [turbidity, setTurbidity] = useState<string>('Clear (4.0 NTU)');
  const [note, setNote] = useState<string>('Water clarity appears high near the downstream bridge. No unusual odor.');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const station = stations.find((s) => s.id === stationId);
    const newUpload: CitizenUpload = {
      id: `CIT-${Date.now().toString().slice(-4)}`,
      username,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120',
      stationName: station ? station.name : 'Station 01',
      ph: Number(ph),
      turbidity,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      note,
      verified: true,
    };

    onAddUpload(newUpload);
    onClose();
  };

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
          maxWidth: '520px',
          padding: '24px',
          borderRadius: '20px',
          border: '1px solid rgba(0, 242, 254, 0.35)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.8), 0 0 30px rgba(0, 242, 254, 0.15)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <UploadCloud size={24} className="text-cyan glow-cyan" />
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff' }}>
                Citizen Science Telemetry Upload
              </h3>
              <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                One Health Crowdsourced Water Sampling Portal
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
            }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Target Stream Station
            </label>
            <select
              value={stationId}
              onChange={(e) => setStationId(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(6, 22, 30, 0.9)',
                border: '1px solid rgba(0, 242, 254, 0.25)',
                color: '#fff',
                padding: '10px 12px',
                borderRadius: '10px',
                fontSize: '0.82rem',
                outline: 'none',
              }}
            >
              {stations.map((st) => (
                <option key={st.id} value={st.id} style={{ background: '#07161e' }}>
                  {st.name}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Citizen Handle / ID
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(6, 22, 30, 0.9)',
                  border: '1px solid rgba(0, 242, 254, 0.25)',
                  color: '#fff',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  fontSize: '0.82rem',
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Sampled pH Level (0 - 14)
              </label>
              <input
                type="number"
                step="0.1"
                min="4"
                max="10"
                value={ph}
                onChange={(e) => setPh(parseFloat(e.target.value))}
                style={{
                  width: '100%',
                  background: 'rgba(6, 22, 30, 0.9)',
                  border: '1px solid rgba(0, 242, 254, 0.25)',
                  color: 'var(--accent-cyan)',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  padding: '10px 12px',
                  borderRadius: '10px',
                  fontSize: '0.82rem',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Visual Turbidity / Observation
            </label>
            <input
              type="text"
              value={turbidity}
              onChange={(e) => setTurbidity(e.target.value)}
              placeholder="e.g. Clear (3.2 NTU) or Murky"
              style={{
                width: '100%',
                background: 'rgba(6, 22, 30, 0.9)',
                border: '1px solid rgba(0, 242, 254, 0.25)',
                color: '#fff',
                padding: '10px 12px',
                borderRadius: '10px',
                fontSize: '0.82rem',
                outline: 'none',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Field Inspection Note
            </label>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(6, 22, 30, 0.9)',
                border: '1px solid rgba(0, 242, 254, 0.25)',
                color: '#fff',
                padding: '10px 12px',
                borderRadius: '10px',
                fontSize: '0.82rem',
                outline: 'none',
                resize: 'none',
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button
              type="button"
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
              type="submit"
              style={{
                background: 'linear-gradient(135deg, #00f2fe, #0077b6)',
                border: 'none',
                color: '#030a0e',
                fontWeight: 800,
                padding: '8px 20px',
                borderRadius: '10px',
                fontSize: '0.82rem',
                cursor: 'pointer',
                boxShadow: '0 0 16px rgba(0, 242, 254, 0.4)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <CheckCircle2 size={16} /> Broadcast Telemetry
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
