import React, { useState, useEffect, useRef } from 'react';
import type { StationData, MapLayers } from '../types';
import { Compass, Waves, Radio, ZoomIn, ZoomOut, Maximize2, Layers as LayersIcon, MapPin, X } from 'lucide-react';

interface LivingMapProps {
  stations: StationData[];
  selectedStationId: string;
  onSelectStation: (id: string) => void;
  isSimulating: boolean;
  onDispatchClick: () => void;
}

export const LivingMap: React.FC<LivingMapProps> = ({
  stations,
  selectedStationId,
  onSelectStation,
  isSimulating,
  onDispatchClick,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [showPopup, setShowPopup] = useState<boolean>(true);

  const [layers, setLayers] = useState<MapLayers>({
    hexGrid: true,
    streamFlow: true,
    riskHeatmap: true,
    sensorNodes: true,
    dronePath: true,
  });

  const selectedStation = stations.find((s) => s.id === selectedStationId) || stations[0];

  const toggleLayer = (layerKey: keyof MapLayers) => {
    setLayers((prev) => ({ ...prev, [layerKey]: !prev[layerKey] }));
  };

  // Canvas background rendering for GIS Dark Matter Map style
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let time = 0;

    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (rect) {
        canvas.width = rect.width;
        canvas.height = rect.height;
      }
    };
    resize();
    window.addEventListener('resize', resize);

    const renderMapCanvas = () => {
      time += 0.02;
      const w = canvas.width;
      const h = canvas.height;

      // 1. Dark Vector Map Tile Base (#0b131a & #111b24)
      ctx.fillStyle = '#0b131a';
      ctx.fillRect(0, 0, w, h);

      // 2. Topographical Contour Lines (GIS Dark Matter Style)
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.45)';
      ctx.lineWidth = 1;
      for (let i = 1; i <= 6; i++) {
        ctx.beginPath();
        const rX = w * (0.2 + i * 0.12);
        const rY = h * (0.25 + (i % 3) * 0.15);
        ctx.ellipse(rX, rY, 180 * i * 0.4 * zoom, 110 * i * 0.4 * zoom, 0.2, 0, Math.PI * 2);
        ctx.stroke();
      }

      // 3. Coordinate Grid Lines
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.3)';
      ctx.setLineDash([2, 4]);
      const gridGap = 80 * zoom;
      for (let x = 0; x < w; x += gridGap) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += gridGap) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
      ctx.setLineDash([]);

      // 4. Tactical Hexagonal Grid Layer if enabled
      if (layers.hexGrid) {
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.05)';
        ctx.lineWidth = 1;
        const r = 26 * zoom;
        const hStep = r * Math.sqrt(3);
        const vStep = r * 1.5;

        for (let y = -vStep; y < h + vStep; y += vStep) {
          const row = Math.floor(y / vStep);
          const xOffset = (row % 2) * (hStep / 2);
          for (let x = -hStep; x < w + hStep; x += hStep) {
            ctx.beginPath();
            for (let i = 0; i < 6; i++) {
              const angle = (Math.PI / 3) * i;
              const hx = x + xOffset + r * Math.cos(angle);
              const hy = y + r * Math.sin(angle);
              if (i === 0) ctx.moveTo(hx, hy);
              else ctx.lineTo(hx, hy);
            }
            ctx.closePath();
            ctx.stroke();
          }
        }
      }

      // 5. River Vector Path Control Points
      const streamPoints = [
        { x: w * 0.12, y: h * 0.15 },
        { x: w * 0.28, y: h * 0.32 },
        { x: w * 0.44, y: h * 0.46 },
        { x: w * 0.68, y: h * 0.64 },
        { x: w * 0.88, y: h * 0.78 },
      ];

      // Render GIS Stream Hydrograph
      if (layers.streamFlow) {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(streamPoints[0].x, streamPoints[0].y);
        for (let i = 1; i < streamPoints.length; i++) {
          const xc = (streamPoints[i - 1].x + streamPoints[i].x) / 2;
          const yc = (streamPoints[i - 1].y + streamPoints[i].y) / 2;
          ctx.quadraticCurveTo(streamPoints[i - 1].x, streamPoints[i - 1].y, xc, yc);
        }
        ctx.lineTo(streamPoints[streamPoints.length - 1].x, streamPoints[streamPoints.length - 1].y);

        // Hydro casing glow
        ctx.strokeStyle = isSimulating ? 'rgba(244, 63, 94, 0.2)' : 'rgba(56, 189, 248, 0.18)';
        ctx.lineWidth = 28 * zoom;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Main hydro vector line
        ctx.strokeStyle = isSimulating ? 'rgba(244, 63, 94, 0.7)' : 'rgba(56, 189, 248, 0.65)';
        ctx.lineWidth = 10 * zoom;
        ctx.stroke();

        // GIS Hydro Core Line
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 2 * zoom;
        ctx.stroke();
        ctx.restore();

        // Velocity particles along stream
        const particleCount = 20;
        for (let i = 0; i < particleCount; i++) {
          const progress = ((time * 0.1 + i / particleCount) % 1);
          const pIdx = Math.min(
            Math.floor(progress * (streamPoints.length - 1)),
            streamPoints.length - 2
          );
          const segT = (progress * (streamPoints.length - 1)) % 1;
          const p1 = streamPoints[pIdx];
          const p2 = streamPoints[pIdx + 1];

          const px = p1.x + (p2.x - p1.x) * segT;
          const py = p1.y + (p2.y - p1.y) * segT;

          ctx.fillStyle = isSimulating ? '#f43f5e' : '#38bdf8';
          ctx.shadowColor = isSimulating ? '#f43f5e' : '#38bdf8';
          ctx.shadowBlur = 6;
          ctx.beginPath();
          ctx.arc(px, py, 2.5 * zoom, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 6. Thermal Risk Heatmap Layer
      if (layers.riskHeatmap) {
        stations.forEach((st) => {
          if (st.status === 'critical' || (isSimulating && st.id === 'ST-03')) {
            const hx = (st.coordinates.x / 100) * w;
            const hy = (st.coordinates.y / 100) * h;

            const radius = (55 + Math.sin(time * 2.5) * 12) * zoom;
            const hGlow = ctx.createRadialGradient(hx, hy, 4, hx, hy, radius);
            hGlow.addColorStop(0, 'rgba(244, 63, 94, 0.45)');
            hGlow.addColorStop(0.5, 'rgba(244, 63, 94, 0.15)');
            hGlow.addColorStop(1, 'rgba(244, 63, 94, 0)');

            ctx.fillStyle = hGlow;
            ctx.beginPath();
            ctx.arc(hx, hy, radius, 0, Math.PI * 2);
            ctx.fill();
          }
        });
      }

      // 7. Drone Patrol Path
      if (layers.dronePath) {
        const droneX = w * 0.44 + Math.cos(time * 0.6) * (w * 0.12);
        const droneY = h * 0.52 + Math.sin(time * 0.6) * (h * 0.08);

        ctx.save();
        ctx.strokeStyle = 'rgba(251, 191, 36, 0.4)';
        ctx.setLineDash([3, 3]);
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(w * 0.44, h * 0.52, w * 0.12, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#fbbf24';
        ctx.shadowColor = '#fbbf24';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(droneX, droneY, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animId = requestAnimationFrame(renderMapCanvas);
    };

    renderMapCanvas();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animId);
    };
  }, [layers, zoom, stations, isSimulating]);

  return (
    <div
      className="gis-panel"
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: '580px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* FLOATING MAP CONTROLS - TOP LEFT */}
      <div
        style={{
          position: 'absolute',
          top: 14,
          left: 16,
          zIndex: 20,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          flexWrap: 'wrap',
        }}
      >
        <div
          style={{
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            border: '1px solid #1e293b',
            padding: '5px 10px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <LayersIcon size={14} style={{ color: '#38bdf8' }} />
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#f8fafc', fontFamily: 'var(--font-mono)' }}>
            MAPBOX DARK // HYDRO TILE V4
          </span>
        </div>

        {/* Layer Toggles */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            border: '1px solid #1e293b',
            padding: '3px',
            borderRadius: '6px',
          }}
        >
          <button
            onClick={() => toggleLayer('hexGrid')}
            style={{
              backgroundColor: layers.hexGrid ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
              border: 'none',
              color: layers.hexGrid ? '#38bdf8' : '#64748b',
              fontSize: '0.68rem',
              fontWeight: 600,
              padding: '3px 8px',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Hex Grid
          </button>

          <button
            onClick={() => toggleLayer('streamFlow')}
            style={{
              backgroundColor: layers.streamFlow ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
              border: 'none',
              color: layers.streamFlow ? '#38bdf8' : '#64748b',
              fontSize: '0.68rem',
              fontWeight: 600,
              padding: '3px 8px',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Waves size={12} /> Flow Velocity
          </button>

          <button
            onClick={() => toggleLayer('riskHeatmap')}
            style={{
              backgroundColor: layers.riskHeatmap ? 'rgba(244, 63, 94, 0.18)' : 'transparent',
              border: 'none',
              color: layers.riskHeatmap ? '#f43f5e' : '#64748b',
              fontSize: '0.68rem',
              fontWeight: 600,
              padding: '3px 8px',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Radio size={12} /> Thermal Risk
          </button>
        </div>
      </div>

      {/* FLOATING ZOOM CONTROLS - TOP RIGHT */}
      <div
        style={{
          position: 'absolute',
          top: 14,
          right: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          zIndex: 20,
        }}
      >
        <button
          onClick={() => setZoom((z) => Math.min(z + 0.2, 1.8))}
          title="Zoom In"
          style={{
            width: '30px',
            height: '30px',
            borderRadius: '6px',
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            border: '1px solid #1e293b',
            color: '#f8fafc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <ZoomIn size={15} />
        </button>
        <button
          onClick={() => setZoom((z) => Math.max(z - 0.2, 0.8))}
          title="Zoom Out"
          style={{
            width: '30px',
            height: '30px',
            borderRadius: '6px',
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            border: '1px solid #1e293b',
            color: '#f8fafc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <ZoomOut size={15} />
        </button>
        <button
          onClick={() => setZoom(1)}
          title="Reset GIS Extent"
          style={{
            width: '30px',
            height: '30px',
            borderRadius: '6px',
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            border: '1px solid #1e293b',
            color: '#38bdf8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <Maximize2 size={14} />
        </button>
      </div>

      {/* CANVAS MAP RENDERER */}
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          cursor: 'grab',
        }}
      />

      {/* INTERACTIVE NODE PINS (ST-01 through ST-05) WITH STATUS PILLS & MINI HEALTH METERS */}
      {layers.sensorNodes &&
        stations.map((st) => {
          const isSelected = st.id === selectedStationId;
          const isCritical = st.status === 'critical' || (isSimulating && st.id === 'ST-03');
          const isCaution = st.status === 'caution' && !isCritical;

          let colorHex = '#38bdf8';
          let borderHex = 'rgba(56, 189, 248, 0.5)';
          if (isCritical) {
            colorHex = '#f43f5e';
            borderHex = 'rgba(244, 63, 94, 0.8)';
          } else if (isCaution) {
            colorHex = '#fbbf24';
            borderHex = 'rgba(251, 191, 36, 0.7)';
          }

          return (
            <div
              key={st.id}
              onClick={() => {
                onSelectStation(st.id);
                setShowPopup(true);
              }}
              style={{
                position: 'absolute',
                left: `${st.coordinates.x}%`,
                top: `${st.coordinates.y}%`,
                transform: 'translate(-50%, -50%)',
                cursor: 'pointer',
                zIndex: isSelected ? 30 : 25,
                transition: 'transform 0.2s ease',
              }}
            >
              {/* Critical pulsing ring */}
              {isCritical && (
                <div
                  className="status-dot-crimson"
                  style={{
                    position: 'absolute',
                    inset: -8,
                    borderRadius: '50%',
                    pointerEvents: 'none',
                    opacity: 0.6,
                  }}
                />
              )}

              {/* Node Marker Box */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#0f172a',
                  border: `1px solid ${borderHex}`,
                  padding: '3px 8px',
                  borderRadius: '16px',
                  boxShadow: `0 4px 12px rgba(0,0,0,0.5)`,
                  transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                }}
              >
                <div
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: colorHex,
                  }}
                />
                <span style={{ fontSize: '0.7rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#f8fafc' }}>
                  {st.id}
                </span>

                {/* Mini Health Meter Bar */}
                <div
                  style={{
                    width: '28px',
                    height: '4px',
                    backgroundColor: 'rgba(30, 41, 59, 0.8)',
                    borderRadius: '2px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${st.healthScore}%`,
                      height: '100%',
                      backgroundColor: colorHex,
                    }}
                  />
                </div>

                <span style={{ fontSize: '0.62rem', fontFamily: 'var(--font-mono)', color: colorHex, fontWeight: 700 }}>
                  {st.healthScore}
                </span>
              </div>
            </div>
          );
        })}

      {/* FLOATING SELECTED STATION POPUP CARD */}
      {showPopup && selectedStation && (
        <div
          style={{
            position: 'absolute',
            bottom: 20,
            right: 20,
            width: '280px',
            backgroundColor: 'rgba(15, 23, 42, 0.92)',
            backdropFilter: 'blur(12px)',
            border: `1px solid ${selectedStation.status === 'critical' ? '#f43f5e' : selectedStation.status === 'caution' ? '#fbbf24' : '#38bdf8'}`,
            borderRadius: '10px',
            padding: '12px 14px',
            zIndex: 35,
            boxShadow: '0 10px 25px rgba(0,0,0,0.6)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MapPin size={15} style={{ color: selectedStation.status === 'critical' ? '#f43f5e' : '#38bdf8' }} />
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#f8fafc' }}>{selectedStation.name}</div>
                <div style={{ fontSize: '0.65rem', color: '#64748b' }}>{selectedStation.location}</div>
              </div>
            </div>
            <button
              onClick={() => setShowPopup(false)}
              style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}
            >
              <X size={14} />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', marginBottom: '10px' }}>
            <div style={{ backgroundColor: '#0b131a', padding: '5px 6px', borderRadius: '6px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.6rem', color: '#64748b' }}>pH</div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#f8fafc' }}>
                {selectedStation.ph}
              </div>
            </div>

            <div style={{ backgroundColor: '#0b131a', padding: '5px 6px', borderRadius: '6px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.6rem', color: '#64748b' }}>D.O.</div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#f8fafc' }}>
                {selectedStation.doLevel}
              </div>
            </div>

            <div style={{ backgroundColor: '#0b131a', padding: '5px 6px', borderRadius: '6px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.6rem', color: '#64748b' }}>TURBIDITY</div>
              <div
                style={{
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  fontFamily: 'var(--font-mono)',
                  color: selectedStation.status === 'critical' ? '#f43f5e' : '#38bdf8',
                }}
              >
                {selectedStation.turbidity}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
            <span style={{ fontSize: '0.65rem', color: '#64748b' }}>Impact Radius: {selectedStation.impactRadiusKm} km</span>
            <button
              onClick={onDispatchClick}
              style={{
                backgroundColor: 'rgba(56, 189, 248, 0.12)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                color: '#38bdf8',
                fontSize: '0.68rem',
                fontWeight: 700,
                padding: '4px 8px',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Dispatch Sensor
            </button>
          </div>
        </div>
      )}

      {/* BOTTOM LEFT COMPASS & SCALE BAR */}
      <div
        style={{
          position: 'absolute',
          bottom: 16,
          left: 16,
          backgroundColor: 'rgba(15, 23, 42, 0.9)',
          border: '1px solid #1e293b',
          borderRadius: '8px',
          padding: '8px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          zIndex: 20,
        }}
      >
        <Compass size={20} style={{ color: '#38bdf8' }} />
        <div>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#f8fafc', fontFamily: 'var(--font-mono)' }}>
            47.6062° N, 122.3321° W
          </div>
          <div style={{ fontSize: '0.62rem', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
            Scale: 1:25,000 • Datum: WGS 84
          </div>
        </div>
      </div>
    </div>
  );
};
