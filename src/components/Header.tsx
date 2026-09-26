import React, { useState, useEffect } from 'react';
import { Activity, RefreshCw, Download, ChevronDown, ShieldCheck, User } from 'lucide-react';

interface HeaderProps {
  isSimulating: boolean;
  onToggleSimulation: () => void;
  onExportGIS: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isSimulating,
  onToggleSimulation,
  onExportGIS,
}) => {
  const [localTime, setLocalTime] = useState<string>('');
  const [utcTime, setUtcTime] = useState<string>('');
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setLocalTime(now.toLocaleTimeString('en-US', { hour12: false }));
      setUtcTime(now.toISOString().substring(11, 19) + ' UTC');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header
      style={{
        height: '54px',
        backgroundColor: '#0f172a',
        borderBottom: '1px solid #1e293b',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        zIndex: 50,
        position: 'sticky',
        top: 0,
      }}
    >
      {/* LEFT SIDE: BRAND ICON + EcoPulse // OneAquaHealth Track 2 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '6px',
            backgroundColor: 'rgba(56, 189, 248, 0.12)',
            border: '1px solid rgba(56, 189, 248, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#38bdf8',
          }}
        >
          <Activity size={18} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h1 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc', letterSpacing: '-0.3px' }}>
            EcoPulse
          </h1>
          <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>//</span>
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 600,
              fontFamily: 'var(--font-mono)',
              color: '#38bdf8',
              backgroundColor: 'rgba(56, 189, 248, 0.08)',
              border: '1px solid rgba(56, 189, 248, 0.2)',
              padding: '2px 8px',
              borderRadius: '4px',
              letterSpacing: '0.5px',
            }}
          >
            OneAquaHealth Track 2
          </span>
        </div>
      </div>

      {/* CENTER: LIVE SYSTEM STATUS PULSE & UTC / LOCAL TIME */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'rgba(15, 23, 42, 0.8)',
            border: '1px solid #1e293b',
            padding: '4px 12px',
            borderRadius: '6px',
          }}
        >
          <span className={`status-dot ${isSimulating ? 'status-dot-crimson' : 'status-dot-cyan'}`} />
          <span
            style={{
              fontSize: '0.7rem',
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              color: isSimulating ? '#f43f5e' : '#38bdf8',
              letterSpacing: '0.6px',
            }}
          >
            {isSimulating ? 'SIMULATION MODE // HIGH RISK SURGE' : 'SYSTEM ONLINE // LIVE FEED (24ms)'}
          </span>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontSize: '0.75rem',
            fontFamily: 'var(--font-mono)',
            color: '#94a3b8',
            backgroundColor: '#0b131a',
            border: '1px solid #1e293b',
            padding: '4px 12px',
            borderRadius: '6px',
          }}
        >
          <span>
            LOC <strong style={{ color: '#f8fafc' }}>{localTime || '15:31:45'}</strong>
          </span>
          <span style={{ color: '#334155' }}>|</span>
          <span>
            UTC <strong style={{ color: '#38bdf8' }}>{utcTime || '10:01:45 UTC'}</strong>
          </span>
        </div>
      </div>

      {/* RIGHT SIDE: PROFILE & QUICK ACTIONS */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Quick Action: Export GIS Telemetry */}
        <button
          onClick={onExportGIS}
          title="Export GeoJSON / CSV Hydro Telemetry"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: '#162330',
            border: '1px solid #1e293b',
            color: '#e2e8f0',
            padding: '6px 12px',
            borderRadius: '6px',
            fontSize: '0.75rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <Download size={14} style={{ color: '#38bdf8' }} />
          <span>Export GIS Telemetry</span>
        </button>

        {/* Quick Action: Simulate Risk Surge */}
        <button
          onClick={onToggleSimulation}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: isSimulating ? 'rgba(244, 63, 94, 0.15)' : 'rgba(56, 189, 248, 0.1)',
            border: isSimulating ? '1px solid rgba(244, 63, 94, 0.5)' : '1px solid rgba(56, 189, 248, 0.3)',
            color: isSimulating ? '#f43f5e' : '#38bdf8',
            padding: '6px 12px',
            borderRadius: '6px',
            fontSize: '0.75rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <RefreshCw size={14} className={isSimulating ? 'animate-spin' : ''} />
          <span>{isSimulating ? 'Reset Baseline' : 'Simulate Risk Surge'}</span>
        </button>

        {/* User Profile Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#111b24',
              border: '1px solid #1e293b',
              padding: '4px 10px',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            <div
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: '#38bdf8',
                color: '#0f172a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.7rem',
                fontWeight: 700,
              }}
            >
              <User size={14} />
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#f8fafc', lineHeight: 1.1 }}>
                Dr. A. Vance
              </div>
              <div style={{ fontSize: '0.62rem', color: '#64748b' }}>Lead Hydro-Ecologist</div>
            </div>
            <ChevronDown size={14} style={{ color: '#64748b' }} />
          </button>

          {isProfileOpen && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: '110%',
                width: '230px',
                backgroundColor: '#111b24',
                border: '1px solid #1e293b',
                borderRadius: '8px',
                padding: '8px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
                zIndex: 60,
              }}
            >
              <div style={{ padding: '6px 8px', borderBottom: '1px solid #1e293b', marginBottom: '4px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f8fafc' }}>Dr. A. Vance</div>
                <div style={{ fontSize: '0.65rem', color: '#38bdf8' }}>OneAquaHealth Lead Scientist</div>
              </div>
              <div
                style={{
                  fontSize: '0.72rem',
                  color: '#94a3b8',
                  padding: '6px 8px',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <ShieldCheck size={14} style={{ color: '#38bdf8' }} />
                <span>GIS Clearance Level 4</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
