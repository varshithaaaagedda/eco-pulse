import React from 'react';
import type { CitizenUpload } from '../types';
import { Radio, PlusCircle, CheckCircle } from 'lucide-react';

interface FooterTickerProps {
  uploads: CitizenUpload[];
  onOpenUploadModal: () => void;
}

export const FooterTicker: React.FC<FooterTickerProps> = ({
  uploads,
  onOpenUploadModal,
}) => {
  return (
    <footer
      style={{
        height: '38px',
        backgroundColor: '#0f172a',
        borderTop: '1px solid #1e293b',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        zIndex: 40,
        gap: '12px',
      }}
    >
      {/* LEFT STATIC BADGE */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          backgroundColor: 'rgba(56, 189, 248, 0.08)',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          padding: '2px 8px',
          borderRadius: '4px',
          flexShrink: 0,
        }}
      >
        <Radio size={12} style={{ color: '#38bdf8' }} className="animate-pulse" />
        <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>
          CITIZEN TELEMETRY FEED
        </span>
      </div>

      {/* CENTER MARQUEE TICKER */}
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        <div className="animate-ticker" style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
          {[...uploads, ...uploads].map((item, idx) => (
            <div
              key={`${item.id}-${idx}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.72rem',
                color: '#cbd5e1',
              }}
            >
              <span style={{ fontWeight: 700, color: '#38bdf8' }}>{item.username}</span>
              <span style={{ color: '#64748b' }}>uploaded reading at</span>
              <span style={{ fontWeight: 600, color: '#f8fafc' }}>{item.stationName}:</span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  color: item.ph < 6.0 ? '#f43f5e' : '#fbbf24',
                  fontWeight: 700,
                  backgroundColor: '#0b131a',
                  padding: '1px 5px',
                  borderRadius: '3px',
                  border: '1px solid #1e293b',
                }}
              >
                pH {item.ph}
              </span>
              <span style={{ color: '#94a3b8' }}>• {item.turbidity}</span>
              <span style={{ color: '#64748b', fontFamily: 'var(--font-mono)' }}>({item.timestamp})</span>
              {item.verified && (
                <span title="Verified Field Reading" style={{ display: 'inline-flex', alignItems: 'center' }}>
                  <CheckCircle size={11} style={{ color: '#38bdf8' }} />
                </span>
              )}
              <span style={{ color: '#334155', margin: '0 6px' }}>|</span>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT ACTION BUTTON */}
      <button
        onClick={onOpenUploadModal}
        style={{
          backgroundColor: '#162330',
          border: '1px solid #1e293b',
          color: '#38bdf8',
          padding: '3px 10px',
          borderRadius: '4px',
          fontSize: '0.7rem',
          fontWeight: 700,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          flexShrink: 0,
        }}
      >
        <PlusCircle size={13} />
        <span>Post Citizen Reading</span>
      </button>
    </footer>
  );
};
