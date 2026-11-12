#!/usr/bin/env python3
"""Syntax-check inline JavaScript in the static Project 137 Research Desk."""
from pathlib import Path
import re
import subprocess
import tempfile

page = Path("137/research/index.html").read_text(encoding="utf-8")
blocks = re.findall(r"<script>(.*?)</script>", page, flags=re.DOTALL | re.IGNORECASE)
if not blocks:
    raise SystemExit("No inline script block found in Research Desk")
with tempfile.NamedTemporaryFile("w", suffix=".js", encoding="utf-8") as handle:
    handle.write("\n;\n".join(blocks))
    handle.flush()
    subprocess.run(["node", "--check", handle.name], check=True)
print(f"Research Desk JavaScript syntax passed ({len(blocks)} inline script block(s)).")
