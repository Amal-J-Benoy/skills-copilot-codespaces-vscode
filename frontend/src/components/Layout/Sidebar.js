import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const workerLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: '📊' },
    { to: '/profile', label: 'My Profile', icon: '👤' },
];

const adminLinks = [
    { to: '/admin', label: 'Admin Panel', icon: '🛡️' },
    { to: '/profile', label: 'My Profile', icon: '👤' },
];

const Sidebar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const links = user?.role === 'admin' ? adminLinks : workerLinks;

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <aside className="hidden md:flex flex-col w-56 min-h-screen bg-gray-900 text-white py-6">
            {/* Brand */}
            <div className="px-5 mb-8 flex items-center gap-2">
                <span className="text-2xl">🦺</span>
                <span className="font-bold text-base tracking-wide">WearableMonitor</span>
            </div>

            {/* Navigation links */}
            <nav className="flex-1 px-3 space-y-1" aria-label="Sidebar navigation">
                {links.map(({ to, label, icon }) => (
                    <NavLink
                        key={to}
                        to={to}
                        end
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                                isActive
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                            }`
                        }
                    >
                        <span className="text-base">{icon}</span>
                        {label}
                    </NavLink>
                ))}
            </nav>

            {/* User info + logout */}
            {user && (
                <div className="px-3 mt-4 border-t border-gray-700 pt-4">
                    <div className="flex items-center gap-3 px-2 mb-3">
                        <span className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                            {user.name.charAt(0).toUpperCase()}
                        </span>
                        <div className="overflow-hidden">
                            <p className="text-sm font-semibold truncate">{user.name}</p>
                            <p className="text-xs text-gray-400 capitalize">{user.role}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-red-700 hover:text-white transition"
                    >
                        <span>🚪</span> Logout
                    </button>
                </div>
            )}
        </aside>
    );
};

export default Sidebar;
