function compareText(leftValue, rightValue) {
  return (leftValue || '').localeCompare(rightValue || '', undefined, {
    sensitivity: 'base',
  });
}

function parseTaskDate(value) {
  if (!value) {
    return null;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  const parsedDate = new Date(value);
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
}

export function compareByDueDate(leftTask, rightTask) {
  if (!leftTask.dueDate && !rightTask.dueDate) {
    return compareText(leftTask.name, rightTask.name);
  }

  if (!leftTask.dueDate) {
    return 1;
  }

  if (!rightTask.dueDate) {
    return -1;
  }

  const dueDateComparison = parseTaskDate(leftTask.dueDate) - parseTaskDate(rightTask.dueDate);
  if (dueDateComparison !== 0) {
    return dueDateComparison;
  }

  return compareText(leftTask.name, rightTask.name);
}

export function sortTasks(tasks, sortBy = 'dueDate') {
  return [...tasks].sort((leftTask, rightTask) => {
    if (sortBy === 'name') {
      const nameComparison = compareText(leftTask.name, rightTask.name);
      return nameComparison || compareByDueDate(leftTask, rightTask);
    }

    if (sortBy === 'description') {
      const descriptionComparison = compareText(leftTask.description, rightTask.description);
      return descriptionComparison || compareByDueDate(leftTask, rightTask);
    }

    return compareByDueDate(leftTask, rightTask);
  });
}

export function sortTasksByNearestDueDate(tasks) {
  return sortTasks(tasks, 'dueDate');
}

export function isTaskDueSoon(task) {
  if (!task.dueDate) {
    return false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dueDate = parseTaskDate(task.dueDate);
  if (!dueDate) {
    return false;
  }

  dueDate.setHours(0, 0, 0, 0);

  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  const dayDifference = Math.ceil((dueDate - today) / millisecondsPerDay);

  return dayDifference >= 0 && dayDifference <= 3;
}

export function formatTaskDueDate(dueDate) {
  if (!dueDate) {
    return 'No due date';
  }

  const parsedDate = parseTaskDate(dueDate);
  if (!parsedDate) {
    return 'No due date';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(parsedDate);
}