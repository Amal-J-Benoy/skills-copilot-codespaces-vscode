import React from 'react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useAuth();

    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <span className="navbar-icon">🦺</span>
                <span className="navbar-title">Wearable Monitor</span>
            </div>
            {user && (
                <div className="navbar-right">
                    <span className="navbar-user">👤 {user.name}</span>
                    <span className={`navbar-role role-${user.role}`}>{user.role.toUpperCase()}</span>
                    <button className="btn btn-logout" onClick={logout}>
                        Logout
                    </button>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
