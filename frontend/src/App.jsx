import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Home from './pages/Home';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import CitizenDashboard from './pages/Citizen/Dashboard';
import OfficialDashboard from './pages/Official/Dashboard';
import AdminDashboard from './pages/Admin/Dashboard';

const PrivateRoute = ({ children, allowedRoles }) => {
    const token = localStorage.getItem('token');
    if (!token) return <Navigate to="/login" />;
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (!allowedRoles.includes(payload.role)) return <Navigate to="/login" />;
        return children;
    } catch {
        return <Navigate to="/login" />;
    }
};

function App() {
    return (
        <Router>
            <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                <Route path="/citizen" element={
                    <PrivateRoute allowedRoles={['citizen']}>
                        <CitizenDashboard />
                    </PrivateRoute>
                } />

                <Route path="/official" element={
                    <PrivateRoute allowedRoles={['official']}>
                        <OfficialDashboard />
                    </PrivateRoute>
                } />

                <Route path="/admin" element={
                    <PrivateRoute allowedRoles={['admin']}>
                        <AdminDashboard />
                    </PrivateRoute>
                } />

                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </Router>
    );
}

export default App;
