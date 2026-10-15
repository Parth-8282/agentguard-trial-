# 🚀 AWS EC2 Deployment Guide — PayShield + AgentGuard

This guide provides end-to-end instructions for deploying the **PayShield** Dashboard and **AgentGuard** Multi-Agent AI Fraud Detection System on an **Amazon EC2** instance using Docker.

---

## 📋 Prerequisites & EC2 Specifications

### Recommended Instance Hardware
| Resource | Minimum | Recommended |
| :--- | :--- | :--- |
| **Instance Type** | `t3.medium` (2 vCPU, 4 GB RAM) | `t3.large` (2 vCPU, 8 GB RAM) |
| **OS / AMI** | Ubuntu 24.04 LTS / 22.04 LTS | Ubuntu 24.04 LTS |
| **Storage** | 20 GB gp3 SSD | 30 GB gp3 SSD |

> [!NOTE]
> If you are using a free-tier or budget instance like `t3.small` (2 GB RAM), use **Deployment Option 2 (Standalone All-in-One Container)** to run both services within a minimal memory footprint.

---

## 🔒 1. AWS Security Group Inbound Rules

In the AWS EC2 Management Console, open your instance's **Security Group** and add the following **Inbound Rules**:

| Type | Protocol | Port Range | Source | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **SSH** | TCP | `22` | Your IP / `0.0.0.0/0` | Terminal remote access |
| **Custom TCP** | TCP | `3000` | `0.0.0.0/0` | PayShield Web Dashboard & Sentinel Gateway |
| **Custom TCP** | TCP | `8000` | `0.0.0.0/0` | AgentGuard AI Backend API & OpenAPI Docs |

---

## ⚡ 2. Quick 1-Command Deployment

Connect to your EC2 instance via SSH:
```bash
ssh -i your-key.pem ubuntu@<your-ec2-public-ip>
```

Clone your repository (or copy files via `rsync` / `scp`):
```bash
git clone <your-repository-url> payshield
cd payshield
```

Make the automated script executable and run it:
```bash
chmod +x deploy-ec2.sh
./deploy-ec2.sh
```

The script will automatically:
1. Install Docker and Docker Compose (if not already installed).
2. Configure `.env` from `.env.example`.
3. Build the container images and launch the services.
4. Output your live public URLs.

---

## 🛠️ 3. Manual Deployment Options

### Option A: Docker Compose (Full Stack — Recommended)

Runs the complete architecture with Redis and Kafka backbones:

1. **Configure Environment Variables**:
   ```bash
   cp .env.example .env
   nano .env
   ```
   Set your keys:
   ```env
   MONGODB_URI=mongodb+srv://user:pass@cluster0.mongodb.net/?appName=Cluster0
   RAZORPAY_KEY_ID=rzp_test_TlHAa8NfSdwwZr
   RAZORPAY_KEY_SECRET=HOBQHKX2Z57vq2ELcrx8vtp1
   GEMINI_API_KEY=your_gemini_api_key
   ```

2. **Build and Launch All Services**:
   ```bash
   sudo docker compose up --build -d
   ```

3. **Verify Service Health**:
   ```bash
   sudo docker compose ps
   sudo docker compose logs -f
   ```

---

### Option B: Standalone Single Container (All-in-One)

Builds both the Python Multi-Agent AI backend and the Node.js PayShield frontend into a single container:

1. **Build the Root Docker Image**:
   ```bash
   sudo docker build -t payshield-allinone -f Dockerfile .
   ```

2. **Run Container**:
   ```bash
   sudo docker run -d \
     --name payshield-app \
     --restart unless-stopped \
     -p 3000:3000 \
     -p 8000:8000 \
     --env-file .env \
     payshield-allinone
   ```

---

## 🌐 4. Verifying Your Deployment

Once running, access your services from your browser:

- **PayShield Web Dashboard**: `http://<your-ec2-public-ip>:3000`
- **AgentGuard API Health**: `http://<your-ec2-public-ip>:8000/health`
- **FastAPI Interactive Docs**: `http://<your-ec2-public-ip>:8000/docs`

Test the transaction analysis endpoint from your terminal:
```bash
curl -X POST http://<your-ec2-public-ip>:3000/api/transactions/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "recipientName": "Electricity Billing Cell",
    "upiId": "urgent.power@upi",
    "amount": 25000,
    "message": "Immediate payment or power disconnect tonight",
    "senderId": "user_aryan"
  }'
```

---

## 🔧 5. Useful Management Commands

| Action | Docker Compose | Standalone Container |
| :--- | :--- | :--- |
| **View logs** | `sudo docker compose logs -f` | `sudo docker logs -f payshield-app` |
| **Stop services** | `sudo docker compose down` | `sudo docker stop payshield-app` |
| **Restart services** | `sudo docker compose restart` | `sudo docker restart payshield-app` |
| **Rebuild after update** | `sudo docker compose up --build -d` | `sudo docker build -t payshield-allinone . && sudo docker restart payshield-app` |

---

## 🔒 6. Optional: Nginx Reverse Proxy with SSL (HTTPS)

To serve on port 80/443 with a custom domain:

```bash
sudo apt-get install -y nginx certbot python3-certbot-nginx
```

Configure `/etc/nginx/sites-available/payshield`:
```nginx
server {
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api/agentguard/ {
        proxy_pass http://localhost:8000/;
        proxy_set_header Host $host;
    }
}
```

Enable and secure with Let's Encrypt:
```bash
sudo ln -s /etc/nginx/sites-available/payshield /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d your-domain.com
```
