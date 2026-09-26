"""
EcoPulse - Data Models Alias Module (schemas.py)
Re-exports Pydantic schemas from models.py for module flexibility.
"""

from models import (
    StationTelemetry,
    StationMetadata,
    AlertModel,
    BasinSummary,
    TelemetryIngestResponse,
    SurgeSimulationResponse
)

__all__ = [
    "StationTelemetry",
    "StationMetadata",
    "AlertModel",
    "BasinSummary",
    "TelemetryIngestResponse",
    "SurgeSimulationResponse"
]
