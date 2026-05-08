import { isTaskDueSoon, sortTasks } from '../utils/taskUtils';

function formatLocalDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

describe('taskUtils sorting', () => {
  const tasks = [
    {
      id: 1,
      name: 'Bravo task',
      description: 'Write release notes',
      dueDate: '2099-01-05',
      status: 'pending',
      createdAt: '2023-01-01T00:00:00.000Z',
    },
    {
      id: 2,
      name: 'Alpha task',
      description: 'Archive planning notes',
      dueDate: '2099-01-02',
      status: 'pending',
      createdAt: '2023-01-02T00:00:00.000Z',
    },
    {
      id: 3,
      name: 'Charlie task',
      description: '',
      dueDate: '',
      status: 'completed',
      createdAt: '2023-01-03T00:00:00.000Z',
    },
  ];

  test('sorts by due date with undated tasks last by default', () => {
    const sortedTasks = sortTasks(tasks, 'dueDate');

    expect(sortedTasks.map((task) => task.name)).toEqual([
      'Alpha task',
      'Bravo task',
      'Charlie task',
    ]);
  });

  test('sorts by description and falls back to due date ordering for ties', () => {
    const sortedTasks = sortTasks(tasks, 'description');

    expect(sortedTasks.map((task) => task.name)).toEqual([
      'Charlie task',
      'Alpha task',
      'Bravo task',
    ]);
  });
});

describe('taskUtils due soon highlighting', () => {
  test('marks tasks due within three days as due soon', () => {
    const dueSoonDate = new Date();
    dueSoonDate.setDate(dueSoonDate.getDate() + 3);

    expect(isTaskDueSoon({ dueDate: formatLocalDate(dueSoonDate) })).toBe(true);
  });

  test('does not mark tasks due after three days as due soon', () => {
    const laterDate = new Date();
    laterDate.setDate(laterDate.getDate() + 4);

    expect(isTaskDueSoon({ dueDate: formatLocalDate(laterDate) })).toBe(false);
  });

  test('does not mark overdue tasks as due soon', () => {
    const overdueDate = new Date();
    overdueDate.setDate(overdueDate.getDate() - 1);

    expect(isTaskDueSoon({ dueDate: formatLocalDate(overdueDate) })).toBe(false);
  });
});