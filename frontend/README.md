# Frontend - Smart Wearable Monitoring System

## 🎨 Structure

```
frontend/src/
├── components/
│   ├── Navbar.js          # Navigation bar
│   ├── DashboardCard.js   # Data display card
│   └── Graph.js           # Data visualization
├── pages/
│   ├── Login.js           # Login page
│   ├── WorkerDashboard.js # Worker dashboard
│   └── AdminDashboard.js  # Admin dashboard
├── services/
│   └── api.js             # API calls
├── context/
│   └── AuthContext.js     # Auth state management
├── App.js                 # Main app component
└── index.js               # React entry point
```

## 📦 Dependencies

```json
{
  "dependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "react-router-dom": "^6.0.0",
    "axios": "^1.0.0",
    "chart.js": "^3.0.0",
    "react-chartjs-2": "^4.0.0"
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
REACT_APP_API_URL=http://localhost:5000
REACT_APP_ENV=development
```

## ▶️ Run Development Server

```bash
npm start
```

Frontend runs on: `http://localhost:3000`

## 📄 Pages

### Login Page (`pages/Login.js`)
- Email and password input
- Register / Login toggle
- Form validation
- Token storage

### Worker Dashboard (`pages/WorkerDashboard.js`)
- Current temperature display
- UV index display
- Status indicator
- Active alerts
- Historical data graph
- Real-time updates

### Admin Dashboard (`pages/AdminDashboard.js`)
- Total workers count
- Worker list with status
- Click worker for detailed view
- All sensor data visualization
- Alert management

## 🔐 Authentication

- JWT token stored in localStorage
- Auto-logout on token expiration
- Protected routes with AuthContext

## 📊 Components

### DashboardCard
Displays sensor data with status indicator:
- Temperature reading
- UV index reading
- Last update time
- Alert badges

### Graph
Visualizes historical data:
- Time-series chart
- Temperature trend
- UV exposure trend
- Customizable time range

### Navbar
Navigation and user info:
- Logo
- User name
- Logout button
- Role indicator

## 🌐 API Integration

**File: `services/api.js`**

```javascript
// Example API calls
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const login = (email, password) => api.post('/api/auth/login', { email, password });
export const getMyData = () => api.get('/api/my-data');
export const getAllWorkers = () => api.get('/api/all-workers');
```

## 🎯 Features

- ✅ Real-time data updates
- ✅ Role-based dashboards
- ✅ Data visualization
- ✅ Alert notifications
- ✅ Responsive design

## ✅ Testing

1. Start backend server (port 5000)
2. Run `npm start`
3. Login with test credentials
4. View dashboard data
