import datetime
from datetime import timezone

def utc_now() -> datetime.datetime:
    """
    Returns current timezone-aware datetime in UTC.
    Compatible with Python 3.11, 3.12, 3.13+.
    """
    return datetime.datetime.now(timezone.utc)

def format_iso_z(dt: datetime.datetime | None = None) -> str | None:
    """
    Formats a datetime object into an ISO 8601 UTC string (e.g. '2026-08-24T12:00:00Z').
    """
    if dt is None:
        return None
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.isoformat().replace('+00:00', 'Z')
