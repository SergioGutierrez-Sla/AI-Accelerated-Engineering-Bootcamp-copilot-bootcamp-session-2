import React from 'react';
import { FormControl, InputLabel, MenuItem, Select, Typography } from '@mui/material';

function SortControls({ sortBy, onChange }) {
  return (
    <section className="task-panel task-panel--compact" aria-labelledby="sort-controls-title">
      <div className="sort-controls">
        <div>
          <Typography component="h2" variant="h6" id="sort-controls-title">
            Sort Tasks
          </Typography>
          <Typography className="task-panel__subtitle" variant="body2">
            Default ordering is by nearest due date, but you can switch the list view at any time.
          </Typography>
        </div>
        <FormControl className="sort-controls__field" size="small">
          <InputLabel id="sort-by-label">Sort by</InputLabel>
          <Select
            label="Sort by"
            labelId="sort-by-label"
            onChange={(event) => onChange(event.target.value)}
            value={sortBy}
          >
            <MenuItem value="dueDate">Due date</MenuItem>
            <MenuItem value="name">Name</MenuItem>
            <MenuItem value="description">Description</MenuItem>
          </Select>
        </FormControl>
      </div>
    </section>
  );
}

export default SortControls;