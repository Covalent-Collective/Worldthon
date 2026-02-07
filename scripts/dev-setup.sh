#!/usr/bin/env bash
#
# dev-setup.sh - Start ngrok tunnel for World App Simulator testing
#
# Usage:
#   ./scripts/dev-setup.sh          # Default: tunnel to localhost:3000
#   ./scripts/dev-setup.sh 3001     # Custom port
#
set -euo pipefail

PORT="${1:-3000}"
NGROK_MIN_VERSION="3"

# ---------------------------------------------------------------
# Color helpers
# ---------------------------------------------------------------
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

banner() {
  echo ""
  echo -e "${CYAN}=============================================${NC}"
  echo -e "${BOLD}  Seed Vault - World App Dev Setup${NC}"
  echo -e "${CYAN}=============================================${NC}"
  echo ""
}

info()    { echo -e "${GREEN}[INFO]${NC} $*"; }
warn()    { echo -e "${YELLOW}[WARN]${NC} $*"; }
error()   { echo -e "${RED}[ERROR]${NC} $*"; }

# ---------------------------------------------------------------
# 1. Check ngrok installation
# ---------------------------------------------------------------
check_ngrok() {
  if ! command -v ngrok &>/dev/null; then
    error "ngrok is not installed."
    echo ""
    echo "Install ngrok using one of these methods:"
    echo ""
    echo "  macOS (Homebrew):"
    echo "    brew install ngrok/ngrok/ngrok"
    echo ""
    echo "  npm (global):"
    echo "    npm install -g ngrok"
    echo ""
    echo "  Direct download:"
    echo "    https://ngrok.com/download"
    echo ""
    echo "After installing, authenticate with your ngrok token:"
    echo "    ngrok config add-authtoken <YOUR_TOKEN>"
    echo ""
    echo "Get a free token at: https://dashboard.ngrok.com/signup"
    exit 1
  fi

  info "ngrok found: $(ngrok version 2>/dev/null || echo 'version unknown')"
}

# ---------------------------------------------------------------
# 2. Check if dev server is running
# ---------------------------------------------------------------
check_dev_server() {
  if ! curl -s --max-time 2 "http://localhost:${PORT}" >/dev/null 2>&1; then
    warn "Dev server does not appear to be running on localhost:${PORT}"
    echo ""
    echo "  Start it in another terminal first:"
    echo "    npm run dev"
    echo ""
    echo "  Or use the combined command:"
    echo "    npm run dev:test"
    echo ""
    read -rp "Continue anyway? (y/N) " answer
    if [[ "${answer}" != "y" && "${answer}" != "Y" ]]; then
      exit 0
    fi
  else
    info "Dev server detected on localhost:${PORT}"
  fi
}

# ---------------------------------------------------------------
# 3. Start ngrok tunnel
# ---------------------------------------------------------------
start_tunnel() {
  info "Starting ngrok tunnel to localhost:${PORT}..."
  echo ""

  # Start ngrok in background
  ngrok http "${PORT}" --log=stdout > /tmp/ngrok-seed-vault.log 2>&1 &
  NGROK_PID=$!

  # Wait for tunnel to establish
  sleep 3

  # Fetch the public URL from ngrok API
  NGROK_URL=""
  for i in {1..10}; do
    NGROK_URL=$(curl -s http://localhost:4040/api/tunnels 2>/dev/null \
      | grep -o '"public_url":"https://[^"]*"' \
      | head -1 \
      | cut -d'"' -f4) || true

    if [[ -n "${NGROK_URL}" ]]; then
      break
    fi
    sleep 1
  done

  if [[ -z "${NGROK_URL}" ]]; then
    error "Could not retrieve ngrok public URL."
    error "Check /tmp/ngrok-seed-vault.log for details."
    kill "${NGROK_PID}" 2>/dev/null || true
    exit 1
  fi

  echo -e "${CYAN}=============================================${NC}"
  echo -e "${BOLD}  Tunnel Active${NC}"
  echo -e "${CYAN}=============================================${NC}"
  echo ""
  echo -e "  ${GREEN}Public URL:${NC}  ${NGROK_URL}"
  echo -e "  ${GREEN}Local:${NC}       http://localhost:${PORT}"
  echo -e "  ${GREEN}Inspector:${NC}   http://localhost:4040"
  echo ""
  echo -e "${CYAN}---------------------------------------------${NC}"
  echo -e "${BOLD}  Next Steps for World App Simulator:${NC}"
  echo -e "${CYAN}---------------------------------------------${NC}"
  echo ""
  echo "  1. Go to https://developer.worldcoin.org"
  echo "  2. Open your app: app_eeaea67b6fe4ee1014f90072318ef99a"
  echo "  3. Set the 'App URL' to:"
  echo -e "     ${YELLOW}${NGROK_URL}${NC}"
  echo ""
  echo "  4. Open World App Simulator:"
  echo -e "     ${YELLOW}https://simulator.worldcoin.org${NC}"
  echo ""
  echo "  5. Or scan this URL in World App:"
  echo -e "     ${YELLOW}worldapp://mini-app?app_id=app_eeaea67b6fe4ee1014f90072318ef99a${NC}"
  echo ""
  echo -e "${CYAN}---------------------------------------------${NC}"
  echo -e "  Press ${BOLD}Ctrl+C${NC} to stop the tunnel"
  echo -e "${CYAN}---------------------------------------------${NC}"
  echo ""

  # Trap SIGINT to clean up
  trap 'echo ""; info "Shutting down ngrok tunnel..."; kill ${NGROK_PID} 2>/dev/null; exit 0' INT TERM

  # Wait for ngrok process
  wait "${NGROK_PID}"
}

# ---------------------------------------------------------------
# Main
# ---------------------------------------------------------------
banner
check_ngrok
check_dev_server
start_tunnel
