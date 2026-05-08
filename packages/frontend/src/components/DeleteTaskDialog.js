import React from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Tooltip,
  Typography,
} from '@mui/material';

function DeleteTaskDialog({ onClose, onConfirm, open, submitting, task }) {
  return (
    <Dialog fullWidth maxWidth="xs" onClose={submitting ? undefined : onClose} open={open}>
      <DialogTitle>Confirm Task Deletion</DialogTitle>
      <DialogContent>
        <Typography>
          Delete <strong>{task?.name || 'this task'}</strong>? This action cannot be undone.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Tooltip enterDelay={3000} title="Keep this task and close the dialog">
          <button className="btn btn-outline-secondary" disabled={submitting} onClick={onClose} type="button">
            Cancel
          </button>
        </Tooltip>
        <Tooltip enterDelay={3000} title="Permanently delete this task">
          <button className="btn btn-danger" disabled={submitting} onClick={onConfirm} type="button">
            {submitting ? 'Deleting...' : 'Confirm Delete'}
          </button>
        </Tooltip>
      </DialogActions>
    </Dialog>
  );
}

export default DeleteTaskDialog;