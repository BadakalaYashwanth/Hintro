import React from 'react';
import { useBoard } from '../context/BoardContext';
import './ActivityLog.css';

const ActivityLog = () => {
    const { state } = useBoard();

    // Safety check for activityLog being undefined (though context initializes it)
    const logs = state.activityLog || [];
    const recentLogs = logs.slice(0, 10); // Display only latest 10

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
