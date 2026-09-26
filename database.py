"""
EcoPulse - In-Memory & SQLite Database Store (database.py)
Handles data persistence, initial seed data generation for 5 monitoring stations (ST-01 to ST-05),
24-hour time-series telemetry records, and One Health alert queue.
"""

from datetime import datetime, timedelta
import random
from typing import Dict, List, Optional
import sqlite3
import threading

from models import StationMetadata, StationTelemetry, AlertModel, BasinSummary
from engine import calculate_wqi_score, generate_one_health_insight


class EcoPulseDatabase:
    """
    Thread-safe database manager for EcoPulse stations, time-series telemetry, and alerts.
    """
    def __init__(self):
        self._lock = threading.Lock()
        self.stations: Dict[str, StationMetadata] = {}
        self.telemetry_store: List[StationTelemetry] = []
        self.alerts_store: List[AlertModel] = []

        # Seed initial system data
        self._seed_data()

    def _seed_data(self):
        """Pre-populates 5 stations (ST-01 to ST-05), 24-hour historical telemetry, and initial alerts."""
        now = datetime.utcnow()

        initial_stations_def = [
            {
                "station_id": "ST-01",
                "name": "Station 01 • Upper Basin Reach",
                "sector": "North Headwaters",
                "latitude": 47.6200,
                "longitude": -122.3490,
                "base_ph": 7.4,
                "base_do": 8.5,
                "base_turb": 4.2,
                "base_temp": 14.2,
            },
            {
                "station_id": "ST-02",
                "name": "Station 02 • Industrial Canal",
                "sector": "Mid-Urban Industrial",
                "latitude": 47.6150,
                "longitude": -122.3400,
                "base_ph": 6.7,
                "base_do": 5.8,
                "base_turb": 28.4,
                "base_temp": 19.1,
            },
            {
                "station_id": "ST-03",
                "name": "Station 03 • Lower Estuary",
                "sector": "South Wetland Estuary",
                "latitude": 47.6062,
                "longitude": -122.3321,
                "base_ph": 6.1,
                "base_do": 4.1,
                "base_turb": 46.8,
                "base_temp": 22.4,
            },
            {
                "station_id": "ST-04",
                "name": "Station 04 • Commercial Harbor",
                "sector": "Central Waterfront",
                "latitude": 47.6010,
                "longitude": -122.3380,
                "base_ph": 7.6,
                "base_do": 7.9,
                "base_turb": 9.1,
                "base_temp": 16.5,
            },
            {
                "station_id": "ST-05",
                "name": "Station 05 • Suburban Outlet",
                "sector": "East Tributary",
                "latitude": 47.6120,
                "longitude": -122.3210,
                "base_ph": 7.2,
                "base_do": 8.1,
                "base_turb": 6.5,
                "base_temp": 15.8,
            }
        ]

        # Generate 24 hours of hourly telemetry data per station
        for st in initial_stations_def:
            st_id = st["station_id"]
            latest_tel = None

            for i in range(24, -1, -1):
                timestamp = now - timedelta(hours=i)
                # Introduce slight natural variation
                variance_ph = round(random.uniform(-0.15, 0.15), 2)
                variance_do = round(random.uniform(-0.3, 0.3), 2)
                variance_turb = round(random.uniform(-1.5, 1.5), 1)
                variance_temp = round(random.uniform(-0.4, 0.4), 1)

                ph_val = max(5.0, min(9.5, round(st["base_ph"] + variance_ph, 2)))
                do_val = max(2.0, min(12.0, round(st["base_do"] + variance_do, 2)))
                turb_val = max(1.0, min(100.0, round(st["base_turb"] + variance_turb, 1)))
                temp_val = max(5.0, min(35.0, round(st["base_temp"] + variance_temp, 1)))

                tel = StationTelemetry(
                    station_id=st_id,
                    timestamp=timestamp,
                    ph=ph_val,
                    dissolved_oxygen=do_val,
                    turbidity=turb_val,
                    water_temperature=temp_val
                )
                self.telemetry_store.append(tel)
                latest_tel = tel

            # Compute current score and risk status for latest telemetry
            health_score = calculate_wqi_score(latest_tel)
            insight, risk_status, triggers, action = generate_one_health_insight(st_id, latest_tel, health_score)

            metadata = StationMetadata(
                station_id=st_id,
                name=st["name"],
                sector=st["sector"],
                latitude=st["latitude"],
                longitude=st["longitude"],
                risk_status=risk_status,
                health_score=health_score,
                latest_telemetry=latest_tel
            )
            self.stations[st_id] = metadata

            # Generate initial alert if station is in CRITICAL or CAUTION state
            if risk_status in ["CRITICAL", "CAUTION"]:
                severity = "critical" if risk_status == "CRITICAL" else "caution"
                alert = AlertModel(
                    alert_id=f"ALT-SEED-{st_id}",
                    station_id=st_id,
                    severity=severity,
                    message=insight,
                    timestamp=now - timedelta(minutes=random.randint(10, 180)),
                    resolved=False,
                    risk_triggers=triggers,
                    action_required=action
                )
                self.alerts_store.append(alert)

    # ------------------ Public DB Operations ------------------ #

    def get_all_stations(self) -> List[StationMetadata]:
        with self._lock:
            return list(self.stations.values())

    def get_station_by_id(self, station_id: str) -> Optional[StationMetadata]:
        with self._lock:
            return self.stations.get(station_id)

    def get_station_telemetry(self, station_id: str, limit_hours: int = 24) -> List[StationTelemetry]:
        with self._lock:
            cutoff = datetime.utcnow() - timedelta(hours=limit_hours)
            records = [
                t for t in self.telemetry_store
                if t.station_id == station_id and t.timestamp >= cutoff
            ]
            records.sort(key=lambda x: x.timestamp)
            return records

    def add_telemetry(self, telemetry: StationTelemetry) -> StationTelemetry:
        with self._lock:
            self.telemetry_store.append(telemetry)

            # Update station metadata
            st_id = telemetry.station_id
            if st_id in self.stations:
                score = calculate_wqi_score(telemetry)
                insight, risk_status, triggers, action = generate_one_health_insight(st_id, telemetry, score)

                st_meta = self.stations[st_id]
                st_meta.health_score = score
                st_meta.risk_status = risk_status
                st_meta.latest_telemetry = telemetry

            return telemetry

    def get_all_alerts(self, severity: Optional[str] = None) -> List[AlertModel]:
        with self._lock:
            if severity:
                target_sev = severity.lower().strip()
                return [a for a in self.alerts_store if a.severity.lower() == target_sev]
            return list(reversed(self.alerts_store))

    def add_alert(self, alert: AlertModel) -> AlertModel:
        with self._lock:
            self.alerts_store.insert(0, alert)
            return alert

    def get_basin_summary(self) -> BasinSummary:
        with self._lock:
            all_st = list(self.stations.values())
            if not all_st:
                overall = 100.0
            else:
                overall = round(sum(s.health_score for s in all_st) / len(all_st), 1)

            active_alerts = [a for a in self.alerts_store if not a.resolved]
            crit_count = sum(1 for a in active_alerts if a.severity == "critical")
            caut_count = sum(1 for a in active_alerts if a.severity == "caution")

            return BasinSummary(
                overall_score=overall,
                trend_7d_percent=2.4,  # positive 7-day basin recovery trend
                active_alerts_count=len(active_alerts),
                critical_alerts_count=crit_count,
                caution_alerts_count=caut_count,
                total_stations=len(all_st),
                timestamp=datetime.utcnow()
            )


# Global Database Singleton
db = EcoPulseDatabase()
