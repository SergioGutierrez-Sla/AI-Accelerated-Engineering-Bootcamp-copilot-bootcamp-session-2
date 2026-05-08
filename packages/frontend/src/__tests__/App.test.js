import React, { act } from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import App from '../App';

function formatDateFromToday(daysFromToday) {
  const date = new Date();
  date.setDate(date.getDate() + daysFromToday);
  return date.toISOString().split('T')[0];
}

const dueSoonDate = formatDateFromToday(2);
const laterDueDate = formatDateFromToday(7);

// Mock server to intercept API requests
const server = setupServer(
  // GET /api/items handler
  rest.get('/api/items', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        {
          id: 1,
          name: 'Launch prep',
          description: 'Review launch blockers and update the checklist.',
          due_date: dueSoonDate,
          status: 'pending',
          created_at: '2023-01-01T00:00:00.000Z',
        },
        {
          id: 2,
          name: 'Archive notes',
          description: '',
          due_date: laterDueDate,
          status: 'completed',
          created_at: '2023-01-02T00:00:00.000Z',
        },
      ])
    );
  }),
  
  // POST /api/items handler
  rest.post('/api/items', (req, res, ctx) => {
    const { description, dueDate, name } = req.body;
    
    if (!name || name.trim() === '') {
      return res(
        ctx.status(400),
        ctx.json({ error: 'Item name is required' })
      );
    }
    
    return res(
      ctx.status(201),
      ctx.json({
        id: 3,
        name,
        description: description || '',
        due_date: dueDate || null,
        status: 'pending',
        created_at: new Date().toISOString(),
      })
    );
  }),

  rest.put('/api/items/:id', async (req, res, ctx) => {
    const { id } = req.params;
    const { description, dueDate, name, status } = req.body;

    if (!name || name.trim() === '') {
      return res(ctx.status(400), ctx.json({ error: 'Item name is required' }));
    }

    if (id === '2') {
      return res(ctx.status(409), ctx.json({ error: 'Only pending items can be edited' }));
    }

    return res(
      ctx.status(200),
      ctx.json({
        id: Number(id),
        name,
        description: description || '',
        due_date: dueDate || null,
        status: status || 'pending',
        created_at: '2023-01-01T00:00:00.000Z',
      })
    );
  }),

  rest.delete('/api/items/:id', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ message: 'Item deleted successfully' }));
  })
);

