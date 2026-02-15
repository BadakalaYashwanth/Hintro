import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import TaskBoard from './pages/TaskBoard';
import { AuthProvider } from './context/AuthContext';
import { BoardProvider } from './context/BoardContext'; // Import BoardProvider

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <BoardProvider> {/* Wrap with BoardProvider */}
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/board"
              element={
                <ProtectedRoute>
                  <TaskBoard />
                </ProtectedRoute>
              }
            />
            {/* Redirect root to board (protected, so will go to login) or login directly */}
            <Route path="*" element={<Navigate to="/board" replace />} />
          </Routes>
        </BoardProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
