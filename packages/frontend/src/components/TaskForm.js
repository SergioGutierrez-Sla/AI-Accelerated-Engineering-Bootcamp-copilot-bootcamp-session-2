import React, { useState } from 'react';
import { Tooltip, Typography } from '@mui/material';
import TaskFields from './TaskFields';

const initialFormState = {
  name: '',
  description: '',
  dueDate: '',
};

function TaskForm({ onSubmit, submitting }) {
  const [formValues, setFormValues] = useState(initialFormState);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues((currentValues) => ({
      ...currentValues,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formValues.name.trim()) {
      return;
    }

    await onSubmit({
      name: formValues.name.trim(),
      description: formValues.description.trim(),
      dueDate: formValues.dueDate || null,
    });

    setFormValues(initialFormState);
  };

  return (
    <section className="task-panel" aria-labelledby="create-task-title">
      <Typography component="h2" variant="h5" id="create-task-title">
        Create Task
      </Typography>
      <Typography className="task-panel__subtitle" variant="body2">
        Start with the new task model by capturing a name, extra detail, and an optional due date.
      </Typography>
      <form className="task-form" onSubmit={handleSubmit}>
        <TaskFields formValues={formValues} onChange={handleChange} />
        <div className="task-form__actions">
          <Tooltip enterDelay={3000} title="Create a new task">
            <button className="btn btn-success" disabled={submitting} type="submit">
              {submitting ? 'Saving...' : 'Add Task'}
            </button>
          </Tooltip>
        </div>
      </form>
    </section>
  );
}

export default TaskForm;