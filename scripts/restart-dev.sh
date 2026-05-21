#!/usr/bin/env bash
# Restart the Next dev server cleanly:
#   1. kill whatever is listening on the dev port (a stuck `npm run dev`),
#   2. clear the .next cache (force-static pages serve stale Firestore reads
#      until the cache is dropped — see the locations/ISO-text gotcha),
#   3. start the dev server again.
#
# Usage:  npm run dev:restart            (port 3100)
#         PORT=4000 npm run dev:restart  (override the port)
set -u
PORT="${PORT:-3100}"

echo "→ Freeing port ${PORT}…"
if command -v fuser >/dev/null 2>&1; then
  fuser -k "${PORT}/tcp" 2>/dev/null || true
elif command -v lsof >/dev/null 2>&1; then
  lsof -ti:"${PORT}" | xargs -r kill -9 2>/dev/null || true
else
  pkill -f "next dev" 2>/dev/null || true
fi

# Give the OS a moment to release the socket before rebinding.
sleep 1

echo "→ Clearing .next cache…"
rm -rf .next

echo "→ Starting dev server on :${PORT}…"
exec npm run dev
