# Setup Guide - Smart Wearable Monitoring System

## 📋 Prerequisites

- Node.js (v14+)
- npm or yarn
- MongoDB (local or Atlas)
- Python 3.8+ (optional, for ESP32 tools)
- Arduino IDE (for ESP32 development)
- Git

## 🚀 Quick Start

### 1. Clone Repository
```bash
git clone https://github.com/Amal-J-Benoy/skills-copilot-codespaces-vscode.git
cd skills-copilot-codespaces-vscode
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Configure environment variables
# Edit .env with:
# - MONGODB_URI=mongodb://localhost:27017/wearable-monitoring
# - JWT_SECRET=your_secret_key
# - PORT=5000

# Start backend server
npm start
```

**Backend will run on**: `http://localhost:5000`

### 3. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Configure environment variables
# Edit .env with:
# - REACT_APP_API_URL=http://localhost:5000

# Start development server
npm start
```

**Frontend will run on**: `http://localhost:3000`

### 4. ESP32 Setup

```bash
cd ../esp32

# Follow the README.md in esp32 folder
# - Install Arduino IDE
# - Install ESP32 board support
# - Install required libraries (MLX90614, VEML6075)
# - Configure WiFi credentials
# - Upload sketch to ESP32
```

## 📁 Environment Files

### Backend `.env` Example
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/wearable-monitoring
JWT_SECRET=your_super_secret_key_change_this
NODE_ENV=development
ALERT_TEMP_THRESHOLD=38
ALERT_UV_THRESHOLD=7
```

### Frontend `.env` Example
```
REACT_APP_API_URL=http://localhost:5000
REACT_APP_ENV=development
```

## ✅ Verification

### Check Backend
```bash
curl http://localhost:5000/api/health
# Should return 200 OK
```

### Check Frontend
Open `http://localhost:3000` in browser

### Check ESP32
- Monitor Serial output in Arduino IDE
- Verify WiFi connection
- Check data posting to backend

## 🔧 Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running
- Check connection string in `.env`
- Verify network access for Atlas

### Frontend API Errors
- Check backend is running on correct port
- Verify `REACT_APP_API_URL` matches backend URL
- Clear browser cache and refresh

### ESP32 Upload Issues
- Select correct board (ESP32 Dev Module)
- Check COM port selection
- Install CH340 drivers if needed

## 📚 Next Steps

1. Review API documentation in `docs/API_DESIGN.md`
2. Understand database schema in `docs/DATABASE_SCHEMA.md`
3. Follow component setup in respective README files
4. Run sample tests
5. Deploy to production