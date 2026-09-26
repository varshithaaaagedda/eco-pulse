import React from 'react';
import { ShieldCheck, TrendingUp, TrendingDown } from 'lucide-react';
import { SPARKLINE_GLOBAL_HISTORY } from '../data/mockData';

interface HealthScoreCardProps {
  isSimulating: boolean;
  overallScore: number;
}

export const HealthScoreCard: React.FC<HealthScoreCardProps> = ({
  isSimulating,
  overallScore,
}) => {
  const currentScore = isSimulating ? 52 : overallScore || 71;

  // Calculate SVG circular stroke offset
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (currentScore / 100) * circumference;

  let scoreColor = '#38bdf8';
  let scoreStatus = 'OPTIMAL ECO-BALANCE';
  if (currentScore < 60) {
    scoreColor = '#f43f5e';
    scoreStatus = 'CRITICAL DEGRADATION';
  } else if (currentScore < 75) {
    scoreColor = '#fbbf24';
    scoreStatus = 'MODERATE CAUTION';
  }

  return (
    <div className="gis-panel" style={{ padding: '16px 18px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={18} style={{ color: scoreColor }} />
          <h2 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#f8fafc', letterSpacing: '-0.2px' }}>
            Global Basin Health Score
          </h2>
        </div>

        <div
          style={{
            fontSize: '0.65rem',
            fontFamily: 'var(--font-mono)',
            fontWeight: 700,
            color: scoreColor,
            backgroundColor: `${scoreColor}15`,
            border: `1px solid ${scoreColor}40`,
            padding: '2px 7px',
            borderRadius: '4px',
          }}
        >
          {scoreStatus}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        {/* LEFT: CIRCULAR PROGRESS RING (71/100 INDEX) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ position: 'relative', width: '84px', height: '84px', flexShrink: 0 }}>
            <svg width="84" height="84" viewBox="0 0 80 80" style={{ transform: 'rotate(-90deg)' }}>
              {/* Background Track Circle */}
              <circle
                cx="40"
                cy="40"
                r={radius}
                stroke="#1e293b"
                strokeWidth="7"
                fill="transparent"
              />
              {/* Progress Arc Circle */}
              <circle
                cx="40"
                cy="40"
                r={radius}
                stroke={scoreColor}
                strokeWidth="7"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                style={{
                  transition: 'stroke-dashoffset 0.6s ease-in-out, stroke 0.3s ease',
                }}
              />
            </svg>

            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span
                style={{
                  fontSize: '1.4rem',
                  fontWeight: 800,
                  color: '#f8fafc',
                  lineHeight: 1,
                  fontFamily: 'var(--font-mono)',
                }}
              >
                {currentScore}
              </span>
              <span style={{ fontSize: '0.58rem', color: '#64748b', marginTop: '1px' }}>
                / 100 INDEX
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT: SMOOTH 7-DAY SPARKLINE TREND CHART LABELED "+3.8% BASIN RECOVERY" */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 500 }}>
              7-Day Basin Health Trend
            </span>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.72rem',
                fontFamily: 'var(--font-mono)',
                color: isSimulating ? '#f43f5e' : '#38bdf8',
                fontWeight: 700,
              }}
            >
              {isSimulating ? <TrendingDown size={14} /> : <TrendingUp size={14} />}
              <span>{isSimulating ? '-24.0% Surge Impact' : '+3.8% Basin Recovery'}</span>
            </div>
          </div>

          {/* Smooth Professional Sparkline SVG */}
          <div
            style={{
              height: '46px',
              width: '100%',
              backgroundColor: '#0b131a',
              borderRadius: '6px',
              padding: '4px 6px',
              border: '1px solid #1e293b',
            }}
          >
            <svg width="100%" height="100%" viewBox="0 0 160 38" preserveAspectRatio="none">
              <defs>
                <linearGradient id="gisSparkGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={scoreColor} stopOpacity="0.35" />
                  <stop offset="100%" stopColor={scoreColor} stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {(() => {
                const points = isSimulating ? [79, 78, 74, 68, 60, 54, 52] : SPARKLINE_GLOBAL_HISTORY;
                const min = 40;
                const max = 90;
                const widthStep = 160 / (points.length - 1);

                const coords = points.map((val, i) => {
                  const x = i * widthStep;
                  const y = 34 - ((val - min) / (max - min)) * 30;
                  return { x, y };
                });

                const pathD = coords.reduce(
                  (acc, pt, i) => (i === 0 ? `M ${pt.x},${pt.y}` : `${acc} L ${pt.x},${pt.y}`),
                  ''
                );
                const areaD = `${pathD} L 160,38 L 0,38 Z`;

                return (
                  <>
                    <path d={areaD} fill="url(#gisSparkGrad)" />
                    <path d={pathD} fill="none" stroke={scoreColor} strokeWidth="2" strokeLinecap="round" />
                    {coords.map((pt, idx) => (
                      <circle key={idx} cx={pt.x} cy={pt.y} r="2" fill={scoreColor} />
                    ))}
                  </>
                );
              })()}
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};
