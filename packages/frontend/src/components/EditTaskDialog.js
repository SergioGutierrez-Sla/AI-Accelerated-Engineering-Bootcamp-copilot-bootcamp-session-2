import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Tooltip,
} from '@mui/material';
import TaskFields from './TaskFields';

function createFormValues(task) {
  return {
    name: task?.name ?? '',
    description: task?.description ?? '',
    dueDate: task?.dueDate ?? '',
  };
}

function EditTaskDialog({ onClose, onSubmit, open, submitting, task }) {
  const [formValues, setFormValues] = useState(createFormValues(task));

  useEffect(() => {
    setFormValues(createFormValues(task));
  }, [task]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues((currentValues) => ({
      ...currentValues,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!task || !formValues.name.trim()) {
      return;
    }

    await onSubmit(task.id, {
      name: formValues.name.trim(),
      description: formValues.description.trim(),
      dueDate: formValues.dueDate || null,
      status: task.status,
    });
  };

  return (
    <Dialog fullWidth maxWidth="sm" onClose={submitting ? undefined : onClose} open={open}>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Edit Pending Task</DialogTitle>
        <DialogContent>
          <TaskFields formValues={formValues} onChange={handleChange} />
        </DialogContent>
        <DialogActions>
          <Tooltip enterDelay={3000} title="Close without saving changes">
            <button className="btn btn-outline-secondary" disabled={submitting} onClick={onClose} type="button">
              Cancel
            </button>
          </Tooltip>
          <Tooltip enterDelay={3000} title="Save changes to this pending task">
            <button className="btn btn-info" disabled={submitting} type="submit">
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </Tooltip>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default EditTaskDialog;