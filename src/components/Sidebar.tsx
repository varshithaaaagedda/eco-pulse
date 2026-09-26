import React from 'react';
import {
  LayoutDashboard,
  Layers,
  BarChart3,
  Bell,
  Cpu,
  Settings,
  HelpCircle,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  alertCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  alertCount,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Tactical Matrix', icon: LayoutDashboard },
    { id: 'layers', label: 'GIS Vector Layers', icon: Layers },
    { id: 'analytics', label: 'Hydro Telemetry', icon: BarChart3 },
    { id: 'alerts', label: 'One Health Alerts', icon: Bell, badge: alertCount },
    { id: 'sentinel', label: 'AI Predictor', icon: Cpu },
    { id: 'settings', label: 'Configuration', icon: Settings },
  ];

  return (
    <aside
      className="gis-panel"
      style={{
        width: '56px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 0',
        borderRadius: '10px',
        zIndex: 25,
      }}
    >
      {/* Top Nav Group */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center', width: '100%' }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              title={item.label}
              style={{
                position: 'relative',
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                backgroundColor: isActive ? 'rgba(56, 189, 248, 0.12)' : 'transparent',
                border: isActive ? '1px solid rgba(56, 189, 248, 0.35)' : '1px solid transparent',
                color: isActive ? '#38bdf8' : '#64748b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <Icon size={19} />
              
              {/* Alert counter badge */}
              {item.badge ? (
                <span
                  style={{
                    position: 'absolute',
                    top: '-2px',
                    right: '-2px',
                    backgroundColor: '#f43f5e',
                    color: '#ffffff',
                    fontSize: '0.6rem',
                    fontWeight: 800,
                    fontFamily: 'var(--font-mono)',
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {item.badge}
                </span>
              ) : null}

              {/* Active bar indicator */}
              {isActive && (
                <div
                  style={{
                    position: 'absolute',
                    left: '-1px',
                    top: '20%',
                    bottom: '20%',
                    width: '3px',
                    backgroundColor: '#38bdf8',
                    borderRadius: '0 3px 3px 0',
                  }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Nav Group */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
        <button
          onClick={() => alert('EcoPulse Telemetry Platform v3.4 // OneAquaHealth Track 2\nUrban Stream Health & Public Risk Intelligence System.')}
          title="System Documentation"
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '8px',
            backgroundColor: 'transparent',
            border: '1px solid #1e293b',
            color: '#64748b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <HelpCircle size={18} />
        </button>
      </div>
    </aside>
  );
};
