import React from 'react';
import { Alert, Typography } from '@mui/material';
import TaskItem from './TaskItem';

function TaskList({ error, loading, tasks, onDelete, onEdit, sortBy }) {
  const sortLabel = sortBy === 'dueDate' ? 'closest due date' : sortBy;

  return (
    <section className="task-panel" aria-labelledby="task-list-title">
      <Typography component="h2" variant="h5" id="task-list-title">
        Task Overview
      </Typography>
      <Typography className="task-panel__subtitle" variant="body2">
        Tasks are currently ordered by {sortLabel} so the current focus stays visible.
      </Typography>
      {loading && <p>Loading tasks...</p>}
      {error && <Alert severity="error">{error}</Alert>}
      {!loading && !error && tasks.length === 0 && <p>No tasks found. Add your first one.</p>}
      {!loading && !error && tasks.length > 0 && (
        <ul className="task-list">
          {tasks.map((task) => (
            <TaskItem key={task.id} onDelete={onDelete} onEdit={onEdit} task={task} />
          ))}
        </ul>
      )}
    </section>
  );
}

export default TaskList;