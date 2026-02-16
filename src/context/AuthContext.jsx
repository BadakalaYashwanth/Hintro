import React, { createContext, useState, useEffect, useContext } from 'react';

// Create a Context object to hold authentication state
const AuthContext = createContext();

// Custom hook to easily access the AuthContext values
export const useAuth = () => useContext(AuthContext);

/**
 * AuthProvider Component
 * 
 * Purpose: Manages the authentication state of the application.
 * It provides functions to login and logout, and persists the authentication status using localStorage.
 */
export const AuthProvider = ({ children }) => {
    // State to track if the user is logged in
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    // State to track if the initial authentication check is in progress
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Upon component mount, check local storage to see if the user was previously authenticated
        const storedAuth = localStorage.getItem('isAuthenticated');
        if (storedAuth === 'true') {
            setIsAuthenticated(true); // Restore authentication state
        }
        setIsLoading(false); // Finished loading check
    }, []);

    // Function to handle user login
    const login = (email, password, rememberMe) => {
        // Hardcoded credentials for demonstration purposes
        if (email === 'intern@demo.com' && password === 'intern123') {
            setIsAuthenticated(true);
            // If the user chose "Remember Me", save the state to localStorage
            if (rememberMe) {
                localStorage.setItem('isAuthenticated', 'true');
            }
            return true; // Login successful
        }
        return false; // Login failed
    };

    // Function to handle user logout
    const logout = () => {
        setIsAuthenticated(false);
        localStorage.removeItem('isAuthenticated'); // Clear persisted state
    };

    // Values to be exposed to consuming components
    const value = {
        isAuthenticated,
        login,
        logout,
        isLoading
    };

    return (
        // Provide the auth state and functions to all child components
        <AuthContext.Provider value={value}>
            {/* Only render children once the initial loading check is complete */}
            {!isLoading && children}
        </AuthContext.Provider>
    );
};
