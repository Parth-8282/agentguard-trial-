# ==============================================================================
# PayShield + AgentGuard Unified Standalone Dockerfile for AWS EC2
# Packages AgentGuard AI Backend (FastAPI, 8000) & PayShield UI/Gateway (3000)
# ==============================================================================
FROM python:3.11-slim

WORKDIR /app

# Prevent interactive prompts during apt install
ENV DEBIAN_FRONTEND=noninteractive
ENV PYTHONUNBUFFERED=1

# 1. Install system tools, curl, and Node.js 20 LTS
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    ca-certificates \
    gnupg \
    && mkdir -p /etc/apt/keyrings \
    && curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg \
    && echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_20.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list \
    && apt-get update && apt-get install -y --no-install-recommends nodejs \
    && rm -rf /var/lib/apt/lists/*

# 2. Install AgentGuard Python Dependencies
COPY agentguard/requirements.txt ./agentguard/requirements.txt
RUN pip install --no-cache-dir -r ./agentguard/requirements.txt

# 3. Install PayShield Frontend Node Dependencies
COPY Agent-Guard-Frontend/package*.json ./Agent-Guard-Frontend/
WORKDIR /app/Agent-Guard-Frontend
RUN npm ci --legacy-peer-deps || npm install

# 4. Copy source code for both services
WORKDIR /app
COPY agentguard/ ./agentguard/
COPY Agent-Guard-Frontend/ ./Agent-Guard-Frontend/

# 5. Build production frontend assets
WORKDIR /app/Agent-Guard-Frontend
RUN npm run build

# 6. Copy and configure entrypoint script
WORKDIR /app
COPY entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

# Environment defaults for EC2
ENV PORT=3000
ENV NODE_ENV=production
ENV AGENTGUARD_API_URL=http://127.0.0.1:8000

# Expose Sentinel Frontend/Gateway (3000) and AgentGuard Backend (8000)
EXPOSE 3000 8000

# Health check verifies PayShield Sentinel Gateway
HEALTHCHECK --interval=20s --timeout=5s --start-period=35s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

ENTRYPOINT ["/app/entrypoint.sh"]