// Setup and teardown for the mock server
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('App Component', () => {
  function getRenderedTaskNames() {
    return screen
      .getAllByRole('heading', { level: 3 })
      .map((heading) => heading.textContent);
  }

  test('renders the header', async () => {
    await act(async () => {
      render(<App />);
    });
    expect(screen.getByText('Task Planner')).toBeInTheDocument();
    expect(screen.getByText(/Track the work ahead/)).toBeInTheDocument();
  });

  test('loads and displays tasks', async () => {
    await act(async () => {
      render(<App />);
    });
    
    // Initially shows loading state
    expect(screen.getByText('Loading tasks...')).toBeInTheDocument();
    
    // Wait for tasks to load
    await waitFor(() => {
      expect(screen.getByText('Launch prep')).toBeInTheDocument();
      expect(screen.getByText('Archive notes')).toBeInTheDocument();
    });

    expect(getRenderedTaskNames()).toEqual(['Launch prep', 'Archive notes']);
    expect(screen.getAllByRole('button', { name: 'Edit this pending task' })).toHaveLength(1);
    expect(screen.getByTestId('task-card-1')).toHaveClass('task-card--due-soon');
    expect(screen.getByTestId('task-card-2')).not.toHaveClass('task-card--due-soon');
  });

  test('adds a new task', async () => {
    const user = userEvent.setup();
    
    await act(async () => {
      render(<App />);
    });
    
    // Wait for tasks to load
    await waitFor(() => {
      expect(screen.queryByText('Loading tasks...')).not.toBeInTheDocument();
    });
    
    // Fill in the form and submit
    const nameInput = screen.getByRole('textbox', { name: /task name/i });
    const descriptionInput = screen.getByRole('textbox', { name: /description/i });
    await act(async () => {
      await user.type(nameInput, 'New Test Task');
      await user.type(descriptionInput, 'Track the new task shape through the app.');
    });
    
    const submitButton = screen.getByText('Add Task');
    await act(async () => {
      await user.click(submitButton);
    });
    
    // Check that the new task appears
    await waitFor(() => {
      expect(screen.getByText('New Test Task')).toBeInTheDocument();
    });
  });

  test('handles API error', async () => {
    // Override the default handler to simulate an error
    server.use(
      rest.get('/api/items', (req, res, ctx) => {
        return res(ctx.status(500));
      })
    );
    
    await act(async () => {
      render(<App />);
    });
    
    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText(/Failed to fetch tasks/)).toBeInTheDocument();
    });
  });

  test('shows empty state when no tasks exist', async () => {
    // Override the default handler to return empty array
    server.use(
      rest.get('/api/items', (req, res, ctx) => {
        return res(ctx.status(200), ctx.json([]));
      })
    );
    
    await act(async () => {
      render(<App />);
    });
    
    // Wait for empty state message
    await waitFor(() => {
      expect(screen.getByText('No tasks found. Add your first one.')).toBeInTheDocument();
    });
  });

  test('deletes a task from the list', async () => {
    const user = userEvent.setup();

    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(screen.getByText('Launch prep')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByRole('button', { name: 'Delete this task' });
    await act(async () => {
      await user.click(deleteButtons[0]);
    });

    expect(screen.getByText('Confirm Task Deletion')).toBeInTheDocument();

    await act(async () => {
      await user.click(screen.getByRole('button', { name: 'Permanently delete this task' }));
    });

    await waitFor(() => {
      expect(screen.queryByText('Launch prep')).not.toBeInTheDocument();
    });
  });

  test('cancels task deletion from the confirmation dialog', async () => {
    const user = userEvent.setup();

    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(screen.getByText('Launch prep')).toBeInTheDocument();
    });

    await act(async () => {
      await user.click(screen.getAllByRole('button', { name: 'Delete this task' })[0]);
    });

    await act(async () => {
      await user.click(screen.getByRole('button', { name: 'Keep this task and close the dialog' }));
    });

    expect(screen.getByText('Launch prep')).toBeInTheDocument();
  });

  test('edits a pending task', async () => {
    const user = userEvent.setup();

    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(screen.getByText('Launch prep')).toBeInTheDocument();
    });

    await act(async () => {
      await user.click(screen.getByRole('button', { name: 'Edit this pending task' }));
    });

    const dialog = await screen.findByRole('dialog', { name: 'Edit Pending Task' });
    const nameInput = within(dialog).getByRole('textbox', { name: /task name/i });
    await act(async () => {
      await user.clear(nameInput);
      await user.type(nameInput, 'Launch plan updated');
      await user.click(within(dialog).getByRole('button', { name: 'Save changes to this pending task' }));
    });

    await waitFor(() => {
      expect(screen.getByText('Launch plan updated')).toBeInTheDocument();
    });
  });

  test('sorts tasks by name when selected', async () => {
    const user = userEvent.setup();

    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(screen.getByText('Launch prep')).toBeInTheDocument();
    });

    await act(async () => {
      await user.click(screen.getByRole('combobox', { name: 'Sort by' }));
    });

    await act(async () => {
      await user.click(screen.getByRole('option', { name: 'Name' }));
    });

    expect(screen.getByText(/Tasks are currently ordered by name/)).toBeInTheDocument();
  });

  test('sorts tasks by description when selected', async () => {
    const user = userEvent.setup();

    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(screen.getByText('Launch prep')).toBeInTheDocument();
    });

    await act(async () => {
      await user.click(screen.getByRole('combobox', { name: 'Sort by' }));
    });

    await act(async () => {
      await user.click(screen.getByRole('option', { name: 'Description' }));
    });

    expect(screen.getByText(/Tasks are currently ordered by description/)).toBeInTheDocument();
    expect(getRenderedTaskNames()).toEqual(['Archive notes', 'Launch prep']);
  });

  test('keeps nearest due date ordering when due date sorting is selected', async () => {
    const user = userEvent.setup();

    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(screen.getByText('Launch prep')).toBeInTheDocument();
    });

    expect(getRenderedTaskNames()).toEqual(['Launch prep', 'Archive notes']);

    await act(async () => {
      await user.click(screen.getByRole('combobox', { name: 'Sort by' }));
    });

    await act(async () => {
      await user.click(screen.getByRole('option', { name: 'Due date' }));
    });

    expect(screen.getByText(/Tasks are currently ordered by closest due date/)).toBeInTheDocument();
    expect(getRenderedTaskNames()).toEqual(['Launch prep', 'Archive notes']);
  });
});