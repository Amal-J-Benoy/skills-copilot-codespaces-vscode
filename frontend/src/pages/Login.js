import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const InputField = ({ id, name, type, placeholder, value, onChange, required, children }) => (
    <div className="flex flex-col gap-1">
        <label htmlFor={id} className="text-sm font-semibold text-gray-600">
            {children}
        </label>
        <input
            id={id}
            name={name}
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            required={required}
            className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
        />
    </div>
);

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
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600 p-4">
            <div className="w-full max-w-md">
                {/* Card */}
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
                    {/* Top accent bar */}
                    <div className="h-1.5 bg-gradient-to-r from-blue-500 to-teal-400" />

                    <div className="p-8">
                        {/* Header */}
                        <div className="text-center mb-7">
                            <span className="text-5xl block mb-3">🦺</span>
                            <h1 className="text-2xl font-bold text-gray-800">Wearable Monitor</h1>
                            <p className="text-sm text-gray-500 mt-1">Smart Workforce Safety System</p>
                        </div>

                        {/* Tabs */}
                        <div className="flex rounded-lg overflow-hidden border border-gray-200 mb-6">
                            <button
                                type="button"
                                onClick={() => { setIsRegister(false); setError(''); }}
                                className={`flex-1 py-2.5 text-sm font-semibold transition ${
                                    !isRegister
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                                }`}
                            >
                                Login
                            </button>
                            <button
                                type="button"
                                onClick={() => { setIsRegister(true); setError(''); }}
                                className={`flex-1 py-2.5 text-sm font-semibold transition ${
                                    isRegister
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                                }`}
                            >
                                Register
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {isRegister && (
                                <InputField
                                    id="name"
                                    name="name"
                                    type="text"
                                    placeholder="John Doe"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required={isRegister}
                                >
                                    Full Name
                                </InputField>
                            )}

                            <InputField
                                id="email"
                                name="email"
                                type="email"
                                placeholder="user@example.com"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            >
                                Email Address
                            </InputField>

                            <InputField
                                id="password"
                                name="password"
                                type="password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            >
                                Password
                            </InputField>

                            {isRegister && (
                                <>
                                    <div className="flex flex-col gap-1">
                                        <label htmlFor="role" className="text-sm font-semibold text-gray-600">
                                            Role
                                        </label>
                                        <select
                                            id="role"
                                            name="role"
                                            value={formData.role}
                                            onChange={handleChange}
                                            className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition bg-white"
                                        >
                                            <option value="worker">Worker</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </div>

                                    <InputField
                                        id="deviceId"
                                        name="deviceId"
                                        type="text"
                                        placeholder="ESP32-001"
                                        value={formData.deviceId}
                                        onChange={handleChange}
                                        required={isRegister}
                                    >
                                        Device ID
                                    </InputField>
                                </>
                            )}

                            {error && (
                                <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
                                    <span className="flex-shrink-0 mt-0.5">❌</span>
                                    <span>{error}</span>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-lg text-sm font-semibold transition mt-2 flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Please wait…
                                    </>
                                ) : isRegister ? (
                                    'Create Account'
                                ) : (
                                    'Sign In'
                                )}
                            </button>
                        </form>
                    </div>
                </div>

                <p className="text-center text-xs text-blue-200 mt-5 opacity-70">
                    © {new Date().getFullYear()} Smart Wearable Workforce Monitoring System
                </p>
            </div>
        </div>
    );
};

export default Login;
