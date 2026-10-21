"""Build inherited public-API mocks with the current 120 runtime."""
import runpy
from pathlib import Path
runpy.run_path(str(Path(__file__).resolve().parent/"make-harness119.py"))
