#!/usr/bin/env bash
# ==============================================================================
# PayShield + AgentGuard - Automated AWS EC2 Deployment Script
# Supports: Ubuntu 22.04/24.04, Debian 11/12, Amazon Linux 2023
# ==============================================================================
set -e

echo "======================================================================"
echo "🛡️  PAYSHIELD + AGENTGUARD: AWS EC2 DEPLOYMENT SETUP"
echo "======================================================================"

# 1. Root / Sudo check
if [ "$EUID" -ne 0 ]; then
  SUDO="sudo"
else
  SUDO=""
fi

# 2. Check / Install Docker
if ! command -v docker &> /dev/null; then
  echo "📦 Docker not detected. Installing Docker Engine..."
  if [ -f /etc/os-release ]; then
    . /etc/os-release
    case "$ID" in
      ubuntu|debian)
        $SUDO apt-get update -y
        $SUDO apt-get install -y ca-certificates curl gnupg lsb-release
        $SUDO install -m 0755 -d /etc/apt/keyrings
        curl -fsSL "https://download.docker.com/linux/$ID/gpg" | $SUDO gpg --dearmor -o /etc/apt/keyrings/docker.gpg
        $SUDO chmod a+r /etc/apt/keyrings/docker.gpg
        echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/$ID $(lsb_release -cs) stable" | $SUDO tee /etc/apt/sources.list.d/docker.list > /dev/null
        $SUDO apt-get update -y
        $SUDO apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
        ;;
      amzn)
        $SUDO dnf update -y
        $SUDO dnf install -y docker
        $SUDO systemctl enable --now docker
        # Install docker-compose plugin
        $SUDO curl -SL https://github.com/docker/compose/releases/latest/download/docker-compose-linux-$(uname -m) -o /usr/local/bin/docker-compose
        $SUDO chmod +x /usr/local/bin/docker-compose
        ;;
      *)
        echo "❌ Unsupported OS distribution. Please install Docker manually."
        exit 1
        ;;
    esac
    $SUDO systemctl enable --now docker
    $SUDO usermod -aG docker "$USER" 2>/dev/null || true
  fi
  echo "✅ Docker installed successfully."
fi

# 3. Ensure .env exists
if [ ! -f .env ]; then
  if [ -f .env.example ]; then
    echo "⚠️  No .env file found. Copying from .env.example..."
    cp .env.example .env
    echo "💡 Please update .env with your MONGODB_URI and API keys if needed."
  else
    echo "❌ Error: Neither .env nor .env.example exists."
    exit 1
  fi
fi

# 4. Fetch Public IP
PUBLIC_IP=$(curl -s -m 3 http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || curl -s -m 3 ifconfig.me 2>/dev/null || echo "your-ec2-ip")

echo "----------------------------------------------------------------------"
echo "Select Deployment Mode:"
echo "1) Docker Compose (Full Stack: PayShield, AgentGuard, Redis, Kafka) [Recommended]"
echo "2) Standalone Single Container (Minimal RAM: PayShield + AgentGuard All-in-One)"
echo "----------------------------------------------------------------------"
read -r -p "Enter choice [1 or 2, default 1]: " DEPLOY_MODE
DEPLOY_MODE=${DEPLOY_MODE:-1}

if [ "$DEPLOY_MODE" = "2" ]; then
  echo "🚀 Building Standalone Unified Container..."
  $SUDO docker build -t payshield-allinone -f Dockerfile .

  echo "🛑 Stopping any existing container..."
  $SUDO docker rm -f payshield-allinone-app 2>/dev/null || true

  echo "▶️  Launching standalone container..."
  $SUDO docker run -d \
    --name payshield-allinone-app \
    --restart unless-stopped \
    -p 3000:3000 \
    -p 8000:8000 \
    --env-file .env \
    payshield-allinone
else
  echo "🚀 Building and starting Full Stack with Docker Compose..."
  if command -v docker-compose &> /dev/null; then
    COMPOSE_CMD="$SUDO docker-compose"
  else
    COMPOSE_CMD="$SUDO docker compose"
  fi

  $COMPOSE_CMD down 2>/dev/null || true
  $COMPOSE_CMD up --build -d
fi

echo "======================================================================"
echo "🎉 DEPLOYMENT COMPLETED SUCCESSFULLY!"
echo "======================================================================"
echo ""
echo "Access points on your EC2 instance:"
echo "  🌐 PayShield Dashboard & Sentinel: http://${PUBLIC_IP}:3000"
echo "  ⚙️  AgentGuard Multi-Agent API:     http://${PUBLIC_IP}:8000"
echo "  📖 API Interactive Docs:           http://${PUBLIC_IP}:8000/docs"
echo ""
echo "⚠️  Ensure EC2 Security Group Inbound Rules allow:"
echo "  - Port 3000 (TCP) from Anywhere (0.0.0.0/0) for Web UI"
echo "  - Port 8000 (TCP) from Anywhere (0.0.0.0/0) for Agent API"
echo "======================================================================"
