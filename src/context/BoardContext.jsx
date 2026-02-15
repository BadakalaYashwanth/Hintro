import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Simple ID generator
const generateId = () => Math.random().toString(36).substr(2, 9);
const timestamp = () => new Date().toISOString();

const BoardContext = createContext();

const initialState = {
    tasks: [],
    activityLog: []
};

// Action types
export const ADD_TASK = 'ADD_TASK';
export const UPDATE_TASK = 'UPDATE_TASK';
export const DELETE_TASK = 'DELETE_TASK';
export const MOVE_TASK = 'MOVE_TASK';
export const RESET_BOARD = 'RESET_BOARD';
export const SET_STATE = 'SET_STATE';

const boardReducer = (state, action) => {
    switch (action.type) {
        case SET_STATE:
            return action.payload;

        case RESET_BOARD:
            return {
                tasks: [],
                activityLog: []
            };

        case ADD_TASK:
            const newTask = {
                id: generateId(),
                title: action.payload.title,
                description: action.payload.description || '',
                priority: action.payload.priority || 'medium', // low, medium, high
                dueDate: action.payload.dueDate || null,
                tags: action.payload.tags || [],
                status: 'todo', // Default status: todo, doing, done
                createdAt: timestamp()
            };

            const addLog = {
                id: generateId(),
                action: `Task "${newTask.title}" created`,
                timestamp: timestamp()
            };

            return {
                ...state,
                tasks: [...state.tasks, newTask],
                activityLog: [addLog, ...state.activityLog] // Newest logs first
            };

        case UPDATE_TASK:
            {
                const { id, updates } = action.payload;
                const updatedTasks = state.tasks.map(task =>
                    task.id === id ? { ...task, ...updates } : task
                );

                const task = state.tasks.find(t => t.id === id);
                const taskTitle = task?.title || 'Task';

                const updateLog = {
                    id: generateId(),
                    action: `Task "${taskTitle}" updated`,
                    timestamp: timestamp()
                };

                return {
                    ...state,
                    tasks: updatedTasks,
                    activityLog: [updateLog, ...state.activityLog]
                };
            }

        case MOVE_TASK:
            {
                const { id, newStatus } = action.payload;
                const movedTasks = state.tasks.map(task =>
                    task.id === id ? { ...task, status: newStatus } : task
                );

                const task = state.tasks.find(t => t.id === id);
                const moveLog = {
                    id: generateId(),
                    action: `Task "${task?.title || 'Unknown'}" moved to ${newStatus}`,
                    timestamp: timestamp()
                };

                return {
                    ...state,
                    tasks: movedTasks,
                    activityLog: [moveLog, ...state.activityLog]
                };
            }

        case DELETE_TASK:
            {
                const taskToDelete = state.tasks.find(t => t.id === action.payload);
                const deleteLog = {
                    id: generateId(),
                    action: `Task "${taskToDelete?.title || 'Unknown'}" deleted`,
                    timestamp: timestamp()
                };

                return {
                    ...state,
                    tasks: state.tasks.filter(task => task.id !== action.payload),
                    activityLog: [deleteLog, ...state.activityLog]
                };
            }

        default:
            return state;
    }
};

export const BoardProvider = ({ children }) => {
    const [state, dispatch] = useReducer(boardReducer, initialState);

    // Load from localStorage on mount
    useEffect(() => {
        const storedState = localStorage.getItem('boardState');
        if (storedState) {
            try {
                const parsed = JSON.parse(storedState);
                if (parsed && Array.isArray(parsed.tasks) && Array.isArray(parsed.activityLog)) {
                    dispatch({ type: SET_STATE, payload: parsed });
                }
            } catch (e) {
                console.error("Failed to parse board state", e);
            }
        }
    }, []);

    // Save to localStorage on change
    useEffect(() => {
        // Avoid saving initial empty state if we haven't loaded yet? 
        // Actually, initializing with empty and then loading is fine.
        // If we load and it's empty, we save empty.
        // We should differentiate between "initial load" and "subsequent updates" if we want to be safe,
        // but React's effect timing usually handles this okay for simple apps.
        // However, to be safe, let's only save if we have *something* or if we explicitly want to save empty.
        // With current reducer, state is always valid object.
        if (state !== initialState) {
            localStorage.setItem('boardState', JSON.stringify(state));
        }
    }, [state]);

    return (
        <BoardContext.Provider value={{ state, dispatch }}>
            {children}
        </BoardContext.Provider>
    );
};

export const useBoard = () => {
    const context = useContext(BoardContext);
    if (!context) {
        throw new Error('useBoard must be used within a BoardProvider');
    }
    return context;
};
