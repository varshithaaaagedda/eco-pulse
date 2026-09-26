"""
EcoPulse FastAPI Backend - Comprehensive Unit & Integration Test Suite
"""

from fastapi.testclient import TestClient
from main import app
from engine import calculate_wqi_score, generate_one_health_insight
from models import StationTelemetry

client = TestClient(app)

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "OPERATIONAL"
    assert data["monitored_stations"] == 5
    print("  [OK] GET / root endpoint passed")

def test_wqi_calculation():
    # Healthy baseline
    tel_healthy = StationTelemetry(
        station_id="ST-01",
        ph=7.4,
        dissolved_oxygen=8.5,
        turbidity=4.2,
        water_temperature=14.2
    )
    score_healthy = calculate_wqi_score(tel_healthy)
    assert score_healthy >= 90.0

    # High turbidity + low DO anomaly
    tel_critical = StationTelemetry(
        station_id="ST-03",
        ph=5.8,
        dissolved_oxygen=3.4,
        turbidity=48.7,
        water_temperature=24.2
    )
    score_critical = calculate_wqi_score(tel_critical)
    assert score_critical < 50.0
    print("  [OK] WQI score normalization & calculation passed")

def test_one_health_insight_generation():
    tel = StationTelemetry(
        station_id="ST-03",
        ph=5.8,
        dissolved_oxygen=3.4,
        turbidity=48.7,
        water_temperature=24.2
    )
    insight, status, triggers, action = generate_one_health_insight("ST-03", tel, 38.5)
    assert status == "CRITICAL"
    assert "agricultural runoff warning" in insight or "High turbidity" in insight
    assert len(triggers) > 0
    print("  [OK] One Health briefing generator passed")

def test_get_basin_summary():
    response = client.get("/api/basin/summary")
    assert response.status_code == 200
    data = response.json()
    assert "overall_score" in data
    assert data["total_stations"] == 5
    assert "active_alerts_count" in data
    print("  [OK] GET /api/basin/summary passed")

def test_get_stations():
    response = client.get("/api/stations")
    assert response.status_code == 200
    stations = response.json()
    assert len(stations) == 5
    station_ids = [s["station_id"] for s in stations]
    assert "ST-01" in station_ids
    assert "ST-03" in station_ids
    print("  [OK] GET /api/stations passed")

def test_get_station_telemetry():
    response = client.get("/api/stations/ST-01/telemetry")
    assert response.status_code == 200
    records = response.json()
    assert len(records) > 0
    assert records[0]["station_id"] == "ST-01"
    print("  [OK] GET /api/stations/ST-01/telemetry passed")

def test_get_station_telemetry_404():
    response = client.get("/api/stations/INVALID-ID/telemetry")
    assert response.status_code == 404
    print("  [OK] 404 Handling for missing station ID passed")

def test_get_alerts():
    response = client.get("/api/alerts")
    assert response.status_code == 200
    alerts = response.json()
    assert isinstance(alerts, list)
    print("  [OK] GET /api/alerts passed")

def test_telemetry_ingestion():
    new_telemetry = {
        "station_id": "ST-01",
        "ph": 7.2,
        "dissolved_oxygen": 8.0,
        "turbidity": 5.0,
        "water_temperature": 15.0
    }
    response = client.post("/api/telemetry/ingest", json=new_telemetry)
    assert response.status_code == 201
    data = response.json()
    assert data["status"] == "SUCCESS"
    assert data["wqi_score"] >= 85.0
    assert data["risk_status"] == "SAFE"
    print("  [OK] POST /api/telemetry/ingest passed")

def test_trigger_surge_simulation():
    response = client.post("/api/simulation/trigger-surge?station_id=ST-03")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "SIMULATION_ACTIVE"
    assert data["station_id"] == "ST-03"
    assert data["new_risk_status"] == "CRITICAL"
    assert "generated_alert" in data
    print("  [OK] POST /api/simulation/trigger-surge passed")

if __name__ == "__main__":
    print("==================================================")
    print("EcoPulse FastAPI Backend - Executing Test Suite")
    print("==================================================")
    test_root_endpoint()
    test_wqi_calculation()
    test_one_health_insight_generation()
    test_get_basin_summary()
    test_get_stations()
    test_get_station_telemetry()
    test_get_station_telemetry_404()
    test_get_alerts()
    test_telemetry_ingestion()
    test_trigger_surge_simulation()
    print("==================================================")
    print("ALL TESTS PASSED SUCCESSFULLY! ALL ENDPOINTS OK")
    print("==================================================")
