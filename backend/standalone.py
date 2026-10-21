from __future__ import annotations

import os
import sys
from pathlib import Path

if getattr(sys, "frozen", False):
    bundle_root = Path(getattr(sys, "_MEIPASS", Path(sys.executable).parent))
else:
    bundle_root = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(bundle_root))
sys.path.insert(0, str(bundle_root / "OpenCutStudio"))

import uvicorn  # noqa: E402

if __name__ == "__main__":
    port = int(os.getenv("OPENCUT_PORT", "18765"))
    uvicorn.run("backend.app:app", host="127.0.0.1", port=port, log_level="warning", access_log=False)
