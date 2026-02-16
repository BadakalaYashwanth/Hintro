import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Utility functions for generating unique IDs and timestamps
const generateId = () => Math.random().toString(36).substr(2, 9);
const timestamp = () => new Date().toISOString();

// Create the context for Board data
const BoardContext = createContext();

// Initial state for the reducer
const initialState = {
    tasks: [],       // Array to hold all task objects
    activityLog: []  // Array to hold history of actions for the activity log
};

// Action types for the reducer to switch on
export const ADD_TASK = 'ADD_TASK';
export const UPDATE_TASK = 'UPDATE_TASK';
export const DELETE_TASK = 'DELETE_TASK';
export const MOVE_TASK = 'MOVE_TASK';      // For drag and drop status changes
export const RESET_BOARD = 'RESET_BOARD';  // To clear all data
export const SET_STATE = 'SET_STATE';      // To hydrate state from localStorage

/**
 * Board Reducer
 * 
 * Handles all state transitions for the board.
 * - state: Current state of the board (tasks, logs)
 * - action: Object containing 'type' and 'payload'
 */
const boardReducer = (state, action) => {
    switch (action.type) {
        // Hydrate state from external source (localStorage)
        case SET_STATE:
            return action.payload;

        // Reset the board to empty state
        case RESET_BOARD:
            return {
                tasks: [],
                activityLog: []
            };

        // Add a new task to the list
        case ADD_TASK:
            const newTask = {
                id: generateId(),
                title: action.payload.title,
                description: action.payload.description || '',
                priority: action.payload.priority || 'medium', // Default priority
                dueDate: action.payload.dueDate || null,
                tags: action.payload.tags || [],
                status: 'todo', // New tasks start in 'To Do'
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
                activityLog: [addLog, ...state.activityLog] // Prepend new log
            };

        // Update properties of an existing task
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

        // Change the status of a task (e.g., Todo -> Doing)
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

        // Remove a task from the board
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

/**
 * BoardProvider Component
 * 
 * Provides the board state and dispatch function to its children.
 * Handles persistence of board data to localStorage.
 */
export const BoardProvider = ({ children }) => {
    const [state, dispatch] = useReducer(boardReducer, initialState);

    // Effect: Load state from localStorage when the component mounts
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

    // Effect: Save state to localStorage whenever it changes
    useEffect(() => {
        // Prevent overwriting storage with initial empty state unless explicitly intended?
        // Logic here simply saves non-default states
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

// Custom hook to consume the BoardContext
export const useBoard = () => {
    const context = useContext(BoardContext);
    if (!context) {
        throw new Error('useBoard must be used within a BoardProvider');
    }
    return context;
};
