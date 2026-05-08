const request = require('supertest');
const { app, db } = require('../src/app');

// Close the database connection after all tests
afterAll(() => {
  if (db) {
    db.close();
  }
});

// Test helpers
const createItem = async (name = 'Temp Item to Delete') => {
  const response = await request(app)
    .post('/api/items')
    .send({ name })
    .set('Accept', 'application/json');

  expect(response.status).toBe(201);
  expect(response.body).toHaveProperty('id');
  return response.body;
};

const updateItem = async (id, overrides = {}) => {
  const response = await request(app)
    .put(`/api/items/${id}`)
    .send({
      name: 'Updated Task Name',
      description: 'Updated task description.',
      dueDate: '2099-04-20',
      status: 'pending',
      ...overrides,
    })
    .set('Accept', 'application/json');

  return response;
};

describe('API Endpoints', () => {
  describe('GET /api/items', () => {
    it('should return all items', async () => {
      const response = await request(app).get('/api/items');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);

      // Check if items have the expected structure
      const item = response.body[0];
      expect(item).toHaveProperty('id');
      expect(item).toHaveProperty('name');
      expect(item).toHaveProperty('description');
      expect(item).toHaveProperty('due_date');
      expect(item).toHaveProperty('status');
      expect(item).toHaveProperty('created_at');
    });
  });

  describe('POST /api/items', () => {
    it('should create a new item', async () => {
      const newItem = {
        name: 'Test Item',
        description: 'Track the expanded task model.',
        dueDate: '2099-03-15',
        status: 'pending',
      };
      const response = await request(app)
        .post('/api/items')
        .send(newItem)
        .set('Accept', 'application/json');

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(newItem.name);
      expect(response.body.description).toBe(newItem.description);
      expect(response.body.due_date).toBe(newItem.dueDate);
      expect(response.body.status).toBe(newItem.status);
      expect(response.body).toHaveProperty('created_at');
    });

    it('should return 400 if name is missing', async () => {
      const response = await request(app)
        .post('/api/items')
        .send({})
        .set('Accept', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Item name is required');
    });

    it('should return 400 if name is empty', async () => {
      const response = await request(app)
        .post('/api/items')
        .send({ name: '' })
        .set('Accept', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Item name is required');
    });

    it('should return 400 if due date is invalid', async () => {
      const response = await request(app)
        .post('/api/items')
        .send({ name: 'Invalid Due Date Task', dueDate: 'not-a-date' })
        .set('Accept', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Valid due date is required when provided');
    });
  });

  describe('DELETE /api/items/:id', () => {
    it('should delete an existing item', async () => {
      const item = await createItem('Item To Be Deleted');

      const deleteResponse = await request(app).delete(`/api/items/${item.id}`);
      expect(deleteResponse.status).toBe(200);
      expect(deleteResponse.body).toEqual({ message: 'Item deleted successfully', id: item.id });

      const deleteAgain = await request(app).delete(`/api/items/${item.id}`);
      expect(deleteAgain.status).toBe(404);
      expect(deleteAgain.body).toHaveProperty('error', 'Item not found');
    });

    it('should return 404 when item does not exist', async () => {
      const response = await request(app).delete('/api/items/999999');
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Item not found');
    });

    it('should return 400 for invalid id', async () => {
      const response = await request(app).delete('/api/items/abc');
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Valid item ID is required');
    });
  });

  describe('PUT /api/items/:id', () => {
    it('should update a pending item', async () => {
      const item = await createItem('Item To Update');

      const response = await updateItem(item.id);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(item.id);
      expect(response.body.name).toBe('Updated Task Name');
      expect(response.body.description).toBe('Updated task description.');
      expect(response.body.due_date).toBe('2099-04-20');
      expect(response.body.status).toBe('pending');
    });

    it('should allow changing a pending item status during update', async () => {
      const item = await createItem('Item To Complete');

      const response = await updateItem(item.id, { status: 'completed' });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('completed');
    });

    it('should return 409 when the item is not pending', async () => {
      const response = await request(app)
        .get('/api/items')
        .set('Accept', 'application/json');

      const completedItem = response.body.find((item) => item.status === 'completed');
      expect(completedItem).toBeDefined();

      const updateResponse = await updateItem(completedItem.id);

      expect(updateResponse.status).toBe(409);
      expect(updateResponse.body).toHaveProperty('error', 'Only pending items can be edited');
    });

    it('should return 404 when the item does not exist', async () => {
      const response = await updateItem(999999);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Item not found');
    });

    it('should return 400 for invalid id', async () => {
      const response = await updateItem('abc');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Valid item ID is required');
    });

    it('should return 400 when the name is missing', async () => {
      const item = await createItem('Item Missing Name');
      const response = await updateItem(item.id, { name: '' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Item name is required');
    });

    it('should return 400 when the due date is invalid', async () => {
      const item = await createItem('Item Invalid Due Date');
      const response = await updateItem(item.id, { dueDate: 'invalid-date' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Valid due date is required when provided');
    });
  });
});