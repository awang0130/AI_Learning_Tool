import json
import hashlib
from pathlib import Path
from datetime import datetime, timedelta

CACHE_DIR = Path(__file__).resolve().parent.parent / "cache"
CACHE_DIR.mkdir(exist_ok=True)

def make_cache_key(prefix: str, payload: dict) -> str:
    raw = json.dumps(payload, sort_keys=True).encode("utf-8")
    h = hashlib.sha256(raw).hexdigest()
    return f"{prefix}_{h}.json"

def cache_get(prefix: str, payload: dict, ttl_hours: int = 24):
    path = CACHE_DIR / make_cache_key(prefix, payload)
    if not path.exists():
        return None

    mtime = datetime.fromtimestamp(path.stat().st_mtime)
    if datetime.now() - mtime > timedelta(hours=ttl_hours):
        return None

    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return None

def cache_set(prefix: str, payload: dict, value: dict):
    path = CACHE_DIR / make_cache_key(prefix, payload)
    path.write_text(json.dumps(value, indent=2), encoding="utf-8")
