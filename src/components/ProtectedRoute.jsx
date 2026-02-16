import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom'; // Import Navigate component for redirection
import { useAuth } from '../context/AuthContext'; // Import custom hook to access authentication state

/**
 * ProtectedRoute Component
 * 
 * Purpose: This component protects routes that require authentication.
 * It checks if the user is authenticated. If so, it renders the child components (the protected page).
 * If not, it redirects the user to the login page.
 */
const ProtectedRoute = ({ children }) => {
    // Access authentication status and loading state from the AuthContext
    const { isAuthenticated, isLoading } = useAuth();

    // If the authentication status is still being determined, show a loading message
    if (isLoading) {
        return <div>Loading...</div>;
    }

    // If the user is NOT authenticated, redirect them to the /login page.
    // 'replace' prevents the user from going back to this page using the browser's back button.
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // If authenticated, render the children (the protected content)
    return children;
};

export default ProtectedRoute;
