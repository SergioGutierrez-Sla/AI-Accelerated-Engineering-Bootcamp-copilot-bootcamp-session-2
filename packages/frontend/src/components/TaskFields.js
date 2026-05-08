import React from 'react';
import { Stack, TextField } from '@mui/material';

function TaskFields({ formValues, onChange }) {
  return (
    <Stack spacing={2}>
      <TextField
        required
        label="Task name"
        name="name"
        onChange={onChange}
        value={formValues.name}
      />
      <TextField
        label="Description"
        multiline
        minRows={3}
        name="description"
        onChange={onChange}
        value={formValues.description}
      />
      <TextField
        label="Due date"
        name="dueDate"
        onChange={onChange}
        slotProps={{
          inputLabel: {
            shrink: true,
          },
        }}
        type="date"
        value={formValues.dueDate}
      />
    </Stack>
  );
}

export default TaskFields;