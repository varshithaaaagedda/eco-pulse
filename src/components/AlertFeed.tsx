import React, { useState } from 'react';
import type { AlertItem } from '../types';
import { CheckCircle2, Send, Bell } from 'lucide-react';

interface AlertFeedProps {
  alerts: AlertItem[];
  onAcknowledgeAlert: (id: string) => void;
  onDispatchClick: (alert?: AlertItem) => void;
  onSelectStationOnMap: (stationId: string) => void;
}

export const AlertFeed: React.FC<AlertFeedProps> = ({
  alerts,
  onAcknowledgeAlert,
  onDispatchClick,
  onSelectStationOnMap,
}) => {
  const [filter, setFilter] = useState<'all' | 'critical'>('all');

  const filteredAlerts = alerts.filter((alert) => {
    if (filter === 'critical') return alert.severity === 'critical';
    return true;
  });

  return (
    <div className="gis-panel" style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* HEADER & FILTER TOGGLE ("All", "Critical Only") */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Bell size={18} style={{ color: '#f43f5e' }} />
          <h2 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#f8fafc', letterSpacing: '-0.2px' }}>
            Automated One Health Alert Feed
          </h2>
          <span
            style={{
              fontSize: '0.65rem',
              fontWeight: 800,
              fontFamily: 'var(--font-mono)',
              color: '#ffffff',
              backgroundColor: '#f43f5e',
              padding: '1px 6px',
              borderRadius: '9999px',
            }}
          >
            {alerts.filter((a) => !a.acknowledged).length} ACTIVE
          </span>
        </div>

        {/* Filter Toggle Buttons */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '3px',
            backgroundColor: '#0b131a',
            border: '1px solid #1e293b',
            padding: '2px',
            borderRadius: '6px',
          }}
        >
          <button
            onClick={() => setFilter('all')}
            style={{
              fontSize: '0.68rem',
              fontWeight: 600,
              padding: '3px 9px',
              borderRadius: '4px',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: filter === 'all' ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
              color: filter === 'all' ? '#38bdf8' : '#64748b',
            }}
          >
            All
          </button>
          <button
            onClick={() => setFilter('critical')}
            style={{
              fontSize: '0.68rem',
              fontWeight: 600,
              padding: '3px 9px',
              borderRadius: '4px',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: filter === 'critical' ? 'rgba(244, 63, 94, 0.18)' : 'transparent',
              color: filter === 'critical' ? '#f43f5e' : '#64748b',
            }}
          >
            Critical Only
          </button>
        </div>
      </div>

      {/* LIVE LOG CONTAINER WITH SUBTLE SCROLLBAR */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          overflowY: 'auto',
          maxHeight: '260px',
          paddingRight: '2px',
        }}
      >
        {filteredAlerts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px 0', color: '#64748b', fontSize: '0.78rem' }}>
            No alerts matching filter criteria.
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const isCritical = alert.severity === 'critical';
            const isWarning = alert.severity === 'warning';

            let badgeBg = 'rgba(56, 189, 248, 0.1)';
            let badgeBorder = 'rgba(56, 189, 248, 0.3)';
            let badgeText = '#38bdf8';
            let label = 'ADVISORY';

            if (isCritical) {
              badgeBg = 'rgba(244, 63, 94, 0.12)';
              badgeBorder = 'rgba(244, 63, 94, 0.4)';
              badgeText = '#f43f5e';
              label = 'CRITICAL';
            } else if (isWarning) {
              badgeBg = 'rgba(251, 191, 36, 0.12)';
              badgeBorder = 'rgba(251, 191, 36, 0.4)';
              badgeText = '#fbbf24';
              label = 'CAUTION';
            }

            return (
              <div
                key={alert.id}
                style={{
                  backgroundColor: alert.acknowledged ? 'rgba(15, 23, 42, 0.4)' : badgeBg,
                  border: `1px solid ${alert.acknowledged ? '#1e293b' : badgeBorder}`,
                  borderRadius: '8px',
                  padding: '10px 12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  opacity: alert.acknowledged ? 0.75 : 1,
                  transition: 'all 0.15s ease',
                }}
              >
                {/* Header Row: Severity Badge, Timestamp, Bold Station Identifier */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        fontSize: '0.6rem',
                        fontWeight: 800,
                        fontFamily: 'var(--font-mono)',
                        color: badgeText,
                        backgroundColor: badgeBg,
                        border: `1px solid ${badgeBorder}`,
                        padding: '1px 6px',
                        borderRadius: '4px',
                      }}
                    >
                      {label}
                    </span>

                    <button
                      onClick={() => onSelectStationOnMap(alert.stationId)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#f8fafc',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        textAlign: 'left',
                        padding: 0,
                      }}
                    >
                      {alert.stationName}
                    </button>
                  </div>

                  <span style={{ fontSize: '0.68rem', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
                    {alert.timestamp}
                  </span>
                </div>

                {/* Plain-Language Concise Impact Text */}
                <p style={{ fontSize: '0.78rem', color: '#cbd5e1', lineHeight: 1.35, fontWeight: 400 }}>
                  {alert.briefing}
                </p>

                {/* Risk Triggers + Interactive Actions */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '2px', flexWrap: 'wrap', gap: '6px' }}>
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    {alert.riskTriggers.map((trig, idx) => (
                      <span
                        key={idx}
                        style={{
                          fontSize: '0.62rem',
                          fontFamily: 'var(--font-mono)',
                          color: isCritical ? '#f43f5e' : '#94a3b8',
                          backgroundColor: '#0b131a',
                          border: '1px solid #1e293b',
                          padding: '1px 6px',
                          borderRadius: '3px',
                        }}
                      >
                        {trig}
                      </span>
                    ))}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {!alert.acknowledged ? (
                      <button
                        onClick={() => onAcknowledgeAlert(alert.id)}
                        style={{
                          backgroundColor: 'rgba(56, 189, 248, 0.1)',
                          border: '1px solid rgba(56, 189, 248, 0.3)',
                          color: '#38bdf8',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontSize: '0.68rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <CheckCircle2 size={12} /> Acknowledge
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.65rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle2 size={12} color="#38bdf8" /> Acked
                      </span>
                    )}

                    <button
                      onClick={() => onDispatchClick(alert)}
                      style={{
                        backgroundColor: 'rgba(251, 191, 36, 0.12)',
                        border: '1px solid rgba(251, 191, 36, 0.4)',
                        color: '#fbbf24',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '0.68rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <Send size={11} /> Dispatch
                    </button>
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
