const { test, expect } = require('@playwright/test');
const { TaskPlannerPage } = require('./pages/taskPlannerPage');

test.beforeEach(async ({ page, request }) => {
  const resetResponse = await request.post('http://127.0.0.1:3031/api/test/reset');
  expect(resetResponse.status()).toBe(204);
  const taskPlannerPage = new TaskPlannerPage(page);
  await taskPlannerPage.goto();
});

test('shows seeded tasks in nearest due date order and highlights due-soon work', async ({ page }) => {
  const taskPlannerPage = new TaskPlannerPage(page);

  await expect(taskPlannerPage.taskHeading('Plan sprint tasks')).toBeVisible();
  await expect(taskPlannerPage.taskHeading('Prepare demo notes')).toBeVisible();

  await expect(taskPlannerPage.taskCard(1)).toHaveClass(/task-card--due-soon/);
  await expect(taskPlannerPage.renderedTaskNames()).resolves.toEqual([
    'Plan sprint tasks',
    'Prepare demo notes',
    'Archive completed ideas',
  ]);
});

test('creates a task through the task form', async ({ page }) => {
  const taskPlannerPage = new TaskPlannerPage(page);

  await taskPlannerPage.createTask({
    name: 'Playwright task',
    description: 'Verify the create flow through the browser.',
    dueDate: '2099-05-20',
  });

  await expect(taskPlannerPage.taskHeading('Playwright task')).toBeVisible();
});

test('edits a pending task from the dialog', async ({ page }) => {
  const taskPlannerPage = new TaskPlannerPage(page);

  await taskPlannerPage.updateTaskName('Plan sprint tasks updated');

  await expect(taskPlannerPage.taskHeading('Plan sprint tasks updated')).toBeVisible();
});

test('cancels deletion without removing the task', async ({ page }) => {
  const taskPlannerPage = new TaskPlannerPage(page);

  await taskPlannerPage.cancelTaskDeletion();

  await expect(taskPlannerPage.taskHeading('Plan sprint tasks')).toBeVisible();
});

test('confirms deletion and removes the task', async ({ page }) => {
  const taskPlannerPage = new TaskPlannerPage(page);

  await taskPlannerPage.confirmTaskDeletion();

  await expect(taskPlannerPage.taskHeading('Plan sprint tasks')).not.toBeVisible();
});

test('sorts tasks by name and by description', async ({ page }) => {
  const taskPlannerPage = new TaskPlannerPage(page);

  await taskPlannerPage.sortBy('Name');
  await expect(taskPlannerPage.renderedTaskNames()).resolves.toEqual([
    'Archive completed ideas',
    'Plan sprint tasks',
    'Prepare demo notes',
  ]);

  await taskPlannerPage.sortBy('Description');
  await expect(taskPlannerPage.renderedTaskNames()).resolves.toEqual([
    'Archive completed ideas',
    'Plan sprint tasks',
    'Prepare demo notes',
  ]);
});