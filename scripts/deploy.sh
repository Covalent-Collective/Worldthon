#!/bin/bash
# Seed Vault deployment script
# Usage: ./scripts/deploy.sh [sepolia|mainnet]

set -e

NETWORK=${1:-sepolia}

if [ "$NETWORK" = "sepolia" ]; then
  RPC_URL="https://worldchain-sepolia.g.alchemy.com/public"
  VERIFIER_URL="https://worldchain-sepolia.explorer.alchemy.com/api/"
  echo "Deploying to World Chain Sepolia..."
elif [ "$NETWORK" = "mainnet" ]; then
  RPC_URL="https://worldchain-mainnet.g.alchemy.com/public"
  VERIFIER_URL="https://worldscan.org/api/"
  echo "Deploying to World Chain Mainnet..."
else
  echo "Usage: ./scripts/deploy.sh [sepolia|mainnet]"
  exit 1
fi

# Navigate to project root (script may be called from anywhere)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Load env from contracts/.env
if [ -f "$PROJECT_ROOT/contracts/.env" ]; then
  set -a
  source "$PROJECT_ROOT/contracts/.env"
  set +a
else
  echo "Error: contracts/.env not found. Copy contracts/.env.example to contracts/.env and fill in values."
  exit 1
fi

# Validate required env vars
if [ -z "$PRIVATE_KEY" ] || [ "$PRIVATE_KEY" = "0x..." ]; then
  echo "Error: PRIVATE_KEY is not set in contracts/.env"
  exit 1
fi

if [ -z "$WORLD_ID_ROUTER" ]; then
  echo "Error: WORLD_ID_ROUTER is not set in contracts/.env"
  exit 1
fi

if [ -z "$WLD_TOKEN_ADDRESS" ]; then
  echo "Error: WLD_TOKEN_ADDRESS is not set in contracts/.env"
  exit 1
fi

echo "Network:          $NETWORK"
echo "RPC URL:          $RPC_URL"
echo "World ID Router:  $WORLD_ID_ROUTER"
echo "WLD Token:        $WLD_TOKEN_ADDRESS"
echo "App ID:           $APP_ID"
echo "Action ID:        $ACTION_ID"
echo "Group ID:         $GROUP_ID"
echo ""

# Deploy
cd "$PROJECT_ROOT/contracts"
forge script script/Deploy.s.sol:DeployScript \
  --rpc-url "$RPC_URL" \
  --broadcast \
  --verify \
  --verifier blockscout \
  --verifier-url "$VERIFIER_URL" \
  -vvvv

echo ""
echo "Deployment complete!"
echo "Update .env.local with the deployed contract addresses."
