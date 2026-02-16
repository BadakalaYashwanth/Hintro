import React, { useState } from 'react';
import { useBoard, DELETE_TASK, UPDATE_TASK } from '../context/BoardContext'; // Import context to access board actions (delete, update)
import './TaskCard.css'; // Import styles for the task card

/**
 * TaskCard Component
 * 
 * Purpose: This component displays the details of a single task (title, description, priority, etc.).
 * It also handles:
 * 1. Editing the task (switching to an edit form).
 * 2. Deleting the task.
 * 3. Drag-and-drop functionality (receiving drag props from its parent).
 * 
 * Usage: Used inside the 'Column' component to render each item in the task list.
 */
const TaskCard = ({ task, dragRef, style, attributes, listeners, isDragging }) => {
    // Access the 'dispatch' function from BoardContext to send actions to the global state
    const { dispatch } = useBoard();

    // Local state to toggle between 'view' mode and 'edit' mode
    const [isEditing, setIsEditing] = useState(false);

    // Local state to temporary hold form data while editing
    const [editForm, setEditForm] = useState({ ...task });

    const handleDelete = () => {
        if (window.confirm(`Are you sure you want to delete "${task.title}"?`)) {
            dispatch({ type: DELETE_TASK, payload: task.id });
        }
    };

    const handleSave = (e) => {
        e.preventDefault();
        dispatch({
            type: UPDATE_TASK,
            payload: {
                id: task.id,
                updates: {
                    title: editForm.title,
                    description: editForm.description,
                    priority: editForm.priority,
                    dueDate: editForm.dueDate,
                    tags: editForm.tags
                }
            }
        });
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditForm({ ...task });
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <div className={`task-card editing`}>
                <form onSubmit={handleSave} className="edit-form">
                    <input
                        value={editForm.title}
                        onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                        required
                    />
                    <textarea
                        value={editForm.description}
                        onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                    />
                    <div className="form-row">
                        <select
                            value={editForm.priority}
                            onChange={e => setEditForm({ ...editForm, priority: e.target.value })}
                        >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                        </select>
                        <input
                            type="date"
                            value={editForm.dueDate || ''}
                            onChange={e => setEditForm({ ...editForm, dueDate: e.target.value })}
                        />
                    </div>
                    <div className="button-group">
                        <button type="submit" className="save-btn">Save</button>
                        <button type="button" onClick={handleCancel} className="cancel-btn">Cancel</button>
                    </div>
                </form>
            </div>
        );
    }

    // Default style processing if not passed from parent (fallback)
    const cardStyle = style || attributes?.style;

    return (
        <div
            className={`task-card ${isDragging ? 'is-dragging' : ''}`}
            ref={dragRef || attributes?.ref}
            style={cardStyle}
            {...listeners} // Listeners for drag handle
            {...attributes}
        >
            <div className="task-header">
                <h4>{task.title}</h4>
                <div className="task-actions">
                    <button onClick={() => setIsEditing(true)} onPointerDown={(e) => e.stopPropagation()} aria-label="Edit">✎</button>
                    <button onClick={handleDelete} onPointerDown={(e) => e.stopPropagation()} aria-label="Delete" className="delete-icon">×</button>
                </div>
            </div>

            {task.description && <p className="task-description">{task.description}</p>}

            <div className="task-meta">
                <span className={`priority ${task.priority}`}>{task.priority}</span>
                {task.dueDate && <span className="due-date">📅 {new Date(task.dueDate).toLocaleDateString()}</span>}
            </div>
        </div>
    );
};

export default TaskCard;
