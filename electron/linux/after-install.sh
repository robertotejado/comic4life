#!/bin/sh
set -e

if [ -d "/opt/Comic4Life" ]; then
  ln -sf "/opt/Comic4Life/comic4life" "/usr/bin/comic4life" || true
  if [ -f "/opt/Comic4Life/chrome-sandbox" ]; then
    chown root:root "/opt/Comic4Life/chrome-sandbox" || true
    chmod 4755 "/opt/Comic4Life/chrome-sandbox" || true
  fi
fi

if command -v update-desktop-database >/dev/null 2>&1; then
  update-desktop-database -q /usr/share/applications || true
fi
