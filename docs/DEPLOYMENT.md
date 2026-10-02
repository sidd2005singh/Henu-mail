# HENU MAIL — DEPLOYMENT & CONTAINER GUIDE

**HENU OS PRIVATE LIMITED**

---

## 1. Multi-Stage Docker Container

The production container uses a 3-stage minimal Node.js 20 alpine image:
* **Stage 1 (`deps`)**: Installs production and build dependencies.
* **Stage 2 (`builder`)**: Generates optimized standalone Next.js build artifacts.
* **Stage 3 (`runner`)**: Runs as non-root user `nextjs` (UID 1001) with internal `/api/v1/health` healthchecks.

---

## 2. Docker Compose Deployment

```yaml
version: "3.9"
services:
  web:
    build: .
    ports: ["3000:3000"]
    environment:
      - NODE_ENV=production
      - ENCRYPTION_SECRET=${ENCRYPTION_SECRET}
  worker:
    build: .
    command: ["node", "worker.js"]
  redis:
    image: redis:7-alpine
  postgres:
    image: postgres:15-alpine
```

---

## 3. Environment Profiles

* **Development**: `.env.local`
* **Staging**: Configured via Docker secrets / CI environment.
* **Production**: Kubernetes / AWS ECS / Railway / Render with encrypted secrets manager.

---

© 2026 **HENU OS Private Limited**. All rights reserved.
