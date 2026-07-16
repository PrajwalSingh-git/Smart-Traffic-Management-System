# 🚦 Smart Traffic Management System

> An AI-powered Smart Traffic Management System that optimizes traffic flow using real-time vehicle detection, adaptive traffic signal control, emergency vehicle prioritization, and analytics.

![React](https://img.shields.io/badge/Frontend-React-61DAFB?logo=react)
![Node](https://img.shields.io/badge/Backend-Node.js-339933?logo=node.js)
![Python](https://img.shields.io/badge/ML-Flask-3776AB?logo=python)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-336791?logo=postgresql)
![Docker](https://img.shields.io/badge/Deployment-Docker-2496ED?logo=docker)

---

## 📖 Overview

Urban traffic congestion causes delays, fuel wastage, and emergency response issues. Traditional traffic signals operate on fixed timers regardless of road conditions.

The **Smart Traffic Management System** leverages Artificial Intelligence, Computer Vision, and Predictive Analytics to dynamically manage traffic based on live vehicle density.

### Features

- 🚦 Adaptive traffic signal control
- 🚗 YOLO/OpenCV vehicle detection
- 🚑 Emergency vehicle priority
- 📊 Live analytics dashboard
- 📈 Congestion prediction
- 🗺️ Scalable multi-intersection architecture

---

## 🛠 Tech Stack

### Frontend
- React
- Vite
- Tailwind CSS
- Recharts

### Backend
- Node.js
- Express.js

### AI Service
- Python
- Flask
- OpenCV
- YOLO

### Database
- PostgreSQL

### Deployment
- Docker
- Docker Compose
- Nginx

---

## 📁 Project Structure

```text
Smart-Traffic-Management-System
├── frontend/
├── backend/
├── ml_service/
├── database/
│   └── init.sql
├── nginx/
│   └── nginx.conf
├── docker-compose.yml
├── .env
└── README.md
```

---

## 🏗️ Architecture

```text
             React Frontend
                    │
                    ▼
             Node.js Backend
            /               \
           ▼                 ▼
 PostgreSQL Database    Flask ML Service
```

---

# 🚀 Local Setup

```bash
git clone https://github.com/PrajwalSingh-git/Smart-Traffic-Management-System.git
cd Smart-Traffic-Management-System
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs at `http://localhost:5173`

### Backend

```bash
cd backend
npm install
npm run dev
```

Runs at `http://localhost:4000`

### ML Service

```bash
cd ml_service

python -m venv .venv

# Windows
.venv\Scripts\activate

# Linux/macOS
source .venv/bin/activate

pip install -r requirements.txt
python app.py
```

Runs at `http://localhost:5000`

---

# 🐳 Docker Setup

## Backend Dockerfile

```dockerfile
FROM node:20
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 4000
CMD ["npm","run","dev"]
```

## Frontend Dockerfile

```dockerfile
FROM node:20
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5173
CMD ["npm","run","dev","--","--host"]
```

## ML Dockerfile

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 5000
CMD ["python","app.py"]
```

## docker-compose.yml

```yaml
services:
  frontend:
    build: ./frontend
    ports:
      - "5173:5173"
    depends_on:
      - backend

  backend:
    build: ./backend
    ports:
      - "4000:4000"
    env_file:
      - .env
    depends_on:
      - postgres
      - ml_service

  ml_service:
    build: ./ml_service
    ports:
      - "5000:5000"

  postgres:
    image: postgres:16
    restart: always
    environment:
      POSTGRES_DB: traffic_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/init.sql:/docker-entrypoint-initdb.d/init.sql

volumes:
  postgres_data:
```

## .env

```env
DB_HOST=postgres
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=password
DB_NAME=traffic_db

ML_SERVICE=http://ml_service:5000
```

### Run

```bash
docker compose build
docker compose up -d
```

### Logs

```bash
docker compose logs -f
```

### Stop

```bash
docker compose down
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a branch
3. Commit your changes
4. Push and open a Pull Request

---

## 👨‍💻 Author

**Prajwal Singh**

GitHub: https://github.com/PrajwalSingh-git
