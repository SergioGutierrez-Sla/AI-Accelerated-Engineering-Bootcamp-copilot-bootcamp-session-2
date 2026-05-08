class TaskPlannerPage {
  constructor(page) {
    this.page = page;
    this.taskNameInput = page.getByRole('textbox', { name: /task name/i });
    this.descriptionInput = page.getByRole('textbox', { name: /description/i });
    this.dueDateInput = page.getByLabel('Due date');
    this.addTaskButton = page.getByRole('button', { name: 'Create a new task' });
    this.sortBySelect = page.getByRole('combobox', { name: 'Sort by' });
  }

  async goto() {
    await this.page.goto('/');
  }

  taskHeading(name) {
    return this.page.getByRole('heading', { level: 3, name });
  }

  taskCard(id) {
    return this.page.getByTestId(`task-card-${id}`);
  }

  editTaskButton() {
    return this.page.getByRole('button', { name: 'Edit this pending task' }).first();
  }

  deleteTaskButton() {
    return this.page.getByRole('button', { name: 'Delete this task' }).first();
  }

  async createTask({ name, description, dueDate }) {
    await this.taskNameInput.fill(name);
    await this.descriptionInput.fill(description);
    if (dueDate) {
      await this.dueDateInput.fill(dueDate);
    }
    await this.addTaskButton.click();
  }

  async openSortMenu() {
    await this.sortBySelect.click();
  }

  async sortBy(optionName) {
    await this.openSortMenu();
    await this.page.getByRole('option', { name: optionName }).click();
  }

  async openEditDialog() {
    await this.editTaskButton().click();
    return this.page.getByRole('dialog', { name: 'Edit Pending Task' });
  }

  async updateTaskName(newName) {
    const dialog = await this.openEditDialog();
    const input = dialog.getByRole('textbox', { name: /task name/i });
    await input.fill(newName);
    await dialog.getByRole('button', { name: 'Save changes to this pending task' }).click();
  }

  async requestTaskDeletion() {
    await this.deleteTaskButton().click();
    return this.page.getByRole('dialog', { name: 'Confirm Task Deletion' });
  }

  async confirmTaskDeletion() {
    const dialog = await this.requestTaskDeletion();
    await dialog.getByRole('button', { name: 'Permanently delete this task' }).click();
  }

  async cancelTaskDeletion() {
    const dialog = await this.requestTaskDeletion();
    await dialog.getByRole('button', { name: 'Keep this task and close the dialog' }).click();
  }

  async renderedTaskNames() {
    return this.page.getByRole('heading', { level: 3 }).allTextContents();
  }
}

module.exports = { TaskPlannerPage };