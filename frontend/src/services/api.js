import axios from 'axios';

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

// Auth
export const login = (data) => API.post('/auth/login', data);
export const register = (data) => API.post('/auth/register', data);

// Worker
export const getSensorData = () => API.get('/my-data');

// Admin
export const getAllWorkers = () => API.get('/all-workers');
export const getAllData = () => API.get('/all-data');
export const getWorkerById = (workerId) => API.get(`/worker/${workerId}`);

export default API;
