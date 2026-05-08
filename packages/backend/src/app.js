const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const Database = require('better-sqlite3');

const ALLOWED_STATUSES = new Set(['pending', 'completed']);
const TEST_ENDPOINTS_ENABLED = process.env.ENABLE_TEST_ENDPOINTS === 'true';

function formatDueDate(daysFromToday) {
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + daysFromToday);
  return dueDate.toISOString().split('T')[0];
}

function isValidDateInput(value) {
  if (typeof value !== 'string' || value.trim() === '') {
    return false;
  }

  return !Number.isNaN(Date.parse(value));
}

function normalizeTaskInput(body) {
  const description = typeof body.description === 'string' ? body.description.trim() : '';
  const dueDate = body.dueDate ?? body.due_date ?? null;
  const status = typeof body.status === 'string' ? body.status.trim().toLowerCase() : 'pending';

  if (dueDate !== null && !isValidDateInput(dueDate)) {
    return { error: 'Valid due date is required when provided' };
  }

  if (!ALLOWED_STATUSES.has(status)) {
    return { error: 'Valid status is required' };
  }

  return {
    description,
    dueDate,
    status,
  };
}

function parseItemId(id) {
  const parsedId = parseInt(id, 10);

  if (!id || Number.isNaN(parsedId)) {
    return { error: 'Valid item ID is required' };
  }

  return { value: parsedId };
}

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Initialize in-memory SQLite database
const db = new Database(':memory:');

const initialItems = [
  {
    name: 'Plan sprint tasks',
    description: 'Review outstanding work and define the next sprint backlog.',
    dueDate: formatDueDate(2),
    status: 'pending',
  },
  {
    name: 'Prepare demo notes',
    description: 'Summarize the current progress for the stakeholder review.',
    dueDate: formatDueDate(5),
    status: 'pending',
  },
  {
    name: 'Archive completed ideas',
    description: 'Clean up outdated notes from the previous planning cycle.',
    dueDate: formatDueDate(10),
    status: 'completed',
  },
];

function initializeSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      due_date TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

function seedItems() {
  const seededInsertStmt = db.prepare(
    'INSERT INTO items (name, description, due_date, status) VALUES (?, ?, ?, ?)'
  );

  initialItems.forEach((item) => {
    seededInsertStmt.run(item.name, item.description, item.dueDate, item.status);
  });

  return seededInsertStmt;
}

function resetItemsTable() {
  db.exec('DROP TABLE IF EXISTS items');
  initializeSchema();
  insertStmt = seedItems();
  return insertStmt;
}

initializeSchema();
let insertStmt = seedItems();

console.log('In-memory database initialized with sample data');

if (TEST_ENDPOINTS_ENABLED) {
  app.post('/api/test/reset', (req, res) => {
    try {
      resetItemsTable();
      res.status(204).send();
    } catch (error) {
      console.error('Error resetting test database:', error);
      res.status(500).json({ error: 'Failed to reset test database' });
    }
  });
}

// Health check endpoint
app.get('/', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Backend server is running' });
});

// API Routes
app.get('/api/items', (req, res) => {
  try {
    const items = db.prepare(
      `SELECT *
       FROM items
       ORDER BY CASE WHEN due_date IS NULL THEN 1 ELSE 0 END,
                due_date ASC,
                created_at DESC`
    ).all();
    res.json(items);
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

app.post('/api/items', (req, res) => {
  try {
    const { name } = req.body;

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ error: 'Item name is required' });
    }

    const normalizedTask = normalizeTaskInput(req.body);
    if (normalizedTask.error) {
      return res.status(400).json({ error: normalizedTask.error });
    }

    const result = insertStmt.run(
      name.trim(),
      normalizedTask.description,
      normalizedTask.dueDate,
      normalizedTask.status
    );
    const id = result.lastInsertRowid;

    const newItem = db.prepare('SELECT * FROM items WHERE id = ?').get(id);
    res.status(201).json(newItem);
  } catch (error) {
    console.error('Error creating item:', error);
    res.status(500).json({ error: 'Failed to create item' });
  }
});

app.put('/api/items/:id', (req, res) => {
  try {
    const parsedId = parseItemId(req.params.id);
    if (parsedId.error) {
      return res.status(400).json({ error: parsedId.error });
    }

    const { name } = req.body;
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ error: 'Item name is required' });
    }

    const existingItem = db.prepare('SELECT * FROM items WHERE id = ?').get(parsedId.value);
    if (!existingItem) {
      return res.status(404).json({ error: 'Item not found' });
    }

    if (existingItem.status !== 'pending') {
      return res.status(409).json({ error: 'Only pending items can be edited' });
    }

    const normalizedTask = normalizeTaskInput(req.body);
    if (normalizedTask.error) {
      return res.status(400).json({ error: normalizedTask.error });
    }

    const updateStmt = db.prepare(
      `UPDATE items
       SET name = ?,
           description = ?,
           due_date = ?,
           status = ?
       WHERE id = ?`
    );

    updateStmt.run(
      name.trim(),
      normalizedTask.description,
      normalizedTask.dueDate,
      normalizedTask.status,
      parsedId.value
    );

    const updatedItem = db.prepare('SELECT * FROM items WHERE id = ?').get(parsedId.value);
    res.json(updatedItem);
  } catch (error) {
    console.error('Error updating item:', error);
    res.status(500).json({ error: 'Failed to update item' });
  }
});

app.delete('/api/items/:id', (req, res) => {
  try {
    const parsedId = parseItemId(req.params.id);
    if (parsedId.error) {
      return res.status(400).json({ error: parsedId.error });
    }

    const existingItem = db.prepare('SELECT * FROM items WHERE id = ?').get(parsedId.value);
    if (!existingItem) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const deleteStmt = db.prepare('DELETE FROM items WHERE id = ?');
    const result = deleteStmt.run(parsedId.value);

    if (result.changes > 0) {
      res.json({ message: 'Item deleted successfully', id: parsedId.value });
    } else {
      res.status(404).json({ error: 'Item not found' });
    }
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

module.exports = { app, db, insertStmt, resetItemsTable };