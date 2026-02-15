import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Import useAuth hook

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuth(); // Destructure isAuthenticated and isLoading from useAuth

    if (isLoading) {
        return <div>Loading...</div>; // Show a loading indicator while checking auth state
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;
