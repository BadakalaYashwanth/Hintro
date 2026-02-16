import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext'; // Hook for authentication actions (logout)
import { useBoard, ADD_TASK, MOVE_TASK, RESET_BOARD } from '../context/BoardContext'; // Hook for board state and actions
import { useNavigate } from 'react-router-dom';
import {
    DndContext,
    closestCorners,
    useSensor,
    useSensors,
    PointerSensor,
    KeyboardSensor,
    DragOverlay
} from '@dnd-kit/core'; // Core DnD library components
import {
    sortableKeyboardCoordinates,
    useSortable,
    SortableContext,
    verticalListSortingStrategy
} from '@dnd-kit/sortable'; // Sortable helpers for drag-and-drop lists
import { CSS } from '@dnd-kit/utilities';

import './TaskBoard.css'; // Board specific styles
import '../components/TaskCard.css';
import TaskCard from '../components/TaskCard'; // Component to render individual task cards
import ActivityLog from '../components/ActivityLog'; // Component to show board history

/**
 * SortableTask Component
 * 
 * Purpose: A wrapper around TaskCard that gives it drag-and-drop capabilities.
 * It uses the 'useSortable' hook to connect the card to the dnd-kit system.
 */
const SortableTask = ({ task }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: task.id, data: { task } });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
    };

    return (
        <TaskCard
            task={task}
            dragRef={setNodeRef}
            style={style}
            attributes={attributes}
            listeners={listeners}
            isDragging={isDragging}
        />
    );
};

/**
 * TaskBoard Component
 * 
 * Purpose: The main container for the Kanban board application.
 * Responsibilities:
 * 1. Manages local state for new task inputs, searching, and filtering.
 * 2. Integrates with 'useBoard' to get global tasks and dispatch actions.
 * 3. Sets up the Drag-and-Drop context (sensors, collision detection).
 * 4. Renders the board columns and the activity log.
 */
