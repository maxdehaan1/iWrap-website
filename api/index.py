"""Vercel-ingang voor de API. Alles onder /api komt hier binnen (zie de
rewrite in vercel.json) en gaat door naar backend/app.py."""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from backend.app import app  # noqa: E402,F401
