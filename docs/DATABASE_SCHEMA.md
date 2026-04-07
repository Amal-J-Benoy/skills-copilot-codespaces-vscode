# Database Schema - Smart Wearable Monitoring System

## 📊 MongoDB Collections

### User Collection

```javascript
{
  "_id": ObjectId,
  "name": String,
  "email": String (unique),
  "password": String (hashed),
  "role": String (enum: ["admin", "worker"]),
  "deviceId": String,
  "createdAt": Date,
  "updatedAt": Date,
  "isActive": Boolean
}
```

**Indexes:**
- `email` (unique)
- `deviceId`
- `role`

### SensorData Collection

```javascript
{
  "_id": ObjectId,
  "userId": ObjectId (ref: User),
  "deviceId": String,
  "temperature": Number,
  "uvIndex": Number,
  "timestamp": Date,
  "alerts": Array<String>,
  "createdAt": Date
}
```

**Indexes:**
- `userId` + `timestamp` (compound)
- `deviceId`
- `timestamp` (TTL: optional, for data retention)

## 📈 Example Documents

### User (Worker)
```json
{
  "_id": ObjectId("6123abc456def7890gh1234i"),
  "name": "John Doe",
  "email": "john@company.com",
  "password": "$2b$10$abcdefghijklmnop...",
  "role": "worker",
  "deviceId": "ESP32_001",
  "createdAt": ISODate("2026-04-01T08:00:00Z"),
  "updatedAt": ISODate("2026-04-07T13:00:00Z"),
  "isActive": true
}
```

### User (Admin)
```json
{
  "_id": ObjectId("6123abc456def7890gh5678k"),
  "name": "Admin User",
  "email": "admin@company.com",
  "password": "$2b$10$abcdefghijklmnop...",
  "role": "admin",
  "deviceId": null,
  "createdAt": ISODate("2026-04-01T08:00:00Z"),
  "updatedAt": ISODate("2026-04-07T13:00:00Z"),
  "isActive": true
}
```

### SensorData
```json
{
  "_id": ObjectId("6123abc456def7890gh9101l"),
  "userId": ObjectId("6123abc456def7890gh1234i"),
  "deviceId": "ESP32_001",
  "temperature": 37.2,
  "uvIndex": 6.5,
  "timestamp": ISODate("2026-04-07T13:30:00Z"),
  "alerts": [],
  "createdAt": ISODate("2026-04-07T13:30:05Z")
}
```

### SensorData (With Alerts)
```json
{
  "_id": ObjectId("6123abc456def7890gh9102m"),
  "userId": ObjectId("6123abc456def7890gh1234i"),
  "deviceId": "ESP32_001",
  "temperature": 38.5,
  "uvIndex": 7.8,
  "timestamp": ISODate("2026-04-07T14:00:00Z"),
  "alerts": ["High Temperature", "High UV Exposure"],
  "createdAt": ISODate("2026-04-07T14:00:05Z")
}
```

## 🔑 Relationships

- **User** ←→ **SensorData**: One-to-Many (One user has many sensor data points)

## 💾 Retention Policy

- Keep sensor data for 90 days (optional TTL index)
- Archive older data if needed
- Alert logs stored within SensorData collection
