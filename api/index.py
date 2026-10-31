import os
import sys

# Ensure repository root is on sys.path so backend package can be imported
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(current_dir)
if project_root not in sys.path:
    sys.path.insert(0, project_root)

from backend.app import app

# Vercel serverless Python looks for WSGI 'app'
__all__ = ['app']

