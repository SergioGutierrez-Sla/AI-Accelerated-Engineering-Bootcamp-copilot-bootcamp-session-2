import React from 'react';
import { Card, CardContent, Chip, Stack, Tooltip, Typography } from '@mui/material';
import { formatTaskDueDate, isTaskDueSoon } from '../utils/taskUtils';

function TaskItem({ task, onDelete, onEdit }) {
  const dueSoon = isTaskDueSoon(task);
  const canEdit = task.status === 'pending';

  return (
    <li>
      <Card
        className={dueSoon ? 'task-card task-card--due-soon' : 'task-card'}
        data-testid={`task-card-${task.id}`}
        variant="outlined"
      >
        <CardContent>
          <div className="task-card__header">
            <div>
              <Typography component="h3" variant="h6">
                {task.name}
              </Typography>
              <Typography color="text.secondary" variant="body2">
                {task.description || 'No description yet.'}
              </Typography>
            </div>
            <Chip color={task.status === 'completed' ? 'default' : 'primary'} label={task.status} size="small" />
          </div>
          <Stack className="task-card__meta" direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <Typography variant="body2">Due: {formatTaskDueDate(task.dueDate)}</Typography>
            <Typography variant="body2">Created: {formatTaskDueDate(task.createdAt)}</Typography>
          </Stack>
          <div className="task-card__actions">
            {canEdit && (
              <Tooltip enterDelay={3000} title="Edit this pending task">
                <button className="btn btn-info btn-sm" onClick={() => onEdit(task)} type="button">
                  Edit
                </button>
              </Tooltip>
            )}
            <Tooltip enterDelay={3000} title="Delete this task">
              <button className="btn btn-outline-danger btn-sm" onClick={() => onDelete(task)} type="button">
                Delete
              </button>
            </Tooltip>
          </div>
        </CardContent>
      </Card>
    </li>
  );
}

export default TaskItem;