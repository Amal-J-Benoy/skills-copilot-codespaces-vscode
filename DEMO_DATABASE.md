# Demo Database — Smart Wearable Workforce Monitoring System

This document explains how to set up and use the **demo MongoDB database** that contains realistic sample data for both admin and worker roles.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Switching Between Databases](#switching-between-databases)
4. [Demo Credentials](#demo-credentials)
5. [Sample Data Overview](#sample-data-overview)
6. [Database Schema Summary](#database-schema-summary)
7. [Available npm Scripts](#available-npm-scripts)

---

## Prerequisites

- Node.js ≥ 16
- MongoDB running locally **or** a MongoDB Atlas connection string
- All backend dependencies installed (`npm install` inside `backend/`)

---

## Quick Start

### 1. Copy the environment template

```bash
cp backend/.env.example backend/.env
```

The default `.env.example` already sets `DB_MODE=demo` so the server connects to the demo database straight away.

### 2. Seed the demo database

```bash
cd backend
npm run seed:demo
```

This script will:
- Drop all existing collections in the demo database
- Create 1 admin + 5 worker accounts
- Insert 16 sample tasks across five departments
- Generate 24 hours of realistic sensor readings for each active worker
- Add worker performance metrics and analytics records for the last 7 days
- Create sample system alerts

### 3. Start the backend server

```bash
npm run dev   # or: npm start
```

The server will connect to `MONGODB_URI_DEMO` and log:

```
[DB] MongoDB connected successfully (DEMO)
```

---

## Switching Between Databases

The active database is controlled by the `DB_MODE` environment variable in `backend/.env`:

| `DB_MODE` | Database used |
|-----------|---------------|
| `demo`    | `MONGODB_URI_DEMO` |
| `prod`    | `MONGODB_URI_PROD` |
| *(blank)* | `MONGODB_URI_PROD` → `MONGODB_URI` (fallback) |

### Example `.env` snippet

```dotenv
DB_MODE=demo
MONGODB_URI_PROD=mongodb://localhost:27017/wearable-monitoring
MONGODB_URI_DEMO=mongodb://localhost:27017/wearable-monitoring-demo
```

Change `DB_MODE=prod` to switch to production without modifying any other setting.

---

## Demo Credentials

### Admin Account

| Field    | Value                  |
|----------|------------------------|
| Email    | `admin@company.com`    |
| Password | `admin123456`          |
| Role     | `admin`                |

### Worker Accounts (all share password `worker123`)

| # | Name              | Email                          | Department     | Status   |
|---|-------------------|--------------------------------|----------------|----------|
| 1 | James Carter      | james.carter@company.com       | Construction   | Active   |
| 2 | Priya Patel       | priya.patel@company.com        | Logistics      | Active   |
| 3 | Marcus Johnson    | marcus.johnson@company.com     | Healthcare     | Active   |
| 4 | Elena Rodriguez   | elena.rodriguez@company.com    | Manufacturing  | Inactive |
| 5 | Tom Nguyen        | tom.nguyen@company.com         | Utilities      | Active   |

---

## Sample Data Overview

### Tasks (16 total)

| Department     | Completed | In-Progress | Pending | Failed |
|----------------|-----------|-------------|---------|--------|
| Construction   | 2         | 1           | 0       | 0      |
| Logistics      | 1         | 1           | 1       | 0      |
| Healthcare     | 2         | 1           | 0       | 0      |
| Manufacturing  | 0         | 0           | 2       | 1      |
| Utilities      | 2         | 1           | 1       | 0      |

### Sensor Data

- **96 readings** (24 per active worker) covering the last 24 hours
- Fields: temperature, UV index, humidity, battery level, heart rate, alerts, severity

### Worker Metrics (one record per worker)

Includes tasks completed/failed/pending, efficiency score (0–100), total working hours, average vitals, and performance rating.

### Analytics (42 records)

Daily snapshots for the last 7 days, broken down by department and overall (`all`).

### System Alerts (8 records)

Mix of resolved and unresolved alerts covering: temperature, UV, heart rate, inactivity, battery, humidity, and fall detection.

---

## Database Schema Summary

### Collections

| Collection      | Purpose                                          |
|-----------------|--------------------------------------------------|
| `users`         | Admin and worker accounts                        |
| `tasks`         | Task management (assignment, status, priority)   |
| `sensordatas`   | Raw sensor readings from ESP32 devices           |
| `workermetrics` | Aggregated performance metrics per worker        |
| `analytics`     | Daily dashboard analytics per department         |
| `alerts`        | System alerts and incidents                      |

---

## Available npm Scripts

Run these from the `backend/` directory:

```bash
# Seed the demo database (clears existing data first)
npm run seed:demo

# Clear the demo database without re-seeding
npm run clear:demo

# Seed using the production database URI (DB_MODE=prod)
npm run seed:prod
```

> **Note:** `seed:prod` uses the same sample data as `seed:demo` but targets `MONGODB_URI_PROD`.  
> Use with care — it will clear all collections in the production database before seeding.

---

## Typical Demo Workflow

1. **Login as admin** (`admin@company.com`) to see the full dashboard:
   - All workers and their real-time sensor status
   - Task overview by department
   - System alerts (resolved and unresolved)
   - Analytics charts for the last 7 days

2. **Login as a worker** (e.g. `james.carter@company.com`) to see:
   - Personal task list with statuses
   - Latest sensor readings from the device
   - Personal performance metrics

3. **Simulate an alert** by logging in as the admin and checking the unresolved alerts for Elena Rodriguez (Manufacturing) — she has a critical temperature alert and an elevated heart-rate alert that demonstrate the alerting workflow.
