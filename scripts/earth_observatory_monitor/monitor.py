#!/usr/bin/env python3
"""Weekly health check for the Portal Earth Observatory."""
import json
import re
import urllib.error
import urllib.request
from datetime import datetime, timezone

BASE = "https://godsun108.github.io/The-portal"
RAW = "https://raw.githubusercontent.com/godsun108/The-portal/main/earth-observatory/index.html"
PAGES = {
    "Earth Observatory": f"{BASE}/earth-observatory/",
    "Live Stream": f"{BASE}/live-stream/",
}
HEADERS = {"User-Agent": "Portal-Earth-Observatory-Monitor/1.0"}

def fetch(url):
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req, timeout=25) as response:
            body = response.read().decode("utf-8", "replace")
            return {"ok": 200 <= response.status < 400, "status": response.status,
                    "final_url": response.geturl(), "body": body}
    except urllib.error.HTTPError as exc:
        return {"ok": False, "status": exc.code, "final_url": exc.geturl(),
                "error": str(exc), "body": ""}
    except Exception as exc:
        return {"ok": False, "status": None, "final_url": None,
                "error": f"{type(exc).__name__}: {exc}", "body": ""}

source = fetch(RAW)
if not source["ok"]:
    raise SystemExit(f"Cannot read camera registry from GitHub: {source.get('error', source['status'])}")
match = re.search(r"const cameras=\\{(.*?)\\n\\};\\nconst title", source["body"], re.S)
if not match:
    raise SystemExit("Could not locate camera registry in earth-observatory/index.html")
cameras = re.findall(r'([a-zA-Z0-9_]+):\\{.*?title:"([^"]+)".*?url:"(https?://[^"]+)"', match.group(1), re.S)
if not cameras:
    raise SystemExit("No camera entries were parsed from the registry")

results = {"checked_at_utc": datetime.now(timezone.utc).isoformat(), "pages": [], "cameras": []}
for name, url in PAGES.items():
    result = fetch(url)
    results["pages"].append({"name": name, "url": url, **{k:v for k,v in result.items() if k != "body"}})
for key, title, url in cameras:
    result = fetch(url)
    results["cameras"].append({"id": key, "title": title, "url": url,
                               **{k:v for k,v in result.items() if k != "body"}})

print("# Earth Observatory weekly health audit")
print(f"Checked: {results['checked_at_utc']}")
print("\\n## Portal pages")
for row in results["pages"]:
    print(f"- [{'OK' if row['ok'] else 'CHECK'}] {row['name']}: HTTP {row['status'] or 'unavailable'} — {row['url']}")
print("\\n## Camera provider destinations")
for row in results["cameras"]:
    print(f"- [{'REACHABLE' if row['ok'] else 'CHECK'}] {row['title']}: HTTP {row['status'] or 'unavailable'} — {row['url']}")
print("\\nA reachable provider page does not prove its camera is broadcasting. Provider pages may show scheduled, seasonal, offline, or temporarily unavailable feeds.")
print("\\nJSON_REPORT=" + json.dumps(results, separators=(",", ":")))
