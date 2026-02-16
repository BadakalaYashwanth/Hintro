import React from 'react';
import { useBoard } from '../context/BoardContext'; // Import hook to access global board state
import './ActivityLog.css'; // Import styles

/**
 * ActivityLog Component
 * 
 * Purpose: Displays a list of recent actions performed on the board (e.g., "Task created", "Task moved").
 * It reads the 'activityLog' array from the global BoardContext state.
 */
const ActivityLog = () => {
    // Access the global state which contains the activityLog array
    const { state } = useBoard();

    // Ensure 'logs' is always an array to prevent crashes if state is undefined
    const logs = state.activityLog || [];

    // Limits the display to the most recent 10 items for cleaner UI
    const recentLogs = logs.slice(0, 10);

    return (
        <div className="activity-log">
            <h3>Activity Log</h3>
            {recentLogs.length === 0 ? (
                <p className="empty-log">No activity yet.</p>
            ) : (
                <ul className="log-list">
                    {recentLogs.map((log) => (
                        <li key={log.id} className="log-item">
                            <span className="log-time">{new Date(log.timestamp).toLocaleTimeString()}</span>
                            <span className="log-action">{log.action}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default ActivityLog;
