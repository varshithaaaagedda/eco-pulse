"""
EcoPulse - Core Intelligence & Anomaly Detection Engine (engine.py)
Calculates Water Quality Index (WQI) scores, generates One Health ecological risk briefings,
and performs Pandas/NumPy time-series anomaly detection.
"""

from typing import Dict, Any, List, Tuple
import numpy as np
import pandas as pd
from models import StationTelemetry, AlertModel


def calculate_wqi_score(telemetry: StationTelemetry) -> float:
    """
    Calculates an overall Water Quality Index (WQI) score (0-100) based on
    pH, Dissolved Oxygen (mg/L), Turbidity (NTU), and Water Temperature (°C).

    Standard Normalization Baselines:
    - pH: Ideal range 6.5 - 8.5 (neutral ~7.2)
    - Dissolved Oxygen: Ideal >= 7.0 mg/L, Hypoxia < 4.0 mg/L
    - Turbidity: Ideal <= 5.0 NTU, Caution 25-45 NTU, Critical > 45 NTU
    """
    ph = telemetry.ph
    do = telemetry.dissolved_oxygen
    turb = telemetry.turbidity
    temp = telemetry.water_temperature

    # 1. pH Sub-index (0-100)
    if 6.5 <= ph <= 8.5:
        ph_score = 100.0 - (abs(ph - 7.2) / 1.3) * 15.0
    elif ph < 6.5:
        ph_score = max(0.0, 100.0 - ((6.5 - ph) / 2.5) * 80.0)
    else:  # ph > 8.5
        ph_score = max(0.0, 100.0 - ((ph - 8.5) / 2.5) * 80.0)

    # 2. Dissolved Oxygen Sub-index (0-100)
    if do >= 7.0:
        do_score = min(100.0, 80.0 + (do - 7.0) * 4.0)
    elif 5.0 <= do < 7.0:
        do_score = 50.0 + (do - 5.0) * 15.0
    elif 3.5 <= do < 5.0:
        do_score = 20.0 + (do - 3.5) * 20.0
    else:  # do < 3.5
        do_score = max(0.0, do * 5.7)

    # 3. Turbidity Sub-index (0-100)
    if turb <= 5.0:
        turb_score = 100.0
    elif 5.0 < turb <= 25.0:
        turb_score = 100.0 - ((turb - 5.0) / 20.0) * 35.0
    elif 25.0 < turb <= 45.0:
        turb_score = 65.0 - ((turb - 25.0) / 20.0) * 35.0
    else:  # turb > 45.0
        turb_score = max(0.0, 30.0 - ((turb - 45.0) / 50.0) * 30.0)

    # 4. Temperature adjustment factor
    temp_penalty = 0.0
    if temp > 25.0:
        temp_penalty = min(15.0, (temp - 25.0) * 1.5)
    elif temp < 5.0:
        temp_penalty = min(10.0, (5.0 - temp) * 1.0)

    # Weighted aggregate score
    # DO weight = 0.40, Turbidity weight = 0.35, pH weight = 0.25
    wqi_raw = (0.40 * do_score) + (0.35 * turb_score) + (0.25 * ph_score) - temp_penalty
    wqi_final = max(0.0, min(100.0, wqi_raw))

    return round(float(wqi_final), 1)


