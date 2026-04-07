import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import WorkerDashboard from './pages/WorkerDashboard';
import AdminDashboard from './pages/AdminDashboard';

// Protected route: redirects to login if not authenticated
const ProtectedRoute = ({ children, requiredRole }) => {
    const { user, loading } = useAuth();

    if (loading) return <div className="loading fullscreen">Loading...</div>;

    if (!user) return <Navigate to="/login" replace />;

    if (requiredRole && user.role !== requiredRole) {
        // Redirect to appropriate dashboard for the user's actual role
        return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />;
    }

    return children;
};

const AppRoutes = () => {
    const { user, loading } = useAuth();

    if (loading) return <div className="loading fullscreen">Loading...</div>;

    return (
        <Routes>
            <Route
                path="/login"
                element={user ? <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace /> : <Login />}
            />
            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute requiredRole="worker">
                        <WorkerDashboard />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin"
                element={
                    <ProtectedRoute requiredRole="admin">
                        <AdminDashboard />
                    </ProtectedRoute>
                }
            />
            <Route
                path="*"
                element={
                    user ? (
                        <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />
                    ) : (
                        <Navigate to="/login" replace />
                    )
                }
            />
        </Routes>
    );
};

const App = () => {
    return (
        <AuthProvider>
            <Router>
                <AppRoutes />
            </Router>
        </AuthProvider>
    );
};

export default App;
