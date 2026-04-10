import axios from 'axios';
import {
    getMockSensorData,
    getMockWorkers,
    getMockWorkerDetail,
} from './mockData';

const API = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
});

// Attach JWT token to every request if available
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

/** Returns true when demo mode is active (checked at call time). */
const isDemoActive = () => {
    if (process.env.REACT_APP_DEMO_MODE === 'true') return true;
    try {
        return localStorage.getItem('wearable_demo_mode') === 'true';
    } catch {
        return false;
    }
};

// Auth (never mocked — always hits real backend)
export const login = (data) => API.post('/auth/login', data);
export const register = (data) => API.post('/auth/register', data);

// Worker
export const getSensorData = () =>
    isDemoActive() ? Promise.resolve(getMockSensorData()) : API.get('/my-data');

// Admin
export const getAllWorkers = () =>
    isDemoActive() ? Promise.resolve(getMockWorkers()) : API.get('/all-workers');

export const getAllData = () =>
    isDemoActive() ? Promise.resolve(getMockSensorData()) : API.get('/all-data');

export const getWorkerById = (workerId) =>
    isDemoActive()
        ? Promise.resolve(getMockWorkerDetail(workerId))
        : API.get(`/worker/${workerId}`);

export default API;
