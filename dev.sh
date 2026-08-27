#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
# Prefer project-local or common Node installs
for CAND in \
  "$ROOT/.tools/node/bin" \
  "/home/thomasf/Desktop/UnderWatch/.tools/node-v22.14.0-linux-x64/bin" \
  "$HOME/.nvm/versions/node/$(ls "$HOME/.nvm/versions/node" 2>/dev/null | tail -1)/bin"
 do
  if [[ -x "$CAND/node" ]]; then export PATH="$CAND:$PATH"; break; fi
done
command -v node >/dev/null || { echo "Node.js not found"; exit 1; }
cd "$ROOT"
[[ -d node_modules ]] || npm install
exec npm run dev -- --host 0.0.0.0 --port 5173

