# API Design - Smart Wearable Monitoring System

## 🔐 Authentication APIs

### Register User
```
POST /api/auth/register
Content-Type: application/json

{
  "name": "Worker1",
  "email": "w1@test.com",
  "password": "1234",
  "role": "worker",
  "deviceId": "ESP32_001"
}

Response (201):
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "w1@test.com",
  "password": "1234"
}

Response (200):
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "...",
    "name": "Worker1",
    "email": "w1@test.com",
    "role": "worker"
  }
}
```

## 📡 Sensor Data API

### Send Sensor Data (ESP32 → Backend)
```
POST /api/sensor-data
Content-Type: application/json

{
  "deviceId": "ESP32_001",
  "temperature": 36.5,
  "uvIndex": 5.2
}

Response (201):
{
  "message": "Data recorded successfully",
  "alerts": ["High UV Exposure"]
}
```

## 👷 Worker APIs

### Get My Data
```
GET /api/my-data
Authorization: Bearer {token}

Response (200):
{
  "data": [
    {
      "id": "...",
      "temperature": 36.5,
      "uvIndex": 5.2,
      "timestamp": "2026-04-07T10:30:00Z",
      "alerts": []
    }
  ]
}
```

## 🧑‍💼 Admin APIs

### Get All Workers
```
GET /api/all-workers
Authorization: Bearer {admin-token}

Response (200):
{
  "workers": [
    {
      "id": "...",
      "name": "Worker1",
      "email": "w1@test.com",
      "deviceId": "ESP32_001",
      "status": "Safe"
    }
  ]
}
```

### Get All Sensor Data
```
GET /api/all-data
Authorization: Bearer {admin-token}

Response (200):
{
  "data": [
    {
      "userId": "...",
      "userName": "Worker1",
      "temperature": 36.5,
      "uvIndex": 5.2,
      "timestamp": "2026-04-07T10:30:00Z",
      "alerts": []
    }
  ]
}
```

### Get Specific Worker Data
```
GET /api/worker/:workerId
Authorization: Bearer {admin-token}

Response (200):
{
  "worker": {
    "id": "...",
    "name": "Worker1",
    "email": "w1@test.com",
    "deviceId": "ESP32_001"
  },
  "recentData": [...]
}
```

## 🔥 Alert System

### Alert Thresholds
- **High Temperature**: temperature > 38°C
- **High UV Exposure**: uvIndex > 7

### Alert Response
```
{
  "alerts": [
    "High Temperature",
    "High UV Exposure"
  ],
  "severity": "high",
  "timestamp": "2026-04-07T10:30:00Z"
}
```