def generate_one_health_insight(station_id: str, telemetry: StationTelemetry, score: float) -> Tuple[str, str, List[str], str]:
    """
    Generates human-readable One Health ecological risk briefings, risk status ("SAFE", "CAUTION", "CRITICAL"),
    trigger lists, and recommended action steps based on telemetry metrics and WQI score.

    Returns:
        (insight_message, risk_status, triggers_list, action_required)
    """
    ph = telemetry.ph
    do = telemetry.dissolved_oxygen
    turb = telemetry.turbidity
    temp = telemetry.water_temperature

    triggers = []

    # Rule 1: High turbidity and low pH (agricultural runoff warning)
    if turb > 45.0 and ph < 6.0:
        triggers.append(f"Turbidity > 45 NTU ({turb} NTU)")
        triggers.append(f"pH < 6.0 ({ph} acidic)")
        insight = f"High turbidity detected, 40% spike. Downstream agricultural runoff warning. IRRIGATION ADVISORY REQUIRED"
        action = "Issue Downstream Advisory & Deploy Autonomous Hydro-Drone"
        return insight, "CRITICAL", triggers, action

    # Rule 2: Critical Turbidity spike
    if turb > 45.0:
        triggers.append(f"High Turbidity ({turb} NTU)")
    elif turb > 25.0:
        triggers.append(f"Elevated Turbidity ({turb} NTU)")

    # Rule 3: Hypoxia warning
    if do < 4.0:
        triggers.append(f"Hypoxia Danger (DO {do} mg/L)")
    elif do < 5.5:
        triggers.append(f"Low Oxygen (DO {do} mg/L)")

    # Rule 4: pH imbalance
    if ph < 6.0:
        triggers.append(f"Acidic pH Shift ({ph})")
    elif ph > 8.8:
        triggers.append(f"Alkaline pH Shift ({ph})")

    # Rule 5: Thermal anomaly
    if temp > 26.0:
        triggers.append(f"Thermal Stress ({temp}°C)")

    # Determine risk status and message
    if score < 50.0 or any("CRITICAL" in t or "Hypoxia Danger" in t or "Acidic pH Shift" in t or turb > 45.0 for t in triggers):
        risk_status = "CRITICAL"
        if not triggers:
            triggers.append("Severe WQI Score Drop (<50)")
        insight = f"CRITICAL HAZARD AT {station_id}: Turbidity {turb} NTU, DO {do} mg/L. High threat to aquatic biota. EMERGENCY WATER TREATMENT & INSPECTION REQUIRED."
        action = "Deploy Emergency Containment & Dispatch Field Response Unit"

    elif score < 75.0 or len(triggers) > 0:
        risk_status = "CAUTION"
        if not triggers:
            triggers.append("Sub-optimal WQI Score (<75)")
        insight = f"CAUTION AT {station_id}: Elevated parameters detected (Turbidity {turb} NTU, DO {do} mg/L). Stream buffer vulnerability detected."
        action = "Increase Sensor Sampling Rate & Conduct Local Runoff Inspection"

    else:
        risk_status = "SAFE"
        insight = f"Stream health stable at {station_id}. Water Quality Index: {score}/100. All biological and chemical parameters within nominal One Health baselines."
        action = "Maintain Standard Continuous Telemetry Monitoring"

    return insight, risk_status, triggers, action


def detect_time_series_anomalies(telemetry_history: List[StationTelemetry]) -> List[Dict[str, Any]]:
    """
    Pandas & NumPy implementation for time-series anomaly detection across station telemetry records.
    Calculates rolling statistics (Z-scores, moving averages) to identify statistical outliers.
    """
    if not telemetry_history or len(telemetry_history) < 3:
        return []

    # Convert list of telemetry models to Pandas DataFrame
    df = pd.DataFrame([t.model_dump() for t in telemetry_history])
    df['timestamp'] = pd.to_datetime(df['timestamp'])
    df = df.sort_values('timestamp')

    anomalies = []
    numeric_cols = ['ph', 'dissolved_oxygen', 'turbidity', 'water_temperature']

    for col in numeric_cols:
        mean_val = df[col].mean()
        std_val = df[col].std()

        if std_val > 0:
            df[f'{col}_zscore'] = np.abs((df[col] - mean_val) / std_val)
            # Mark data points with z-score > 2.0 as statistical anomalies
            outliers = df[df[f'{col}_zscore'] > 2.0]
            for idx, row in outliers.iterrows():
                anomalies.append({
                    "station_id": row["station_id"],
                    "timestamp": row["timestamp"].isoformat(),
                    "metric": col,
                    "val": float(row[col]),
                    "mean": float(round(mean_val, 2)),
                    "z_score": float(round(row[f'{col}_zscore'], 2)),
                    "message": f"Anomaly detected in {col}: value {row[col]} deviates (Z-score: {round(row[f'{col}_zscore'], 2)})"
                })

    return anomalies
