const request = require('supertest');
const { app, db, resetItemsTable } = require('../../src/app');

beforeEach(() => {
  resetItemsTable();
});

afterAll(() => {
  if (db) {
    db.close();
  }
});

describe('Items API integration', () => {
  it('creates, updates, and deletes an item through the API', async () => {
    const createResponse = await request(app)
      .post('/api/items')
      .send({
        name: 'Integration Task',
        description: 'Created from the integration suite.',
        dueDate: '2099-05-08',
        status: 'pending',
      })
      .set('Accept', 'application/json');

    expect(createResponse.status).toBe(201);
    expect(createResponse.body.name).toBe('Integration Task');

    const updateResponse = await request(app)
      .put(`/api/items/${createResponse.body.id}`)
      .send({
        name: 'Integration Task Updated',
        description: 'Updated from the integration suite.',
        dueDate: '2099-05-09',
        status: 'pending',
      })
      .set('Accept', 'application/json');

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.name).toBe('Integration Task Updated');

    const deleteResponse = await request(app).delete(`/api/items/${createResponse.body.id}`);
    expect(deleteResponse.status).toBe(200);
    expect(deleteResponse.body).toEqual({
      message: 'Item deleted successfully',
      id: createResponse.body.id,
    });
  });
});