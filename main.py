"""
EcoPulse - Urban Stream Health Platform (main.py)
High-performance FastAPI Backend handling data ingestion, automated risk scoring,
time-series telemetry storage, and One Health insight generation.
"""

from datetime import datetime
import uuid
from typing import List, Optional

from fastapi import FastAPI, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from models import (
    StationTelemetry,
    StationMetadata,
    AlertModel,
    BasinSummary,
    TelemetryIngestResponse,
    SurgeSimulationResponse
)
from database import db
from engine import calculate_wqi_score, generate_one_health_insight

app = FastAPI(
    title="EcoPulse OneAquaHealth Platform API",
    description="High-performance backend for urban stream health telemetry, automated WQI risk scoring, and One Health insight generation.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS middleware for seamless frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for local dev (http://localhost:5173, http://localhost:3000, etc.)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", tags=["Health"])
def root_status():
    """
    Root API health check and platform welcome status.
    """
    return {
        "platform": "EcoPulse OneAquaHealth Track 2",
        "status": "OPERATIONAL",
        "timestamp": datetime.utcnow().isoformat(),
        "documentation": "/docs",
        "monitored_stations": len(db.get_all_stations())
    }


@app.get("/api/basin/summary", response_model=BasinSummary, tags=["Basin Intelligence"])
def get_basin_summary():
    """
    Returns the global basin health summary, including the aggregate average score
    across all monitoring stations, 7-day trend percentage, and active alert counts.
    """
    return db.get_basin_summary()


@app.get("/api/stations", response_model=List[StationMetadata], tags=["Monitoring Stations"])
def get_stations():
    """
    Returns a list of all monitoring stations with their latest coordinates, current risk status,
    calculated WQI health scores, and latest telemetry snapshots (ST-01 to ST-05).
    """
    return db.get_all_stations()


@app.get("/api/stations/{station_id}", response_model=StationMetadata, tags=["Monitoring Stations"])
def get_station_by_id(station_id: str):
    """
    Returns metadata and current operational status for a specific station.
    """
    station = db.get_station_by_id(station_id.upper())
    if not station:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Station '{station_id}' not found in EcoPulse database."
        )
    return station


@app.get("/api/stations/{station_id}/telemetry", response_model=List[StationTelemetry], tags=["Telemetry Time-Series"])
def get_station_telemetry(
    station_id: str,
    hours: int = Query(24, ge=1, le=168, description="Historical hours window to retrieve (1-168)")
):
    """
    Returns historical time-series telemetry data for a specific station (defaults to 24 hours).
    Used for render bottom deep-dive analytics charts.
    """
    st_id = station_id.upper()
    station = db.get_station_by_id(st_id)
    if not station:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Station '{station_id}' not found."
        )
    return db.get_station_telemetry(st_id, limit_hours=hours)


@app.get("/api/alerts", response_model=List[AlertModel], tags=["Alert Feed"])
def get_alerts(
    severity: Optional[str] = Query(None, description="Filter alerts by severity: 'critical' or 'caution'")
):
    """
    Returns the live stack of automated One Health ecological alerts.
    Filterable by severity query parameter.
    """
    return db.get_all_alerts(severity=severity)


@app.post("/api/telemetry/ingest", response_model=TelemetryIngestResponse, status_code=status.HTTP_201_CREATED, tags=["Telemetry Ingestion"])
def ingest_telemetry(telemetry: StationTelemetry):
    """
    Endpoint to receive new citizen-science or IoT sensor telemetry uploads,
    instantly evaluate the WQI risk-scoring engine, update station state,
    and generate/push dynamic One Health alerts if anomalies or thresholds are breached.
    """
    st_id = telemetry.station_id.upper()
    station = db.get_station_by_id(st_id)
    if not station:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Station '{st_id}' does not exist. Please register the station metadata first."
        )

    # 1. Compute WQI score
    score = calculate_wqi_score(telemetry)

    # 2. Generate One Health risk insight
    insight, risk_status, triggers, action = generate_one_health_insight(st_id, telemetry, score)

    # 3. Store telemetry record & update station status
    saved_telemetry = db.add_telemetry(telemetry)

    # 4. Generate alert if critical or caution status triggered
    alert_created = None
    if risk_status in ["CRITICAL", "CAUTION"]:
        severity = "critical" if risk_status == "CRITICAL" else "caution"
        alert_created = AlertModel(
            alert_id=f"ALT-INGEST-{uuid.uuid4().hex[:6].upper()}",
            station_id=st_id,
            severity=severity,
            message=insight,
            timestamp=datetime.utcnow(),
            resolved=False,
            risk_triggers=triggers,
            action_required=action
        )
        db.add_alert(alert_created)

    return TelemetryIngestResponse(
        status="SUCCESS",
        telemetry=saved_telemetry,
        wqi_score=score,
        risk_status=risk_status,
        insight=insight,
        alert_generated=alert_created
    )


@app.post("/api/simulation/trigger-surge", response_model=SurgeSimulationResponse, tags=["Simulation Engine"])
def trigger_pollution_surge(station_id: str = "ST-03"):
    """
    A mock simulation endpoint that artificially injects a high-pollution anomaly into Station 03 (or requested station)
    to test real-time alert streaming and dynamic risk scoring when the frontend simulation button is clicked.
    """
    target_id = station_id.upper()
    station = db.get_station_by_id(target_id)
    if not station:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Station '{target_id}' not found for surge simulation."
        )

    # Artificially create a high-turbidity & low-DO pollution surge anomaly
    surge_telemetry = StationTelemetry(
        station_id=target_id,
        timestamp=datetime.utcnow(),
        ph=5.8,
        dissolved_oxygen=3.4,
        turbidity=48.7,
        water_temperature=24.2
    )

    # Run intelligence engine
    wqi_score = calculate_wqi_score(surge_telemetry)
    insight = "High turbidity detected, 40% spike. Downstream agricultural runoff warning. IRRIGATION ADVISORY REQUIRED"
    risk_status = "CRITICAL"
    triggers = ["Turbidity > 48.7 NTU", "pH 5.8 Acidic Shift", "Hypoxia Risk (DO 3.4 mg/L)"]
    action = "Issue Downstream Advisory & Deploy Autonomous Hydro-Drone"

    # Save to database
    db.add_telemetry(surge_telemetry)

    # Generate critical simulation alert
    sim_alert = AlertModel(
        alert_id=f"ALT-SIM-{uuid.uuid4().hex[:4].upper()}",
        station_id=target_id,
        severity="critical",
        message=f"SIMULATED CRITICAL SURGE: {insight}",
        timestamp=datetime.utcnow(),
        resolved=False,
        risk_triggers=triggers,
        action_required=action
    )
    db.add_alert(sim_alert)

    return SurgeSimulationResponse(
        status="SIMULATION_ACTIVE",
        station_id=target_id,
        injected_metrics=surge_telemetry,
        new_wqi_score=wqi_score,
        new_risk_status=risk_status,
        generated_alert=sim_alert,
        insight=insight
    )


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
