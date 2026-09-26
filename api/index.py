"""
Vercel Serverless Function Entrypoint for EcoPulse FastAPI Backend
"""

import os
import sys

# Ensure root directory is in sys.path so modules (main, models, engine, database) import cleanly
root_path = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if root_path not in sys.path:
    sys.path.insert(0, root_path)

from main import app

# Vercel handler export
handler = app
