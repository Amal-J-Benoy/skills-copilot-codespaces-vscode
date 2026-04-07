import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const { login, register } = useAuth();
    const navigate = useNavigate();

    const [isRegister, setIsRegister] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'worker',
        deviceId: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.email || !formData.password) {
            setError('Email and password are required.');
            return;
        }
        if (isRegister && !formData.name) {
            setError('Name is required for registration.');
            return;
        }
        if (isRegister && !formData.deviceId) {
            setError('Device ID is required for registration.');
            return;
        }

        setLoading(true);
        try {
            let user;
            if (isRegister) {
                user = await register(formData);
            } else {
                user = await login(formData.email, formData.password);
            }
            navigate(user.role === 'admin' ? '/admin' : '/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <div className="login-header">
                    <span className="login-icon">🦺</span>
                    <h1 className="login-title">Wearable Monitor</h1>
                    <p className="login-subtitle">Smart Workforce Safety System</p>
                </div>

                <div className="login-tabs">
                    <button
                        className={`tab-btn ${!isRegister ? 'active' : ''}`}
                        onClick={() => { setIsRegister(false); setError(''); }}
                    >
                        Login
                    </button>
                    <button
                        className={`tab-btn ${isRegister ? 'active' : ''}`}
                        onClick={() => { setIsRegister(true); setError(''); }}
                    >
                        Register
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    {isRegister && (
                        <div className="form-group">
                            <label htmlFor="name">Full Name</label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                placeholder="John Doe"
                                value={formData.name}
                                onChange={handleChange}
                                required={isRegister}
                            />
                        </div>
                    )}

                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="user@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {isRegister && (
                        <>
                            <div className="form-group">
                                <label htmlFor="role">Role</label>
                                <select
                                    id="role"
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                >
                                    <option value="worker">Worker</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="deviceId">Device ID</label>
                                <input
                                    id="deviceId"
                                    name="deviceId"
                                    type="text"
                                    placeholder="ESP32-001"
                                    value={formData.deviceId}
                                    onChange={handleChange}
                                    required={isRegister}
                                />
                            </div>
                        </>
                    )}

                    {error && <div className="alert alert-error">{error}</div>}

                    <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                        {loading ? 'Please wait...' : isRegister ? 'Register' : 'Login'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
