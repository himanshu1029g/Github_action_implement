# CI/CD Pipeline with GitHub Actions + Docker + AWS EC2

![CI/CD](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-blue?logo=github-actions)
![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED?logo=docker)
![AWS](https://img.shields.io/badge/AWS-EC2-FF9900?logo=amazon-aws)
![Node.js](https://img.shields.io/badge/Node.js-22-339933?logo=node.js)

## What is this project?

This project demonstrates a **complete CI/CD pipeline** — whenever code is pushed to the `main` branch, it automatically:

1. Triggers a GitHub Actions workflow
2. SSHes into an AWS EC2 server
3. Pulls the latest code
4. Builds a fresh Docker image
5. Stops the old container
6. Starts the new container

**Zero manual deployment steps.** Push code → app is live. That's it.

---

## Tech Stack

| Tool | Purpose |
|------|---------|
| GitHub Actions | CI/CD pipeline automation |
| Docker | Containerisation |
| AWS EC2 | Cloud server (Ubuntu 22.04) |
| Node.js | Backend application |
| appleboy/ssh-action | SSH into EC2 from pipeline |

---

## Project Structure

```
Github_action_implement/
├── .github/
│   └── workflows/
│       └── deploy.yml      ← CI/CD pipeline definition
├── src/
│   └── index.js            ← Node.js app
├── Dockerfile              ← Container build instructions
├── docker-compose.yml      ← Local development setup
├── package.json
└── README.md
```

---

## How the Pipeline Works

```
Developer pushes code to main branch
            ↓
GitHub detects push event (on: push: branches: [main])
            ↓
GitHub spins up ubuntu-latest runner (virtual machine)
            ↓
Runner checks out the code (actions/checkout@v4)
            ↓
appleboy/ssh-action SSHes into AWS EC2
using private key stored in GitHub Secrets
            ↓
On EC2:
  cd /home/ubuntu/app
  git pull origin main          ← get latest code
  docker build -t my-node-app . ← build new image
  docker stop node-container    ← stop old container
  docker rm node-container      ← remove old container
  docker run -d \               ← start new container
    --name node-container \
    -p 8080:8080 \
    my-node-app
            ↓
App is live at http://EC2_PUBLIC_IP:8080
```

---

## Dockerfile

```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 8080
CMD ["node", "index"]
```

---

## GitHub Actions Workflow

```yaml
name: Deploy to AWS EC2

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Deploy to EC2 via SSH
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ${{ secrets.EC2_USER }}
          key: ${{ secrets.EC2_SSH_KEY }}
          port: 22
          script: |
            cd /home/ubuntu/app
            git pull origin main
            docker build -t my-node-app .
            docker stop node-container || true
            docker rm node-container || true
            docker run -d \
              --name node-container \
              --restart always \
              -p 8080:8080 \
              my-node-app
```

---

## Setup Guide

### 1. AWS EC2 Setup

```bash
# Launch EC2 — Ubuntu 22.04, t2.micro (free tier)
# Security Group Inbound Rules:
# Port 22   → SSH
# Port 8080 → Node.js app

# SSH into EC2
ssh -i your-key.pem ubuntu@YOUR_EC2_IP

# Install Docker
sudo apt update
sudo apt install -y docker.io git
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker ubuntu

# Clone repo
git clone https://github.com/himanshu1029g/Github_action_implement.git app
```

### 2. GitHub Secrets Setup

Go to: `Repo → Settings → Secrets and variables → Actions`

| Secret Name | Value |
|------------|-------|
| `EC2_HOST` | Your EC2 Public IP |
| `EC2_USER` | `ubuntu` |
| `EC2_SSH_KEY` | Contents of your `.pem` file |

### 3. Deploy

```bash
# Any push to main triggers the pipeline
git add .
git commit -m "your message"
git push origin main

# Watch it run:
# GitHub → Actions tab → Deploy to AWS EC2
```

---

## Key Concepts Learned

- **CI/CD** — Automating build, test, and deploy on every code push
- **Docker** — Containerising Node.js app for consistent deployments
- **GitHub Actions** — Writing YAML workflows with triggers, jobs, and steps
- **GitHub Secrets** — Storing sensitive data (SSH keys, IPs) securely
- **AWS EC2** — Deploying and managing a cloud Linux server
- **SSH** — Securely connecting to remote servers via key-based auth

---

## Author

**Himanshu Gupta**
- GitHub: [@himanshu1029g](https://github.com/himanshu1029g)
- LinkedIn: [Himanshu Gupta](https://linkedin.com/in/himanshugupta1029)
- Email: ft.himanshu10@gmail.com