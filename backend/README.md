# Backend - Smart Wearable Monitoring System

## 🏗️ Structure

```
backend/
├── config/
│   └── db.js              # MongoDB connection
├── models/
│   ├── User.js            # User schema
│   └── SensorData.js      # Sensor data schema
├── routes/
│   ├── authRoutes.js      # Auth endpoints
│   ├── sensorRoutes.js    # Sensor data endpoints
│   └── adminRoutes.js     # Admin endpoints
├── controllers/
│   ├── authController.js  # Auth logic
│   ├── sensorController.js# Sensor logic
│   └── adminController.js # Admin logic
├── middleware/
│   └── authMiddleware.js  # JWT verification
├── utils/
│   └── alertService.js    # Alert logic
├── app.js                 # Express app setup
├── server.js              # Server startup
└── package.json           # Dependencies
```

## 📦 Dependencies

```json
{
  "dependencies": {
    "express": "^4.18.0",
    "mongoose": "^7.0.0",
    "jsonwebtoken": "^9.0.0",
    "bcryptjs": "^2.4.3",
    "dotenv": "^16.0.0",
    "cors": "^2.8.5"
  },
  "devDependencies": {
    "nodemon": "^2.0.0"
  }
}
```

## 🚀 Installation

```bash
npm install
```

## 🔑 Environment Variables

Create `.env` file:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/wearable-monitoring
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=7d
NODE_ENV=development
ALERT_TEMP_THRESHOLD=38
ALERT_UV_THRESHOLD=7
```

## ▶️ Run Server

```bash
# Development with nodemon
npm start

# Production
NODE_ENV=production npm start
```

## 🔐 Authentication

JWT token is returned on login and required for protected routes.

**Header format:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

## 📡 Main Routes

- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `POST /api/sensor-data` - Send sensor data
- `GET /api/my-data` - Get user's data
- `GET /api/all-workers` - Get all workers (admin)
- `GET /api/all-data` - Get all data (admin)
- `GET /api/worker/:id` - Get worker details (admin)

See `docs/API_DESIGN.md` for full API documentation.

## 🧠 Alert Logic

**`utils/alertService.js`**

```javascript
function checkAlerts(data) {
  let alerts = [];

  if (data.temperature > 38) {
    alerts.push("High Temperature");
  }

  if (data.uvIndex > 7) {
    alerts.push("High UV Exposure");
  }

  return alerts;
}
```

## 🗄️ Database Schema

See `docs/DATABASE_SCHEMA.md` for detailed schema information.

## ✅ Testing

```bash
# Register a worker
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{\n    "name": "Worker1",\n    "email": "w1@test.com",\n    "password": "1234",\n    "role": "worker",\n    "deviceId": "ESP32_001"\n  }'

# Send sensor data
curl -X POST http://localhost:5000/api/sensor-data \
  -H "Content-Type: application/json" \
  -d '{\n    "deviceId": "ESP32_001",\n    "temperature": 36.5,\n    "uvIndex": 5.2\n  }'
```
