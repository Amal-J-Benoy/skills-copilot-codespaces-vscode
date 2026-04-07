import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import WorkerDashboard from './pages/WorkerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';
import LoadingSpinner from './components/Common/LoadingSpinner';

// Protected route: redirects to login if not authenticated
const ProtectedRoute = ({ children, requiredRole }) => {
    const { user, loading } = useAuth();

    if (loading) return <LoadingSpinner fullscreen message="Loading…" />;

    if (!user) return <Navigate to="/login" replace />;

    if (requiredRole && user.role !== requiredRole) {
        return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />;
    }

    return children;
};

const AppRoutes = () => {
    const { user, loading } = useAuth();

    if (loading) return <LoadingSpinner fullscreen message="Loading…" />;

    return (
        <Routes>
            <Route
                path="/login"
                element={
                    user ? (
                        <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />
                    ) : (
                        <Login />
                    )
                }
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
                path="/profile"
                element={
                    <ProtectedRoute>
                        <Profile />
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