const TaskBoard = () => {
    // Access global state and actions
    const { logout } = useAuth();
    const { state, dispatch } = useBoard();
    const navigate = useNavigate();

    // Local state for the "Add Task" form
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskPriority, setNewTaskPriority] = useState('medium');
    const [newTaskDueDate, setNewTaskDueDate] = useState('');

    // Local state for Searching, Filtering, and Sorting
    const [searchQuery, setSearchQuery] = useState('');
    const [priorityFilter, setPriorityFilter] = useState('all');
    const [sortByDate, setSortByDate] = useState(false);

    // State to track which item is currently being dragged (for overlay)
    const [activeId, setActiveId] = useState(null);

    // Dnd Sensors: Define how drag interactions are detected (Pointer = Mouse/Touch, Keyboard)
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5, // Drag must move 5px before starting (prevents accidental clicks)
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates, // Improved keyboard navigation
        })
    );

    // Handle user logout
    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Handle resetting the entire board
    const handleReset = () => {
        if (window.confirm("Are you sure you want to reset the board? All tasks will be deleted.")) {
            dispatch({ type: RESET_BOARD });
        }
    };

    // Handle creating a new task
    const handleAddTask = (e) => {
        e.preventDefault();
        if (!newTaskTitle.trim()) return;

        dispatch({
            type: ADD_TASK,
            payload: {
                title: newTaskTitle,
                description: '',
                priority: newTaskPriority,
                dueDate: newTaskDueDate || null,
                status: 'todo' // Default status
            }
        });
        // Reset form fields
        setNewTaskTitle('');
        setNewTaskPriority('medium');
        setNewTaskDueDate('');
    };

    // Callback when dragging starts
    const handleDragStart = (event) => {
        setActiveId(event.active.id); // Track the Active ID to render a drag overlay
    };

    // Callback when dragging ends (drop)
    const handleDragEnd = (event) => {
        const { active, over } = event;
        setActiveId(null); // Clear active ID

        if (!over) return; // Dropped outside a valid area

        const activeId = active.id;
        const overId = over.id;

        // Find the full task object being moved
        const activeTask = state.tasks.find(t => t.id === activeId);
        if (!activeTask) return;

        // Determine destination status based on where it was dropped
        let newStatus = activeTask.status;

        // Check if dropped directly on a Column container (e.g., "Done" column empty space)
        if (['todo-column', 'doing-column', 'done-column'].includes(overId)) {
            newStatus = overId.replace('-column', '');
        } else {
            // Dropped on another task, inherit that task's status
            const overTask = state.tasks.find(t => t.id === overId);
            if (overTask) {
                newStatus = overTask.status;
            }
        }

        // If status changed, dispatch the move action
        if (activeTask.status !== newStatus) {
            dispatch({
                type: MOVE_TASK,
                payload: {
                    id: activeId,
                    newStatus: newStatus
                }
            });
        }

        // Note: For real reordering within same column, we would also need REORDER_TASK action.
        // But prompt only asked for dragging between columns to update status.
        // SortableContext handles the visual reordering during drag, but we need to persist order if that was required.
        // Assuming simple status update is sufficient based on "Dropping a task updates its status".
    };

    // Derived State: Filter and Sort tasks before rendering
    const filteredTasks = state.tasks.filter(task => {
        // partial match on title (case insensitive)
        const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
        // match specific priority or 'all'
        const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
        return matchesSearch && matchesPriority;
    }).sort((a, b) => {
        // Optional sorting by due date
        if (!sortByDate) return 0; // Keep insertion order
        if (!a.dueDate) return 1; // Tasks without date go to bottom
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
    });

    // Categorize tasks into columns based on status
    const todoTasks = filteredTasks.filter(t => t.status === 'todo');
    const doingTasks = filteredTasks.filter(t => t.status === 'doing');
    const doneTasks = filteredTasks.filter(t => t.status === 'done');

    const activeTask = activeId ? state.tasks.find(t => t.id === activeId) : null;

    /**
     * Column Component
     * Renders a vertical list of tasks for a specific status.
     * Uses 'SortableContext' to enable reordering within the list.
     */
    const Column = ({ id, title, tasks }) => (
        <div className="board-column">
            <h3>{title} <span className="count">{tasks.length}</span></h3>
            <SortableContext
                id={id}
                items={tasks.map(t => t.id)}
                strategy={verticalListSortingStrategy}
            >
                <div className="task-list" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <DroppableContainer id={id}>
                        {tasks.map(task => (
                            <SortableTask key={task.id} task={task} />
                        ))}
                    </DroppableContainer>
                </div>
            </SortableContext>
        </div>
    );

    /**
     * DroppableContainer Component
     * A utility wrapper that makes the column body a valid drop target.
     * This ensures you can drop a task into an empty column.
     */
    const DroppableContainer = ({ id, children }) => {
        const { setNodeRef: setDroppableRef } = useSortable({
            id: id,
            disabled: true // Disable sorting for the container itself (it's stationary)
        });

        return (
            <div ref={setDroppableRef} style={{ minHeight: '100%', flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {children}
            </div>
        );
    };

    return (
        // Main Drag-and-Drop Context Provider
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners} // Algorithm to detect which container is under the dragged item
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="board-container">
                <header className="board-header">
                    <h1>Task Board</h1>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button onClick={handleReset} className="reset-btn">Reset Board</button>
                        <button onClick={handleLogout} className="logout-btn">Logout</button>
                    </div>
                </header>

                <div className="board-controls">
                    <div className="add-task-form">
                        <input
                            type="text"
                            placeholder="New Task Title"
                            value={newTaskTitle}
                            onChange={(e) => setNewTaskTitle(e.target.value)}
                            className="input-title"
                        />
                        <select
                            value={newTaskPriority}
                            onChange={e => setNewTaskPriority(e.target.value)}
                            className="input-priority"
                        >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                        </select>
                        <input
                            type="date"
                            value={newTaskDueDate}
                            onChange={(e) => setNewTaskDueDate(e.target.value)}
                            className="input-date"
                        />
                        <button onClick={handleAddTask} className="add-btn">Add Task</button>
                    </div>

                    <div className="filter-controls">
                        <input
                            type="text"
                            placeholder="Search tasks..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="search-input"
                        />
                        <select
                            value={priorityFilter}
                            onChange={(e) => setPriorityFilter(e.target.value)}
                            className="filter-select"
                        >
                            <option value="all">All Priorities</option>
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                        </select>
                        <label className="sort-label">
                            <input
                                type="checkbox"
                                checked={sortByDate}
                                onChange={(e) => setSortByDate(e.target.checked)}
                            />
                            Sort by Date
                        </label>
                    </div>
                </div>

                <div className="columns-container">
                    <Column id="todo-column" title="To Do" tasks={todoTasks} />
                    <Column id="doing-column" title="Doing" tasks={doingTasks} />
                    <Column id="done-column" title="Done" tasks={doneTasks} />
                </div>

                <div className="activity-log-container">
                    <ActivityLog />
                </div>

                <DragOverlay>
                    {activeTask ? <TaskCard task={activeTask} isDragging /> : null}
                </DragOverlay>
            </div>
        </DndContext>
    );
};

export default TaskBoard;
