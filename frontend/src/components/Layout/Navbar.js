import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useDemo } from '../../context/DemoContext';

const Navbar = () => {
    const { user, logout } = useAuth();
    const { isDemoMode, isDemoEnabled, toggleDemoMode } = useDemo();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="sticky top-0 z-40 bg-gradient-to-r from-blue-900 to-blue-700 text-white shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-14">
                    {/* Brand */}
                    <Link
                        to={user?.role === 'admin' ? '/admin' : '/dashboard'}
                        className="flex items-center gap-2 hover:opacity-90 transition-opacity"
                    >
                        <span className="text-2xl">🦺</span>
                        <span className="text-base font-semibold tracking-wide hidden sm:inline">
                            Wearable Monitor
                        </span>
                    </Link>

                    {/* Right side */}
                    {user && (
                        <div className="flex items-center gap-3">
                            {/* Demo mode badge */}
                            {isDemoMode && (
                                <span className="hidden sm:inline text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-400 text-amber-900 animate-pulse">
                                    🎭 DEMO
                                </span>
                            )}

                            {/* Demo mode toggle (visible when feature is enabled) */}
                            {isDemoEnabled && (
                                <button
                                    onClick={toggleDemoMode}
                                    title={isDemoMode ? 'Switch to Live Mode' : 'Switch to Demo Mode'}
                                    className={`hidden sm:flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border transition ${
                                        isDemoMode
                                            ? 'bg-amber-400 border-amber-500 text-amber-900 hover:bg-amber-300'
                                            : 'bg-white bg-opacity-10 border-white border-opacity-30 text-white hover:bg-opacity-20'
                                    }`}
                                >
                                    {isDemoMode ? '🔴 Live Mode' : '🎭 Demo Mode'}
                                </button>
                            )}
                            {/* Role badge */}
                            <span
                                className={`hidden sm:inline text-xs font-bold px-2.5 py-0.5 rounded-full ${
                                    user.role === 'admin'
                                        ? 'bg-red-500 text-white'
                                        : 'bg-green-500 text-white'
                                }`}
                            >
                                {user.role.toUpperCase()}
                            </span>

                            {/* User dropdown */}
                            <div className="relative" ref={menuRef}>
                                <button
                                    onClick={() => setMenuOpen((v) => !v)}
                                    className="flex items-center gap-2 bg-white bg-opacity-10 hover:bg-opacity-20 rounded-full px-3 py-1.5 text-sm transition"
                                    aria-haspopup="true"
                                    aria-expanded={menuOpen}
                                >
                                    <span className="w-6 h-6 rounded-full bg-blue-300 flex items-center justify-center text-blue-900 font-bold text-xs">
                                        {user.name.charAt(0).toUpperCase()}
                                    </span>
                                    <span className="hidden sm:inline max-w-[120px] truncate">
                                        {user.name}
                                    </span>
                                    <svg
                                        className={`w-3 h-3 transition-transform ${menuOpen ? 'rotate-180' : ''}`}
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {menuOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg py-1 text-gray-700 animate-fade-in z-50">
                                        <div className="px-4 py-2 border-b border-gray-100">
                                            <p className="text-xs text-gray-400">Signed in as</p>
                                            <p className="text-sm font-semibold truncate">{user.email}</p>
                                        </div>
                                        <Link
                                            to="/profile"
                                            onClick={() => setMenuOpen(false)}
                                            className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 transition"
                                        >
                                            <span>👤</span> My Profile
                                        </Link>
                                        {user.role === 'admin' && (
                                            <Link
                                                to="/admin"
                                                onClick={() => setMenuOpen(false)}
                                                className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 transition"
                                            >
                                                <span>🛡️</span> Admin Panel
                                            </Link>
                                        )}
                                        {user.role === 'worker' && (
                                            <Link
                                                to="/dashboard"
                                                onClick={() => setMenuOpen(false)}
                                                className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 transition"
                                            >
                                                <span>📊</span> My Dashboard
                                            </Link>
                                        )}
                                        <div className="border-t border-gray-100 mt-1">
                                            {isDemoEnabled && (
                                                <button
                                                    onClick={() => { toggleDemoMode(); setMenuOpen(false); }}
                                                    className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-gray-50 transition"
                                                >
                                                    <span>{isDemoMode ? '🔴' : '🎭'}</span>
                                                    {isDemoMode ? 'Switch to Live Mode' : 'Switch to Demo Mode'}
                                                </button>
                                            )}
                                            <button
                                                onClick={handleLogout}
                                                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                                            >
                                                <span>🚪</span> Logout
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
