import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Layout/Navbar';
import Sidebar from '../components/Layout/Sidebar';

const ProfileField = ({ label, value, icon }) => (
    <div className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0">
        <span className="text-xl flex-shrink-0 mt-0.5">{icon}</span>
        <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider">{label}</p>
            <p className="text-sm font-semibold text-gray-800 mt-0.5">{value || '—'}</p>
        </div>
    </div>
);

const Profile = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [confirmLogout, setConfirmLogout] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!user) {
        navigate('/login');
        return null;
    }

    const joinedDate = user.createdAt
        ? new Date(user.createdAt).toLocaleDateString([], {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
          })
        : 'N/A';

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            <div className="flex flex-1">
                <Sidebar />
                <main className="flex-1 p-6 max-w-2xl mx-auto w-full">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            View your account information
                        </p>
                    </div>

                    {/* Avatar card */}
                    <div className="bg-white rounded-2xl shadow-sm p-6 mb-5 flex items-center gap-5">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0 shadow">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">{user.name}</h2>
                            <div className="flex items-center gap-2 mt-1">
                                <span
                                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                                        user.role === 'admin'
                                            ? 'bg-red-100 text-red-700'
                                            : 'bg-green-100 text-green-700'
                                    }`}
                                >
                                    {user.role.toUpperCase()}
                                </span>
                                <span
                                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                                        user.isActive !== false
                                            ? 'bg-green-100 text-green-600'
                                            : 'bg-gray-100 text-gray-500'
                                    }`}
                                >
                                    {user.isActive !== false ? '● Active' : '● Inactive'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Details card */}
                    <div className="bg-white rounded-2xl shadow-sm p-6 mb-5">
                        <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-2">
                            Account Details
                        </h3>
                        <ProfileField label="Full Name" value={user.name} icon="👤" />
                        <ProfileField label="Email Address" value={user.email} icon="✉️" />
                        <ProfileField label="Role" value={user.role.toUpperCase()} icon="🎭" />
                        <ProfileField label="Device ID" value={user.deviceId} icon="📟" />
                        <ProfileField label="Member Since" value={joinedDate} icon="📅" />
                    </div>

                    {/* Danger zone */}
                    <div className="bg-white rounded-2xl shadow-sm p-6">
                        <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-4">
                            Session
                        </h3>
                        {confirmLogout ? (
                            <div className="flex items-center gap-3">
                                <p className="text-sm text-gray-600">Are you sure?</p>
                                <button
                                    onClick={handleLogout}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition"
                                >
                                    Yes, Logout
                                </button>
                                <button
                                    onClick={() => setConfirmLogout(false)}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200 transition"
                                >
                                    Cancel
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setConfirmLogout(true)}
                                className="flex items-center gap-2 px-5 py-2.5 bg-red-50 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-100 transition border border-red-200"
                            >
                                <span>🚪</span> Logout from this device
                            </button>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Profile;
