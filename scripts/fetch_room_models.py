#!/usr/bin/env python3
"""Download the five real scanned hotel-room GLB models from Sketchfab (CC-BY).

Requires a free Sketchfab API token: sketchfab.com/settings/password -> API tokens.
  SKETCHFAB_TOKEN=xxxx python3 scripts/fetch_room_models.py
Outputs to client/public/models/{type}.glb
"""

import json
import os
import sys
import urllib.request
from typing import Optional

API = "https://api.sketchfab.com/v3/models"

MODELS = {
    "standard": "270ecfcb388040d4ba11df340589ebb6",  # Hotel-room (deankagura)
    "deluxe": "ba15fd0276a943e28ba300f27b2b53c5",    # Room Bellis Deluxe (shakiller)
    "suite": "a956859027cc4545b33c901023eec548",     # Vintage hotel room photoscan (RobenSikk_og)
    "garden": "ea25adc53f514eaba9dd043f5eac9c77",    # Cozy Modern Bedroom
    "ocean": "4f3db3cb57bd4bce886f7b9a13273a2f",     # Minimalistic Modern Bedroom
}

OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "client", "public", "models")


def http_json(url: str, token: Optional[str] = None):
    req = urllib.request.Request(url)
    if token:
        req.add_header("Authorization", f"Token {token}")
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.load(r)


def main():
    token = os.environ.get("SKETCHFAB_TOKEN")
    if not token:
        print("Set SKETCHFAB_TOKEN=<your free Sketchfab API token> first")
        sys.exit(1)

    os.makedirs(OUT_DIR, exist_ok=True)
    for room_type, uid in MODELS.items():
        out = os.path.join(OUT_DIR, f"{room_type}.glb")
        print(f"[{room_type}] {uid}")
        dl = http_json(f"{API}/{uid}/download", token)
        glb = dl.get("glb", {}).get("url")
        if not glb:
            print(f"  ! no glb available (keys: {list(dl.keys())}) — skipping")
            continue
        print(f"  downloading glb...")
        with urllib.request.urlopen(glb, timeout=300) as r, open(out, "wb") as f:
            n = 0
            while True:
                chunk = r.read(1 << 20)
                if not chunk:
                    break
                f.write(chunk)
                n += len(chunk)
        print(f"  saved {out} ({n/1e6:.1f} MB)")


if __name__ == "__main__":
    main()
