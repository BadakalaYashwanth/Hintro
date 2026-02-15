import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { BoardProvider, MOVE_TASK } from './context/BoardContext';
import { AuthProvider } from './context/AuthContext';
import TaskBoard from './pages/TaskBoard';
import { MemoryRouter } from 'react-router-dom';

// Wrapper for tests
const Wrapper = ({ children }) => (
    <MemoryRouter>
        <AuthProvider>
            <BoardProvider>
                {children}
            </BoardProvider>
        </AuthProvider>
    </MemoryRouter>
);

describe('TaskBoard', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('renders the task board with columns', () => {
        render(<TaskBoard />, { wrapper: Wrapper });
        expect(screen.getByText(/Task Board/i)).toBeInTheDocument();
        expect(screen.getByText('To Do')).toBeInTheDocument();
        expect(screen.getByText('Doing')).toBeInTheDocument();
        expect(screen.getByText('Done')).toBeInTheDocument();
    });

    it('adds a new task', async () => {
        render(<TaskBoard />, { wrapper: Wrapper });

        // Find inputs
        const titleInput = screen.getByPlaceholderText('New Task Title');
        const addButton = screen.getByText('Add Task');

        // Add task
        fireEvent.change(titleInput, { target: { value: 'Test Task' } });
        fireEvent.click(addButton);

        // Check if task exists in "To Do"
        expect(await screen.findByText('Test Task')).toBeInTheDocument();
        // Check initial status logic by finding it in board (simplified by text presence)
    });

    it('persists tasks after refresh', async () => {
        // Render and add task
        const { unmount } = render(<TaskBoard />, { wrapper: Wrapper });
        const titleInput = screen.getByPlaceholderText('New Task Title');
        const addButton = screen.getByText('Add Task');

        fireEvent.change(titleInput, { target: { value: 'Persisted Task' } });
        fireEvent.click(addButton);

        // Verify it was saved to localStorage (BoardProvider syncs to localStorage)
        const storedState = JSON.parse(localStorage.getItem('boardState'));
        expect(storedState).not.toBeNull();
        expect(storedState.tasks.length).toBe(1);
        expect(storedState.tasks[0].title).toBe('Persisted Task');

        // Unmount (simulate refresh)
        unmount();

        // Re-render and check if it loads from localStorage
        render(<TaskBoard />, { wrapper: Wrapper });
        expect(await screen.findByText('Persisted Task')).toBeInTheDocument();
    });
});
