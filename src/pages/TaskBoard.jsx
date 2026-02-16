import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useBoard, ADD_TASK, MOVE_TASK, RESET_BOARD } from '../context/BoardContext';
import { useNavigate } from 'react-router-dom';
import {
    DndContext,
    closestCorners,
    useSensor,
    useSensors,
    PointerSensor,
    KeyboardSensor,
    defaultDropAnimationSideEffects,
    DragOverlay
} from '@dnd-kit/core';
import {
    sortableKeyboardCoordinates,
    useSortable,
    SortableContext,
    verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import './TaskBoard.css';
import '../components/TaskCard.css'; // Ensure TaskCard styles are loaded
import TaskCard from '../components/TaskCard';
import ActivityLog from '../components/ActivityLog';

// SortableTask Wrapper
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

const TaskBoard = () => {
    const { logout } = useAuth();
    const { state, dispatch } = useBoard();
    const navigate = useNavigate();
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskPriority, setNewTaskPriority] = useState('medium');
    const [newTaskDueDate, setNewTaskDueDate] = useState('');

    // Search & Filter State
    const [searchQuery, setSearchQuery] = useState('');
    const [priorityFilter, setPriorityFilter] = useState('all');
    const [sortByDate, setSortByDate] = useState(false);

    // Dnd State
    const [activeId, setActiveId] = useState(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleReset = () => {
        if (window.confirm("Are you sure you want to reset the board? All tasks will be deleted.")) {
            dispatch({ type: RESET_BOARD });
        }
    };

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
                status: 'todo'
            }
        });
        setNewTaskTitle('');
        setNewTaskPriority('medium');
        setNewTaskDueDate('');
    };

    const handleDragStart = (event) => {
        setActiveId(event.active.id);
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        setActiveId(null);

        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        // Find the task being moved
        const activeTask = state.tasks.find(t => t.id === activeId);
        if (!activeTask) return;

        // Determine destination status
        let newStatus = activeTask.status;

        // Check if dropped on a column container directly
        if (['todo-column', 'doing-column', 'done-column'].includes(overId)) {
            newStatus = overId.replace('-column', '');
        } else {
            // Dropped on another task, find that task's status
            const overTask = state.tasks.find(t => t.id === overId);
            if (overTask) {
                newStatus = overTask.status;
            }
        }

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

    // Derived State (Filtering & Sorting)
    const filteredTasks = state.tasks.filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
        return matchesSearch && matchesPriority;
    }).sort((a, b) => {
        if (!sortByDate) return 0; // Default order (creation time usually, or id)
        if (!a.dueDate) return 1; // No due date last
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
    });

    const todoTasks = filteredTasks.filter(t => t.status === 'todo');
    const doingTasks = filteredTasks.filter(t => t.status === 'doing');
    const doneTasks = filteredTasks.filter(t => t.status === 'done');

    const activeTask = activeId ? state.tasks.find(t => t.id === activeId) : null;

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

    // Helper for Droppable area (Column body)
    const DroppableContainer = ({ id, children }) => {
        const { setNodeRef: setDroppableRef } = useSortable({
            id: id,
            disabled: true // Disable sorting for container itself
        });

        return (
            <div ref={setDroppableRef} style={{ minHeight: '100%', flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {children}
            </div>
        );
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
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
