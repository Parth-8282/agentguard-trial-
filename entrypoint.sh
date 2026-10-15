#!/bin/sh
# ==============================================================================
# PayShield + AgentGuard Unified EC2 Entrypoint
# Runs both AgentGuard AI backend (8000) and PayShield Sentinel Gateway (3000)
# ==============================================================================
set -e

echo "🛡️ PayShield + AgentGuard starting on EC2..."

# 1. Start Python AgentGuard Multi-Agent AI Backend in background
cd /app/agentguard
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
echo "✅ AgentGuard Backend started (PID: $BACKEND_PID, port: 8000)"

# 2. Start Node.js PayShield Sentinel Gateway
cd /app/Agent-Guard-Frontend
export PORT=${PORT:-3000}
export NODE_ENV=${NODE_ENV:-production}
export AGENTGUARD_API_URL=${AGENTGUARD_API_URL:-http://127.0.0.1:8000}

npx tsx server.ts &
FRONTEND_PID=$!
echo "✅ PayShield Sentinel Gateway started (PID: $FRONTEND_PID, port: $PORT)"

# Graceful termination handling
cleanup() {
  echo "Stopping services..."
  kill -TERM "$BACKEND_PID" 2>/dev/null || true
  kill -TERM "$FRONTEND_PID" 2>/dev/null || true
  wait "$BACKEND_PID" 2>/dev/null || true
  wait "$FRONTEND_PID" 2>/dev/null || true
  exit 0
}

trap cleanup INT TERM

# Wait for either process to terminate
wait -n "$BACKEND_PID" "$FRONTEND_PID"
