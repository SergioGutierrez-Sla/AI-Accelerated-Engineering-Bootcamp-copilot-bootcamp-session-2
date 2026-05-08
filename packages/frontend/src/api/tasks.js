const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || '';

function buildApiUrl(path) {
  return `${apiBaseUrl}${path}`;
}

function normalizeTask(task) {
  return {
    id: task.id,
    name: task.name,
    description: task.description ?? '',
    dueDate: task.dueDate ?? task.due_date ?? '',
    status: task.status ?? 'pending',
    createdAt: task.createdAt ?? task.created_at ?? '',
  };
}

async function parseJsonResponse(response, fallbackMessage) {
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.error || fallbackMessage);
  }

  return payload;
}

export async function fetchTasks() {
  const response = await fetch(buildApiUrl('/api/items'));
  const payload = await parseJsonResponse(response, 'Failed to fetch tasks');
  return payload.map(normalizeTask);
}

export async function createTask(task) {
  const response = await fetch(buildApiUrl('/api/items'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(task),
  });

  const payload = await parseJsonResponse(response, 'Failed to create task');
  return normalizeTask(payload);
}

export async function updateTask(taskId, task) {
  const response = await fetch(buildApiUrl(`/api/items/${taskId}`), {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(task),
  });

  const payload = await parseJsonResponse(response, 'Failed to update task');
  return normalizeTask(payload);
}

export async function deleteTask(taskId) {
  const response = await fetch(buildApiUrl(`/api/items/${taskId}`), {
    method: 'DELETE',
  });

  return parseJsonResponse(response, 'Failed to delete task');
}