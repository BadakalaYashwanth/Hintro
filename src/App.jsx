import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'; // Import React Router for navigation
import ProtectedRoute from './components/ProtectedRoute'; // Wrapper to protect routes requiring authentication
import Login from './pages/Login'; // Login page component
import TaskBoard from './pages/TaskBoard'; // Main Task Board page component
import { AuthProvider } from './context/AuthContext'; // Context provider for authentication state
import { BoardProvider } from './context/BoardContext'; // Context provider for board data (tasks, columns)

function App() {
  return (
    // BrowserRouter enables client-side routing
    <BrowserRouter>
      {/* AuthProvider makes authentication state (user, login/logout) available to the app */}
      <AuthProvider>
        {/* BoardProvider makes task data and board actions available to the app */}
        <BoardProvider>
          <Routes>
            {/* Route for the Login page */}
            <Route path="/login" element={<Login />} />

            {/* 
              Route for the main Board page. 
              It is wrapped in ProtectedRoute to ensure only authenticated users can access it. 
            */}
            <Route
              path="/board"
              element={
                <ProtectedRoute>
                  <TaskBoard />
                </ProtectedRoute>
              }
            />

            {/* Catch-all route: redirects any unknown paths to the board (which then checks auth) */}
            <Route path="*" element={<Navigate to="/board" replace />} />
          </Routes>
        </BoardProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
