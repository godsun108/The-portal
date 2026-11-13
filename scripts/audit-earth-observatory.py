#!/usr/bin/env python3
"""Audit Portal Earth Observatory pages and the official camera destinations."""
import json
import re
import urllib.error
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

BASE = "https://godsun108.github.io/The-portal"
PAGES = {
    "Earth Observatory": f"{BASE}/earth-observatory/",
    "Live Stream": f"{BASE}/live-stream/",
}
SOURCE = Path("earth-observatory/index.html").read_text(encoding="utf-8")
match = re.search(r"const cameras=\{(.*?)\n\};\nconst title", SOURCE, re.S)
if not match:
    raise SystemExit("Could not locate the Earth Observatory camera registry")
camera_rows = re.findall(r'([a-zA-Z0-9_]+):\{.*?title:"([^"]+)".*?url:"(https?://[^"]+)"', match.group(1), re.S)
if not camera_rows:
    raise SystemExit("No camera records were parsed from the Observatory registry")

def probe(url):
    request = urllib.request.Request(url, headers={"User-Agent": "Portal-Earth-Observatory-Monitor/1.0"})
    try:
        with urllib.request.urlopen(request, timeout=25) as response:
            return {"status": response.status, "final_url": response.geturl(), "ok": 200 <= response.status < 400}
    except urllib.error.HTTPError as exc:
        return {"status": exc.code, "final_url": exc.geturl(), "ok": False, "error": str(exc)}
    except Exception as exc:
        return {"status": None, "final_url": None, "ok": False, "error": f"{type(exc).__name__}: {exc}"}

results = {"checked_at_utc": datetime.now(timezone.utc).isoformat(), "pages": [], "cameras": []}
for name, url in PAGES.items():
    results["pages"].append({"name": name, "url": url, **probe(url)})
for key, title, url in camera_rows:
    results["cameras"].append({"id": key, "title": title, "url": url, **probe(url)})

lines = [
    "# Earth Observatory weekly health audit",
    "",
    f"Checked: {results['checked_at_utc']}",
    "",
    "## Portal pages",
]
for row in results["pages"]:
    state = "OK" if row["ok"] else "CHECK"
    lines.append(f"- [{state}] [{row['name']}]({row['url']}) — HTTP {row['status'] or 'unavailable'}")
lines += ["", "## Camera provider destinations"]
for row in results["cameras"]:
    state = "REACHABLE" if row["ok"] else "CHECK"
    lines.append(f"- [{state}] **{row['title']}** — [{row['url']}]({row['url']}) — HTTP {row['status'] or 'unavailable'}")
lines += [
    "",
    "> A reachable provider page does not prove that its camera is currently broadcasting. Feed status may be scheduled, seasonal, offline, or changed by the provider.",
    "",
]
Path("earth-observatory-health.json").write_text(json.dumps(results, indent=2), encoding="utf-8")
Path("earth-observatory-health.md").write_text("\n".join(lines), encoding="utf-8")
summary = "\n".join(lines)
Path("earth-observatory-health-summary.txt").write_text(summary, encoding="utf-8")
print(summary)
# External outages are reported for triage, not treated as proof of permanent failure.
# A missing registry is a hard failure above; all HTTP results are preserved in the report.
