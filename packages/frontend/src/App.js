import React, { useEffect, useState } from 'react';
import './App.css';
import { Typography } from '@mui/material';
import { createTask, deleteTask, fetchTasks, updateTask } from './api/tasks';
import DeleteTaskDialog from './components/DeleteTaskDialog';
import EditTaskDialog from './components/EditTaskDialog';
import SortControls from './components/SortControls';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import { sortTasks } from './utils/taskUtils';

function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [creatingTask, setCreatingTask] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingTask, setDeletingTask] = useState(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [sortBy, setSortBy] = useState('dueDate');

  const orderedTasks = sortTasks(tasks, sortBy);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const result = await fetchTasks();
      setTasks(result);
      setError(null);
    } catch (err) {
      setError(`Failed to fetch tasks: ${err.message}`);
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (task) => {
    try {
      setCreatingTask(true);
      const createdTask = await createTask(task);
      setTasks((currentTasks) => [...currentTasks, createdTask]);
      setError(null);
    } catch (err) {
      setError(`Error creating task: ${err.message}`);
      console.error('Error creating task:', err);
    } finally {
      setCreatingTask(false);
    }
  };

  const handleStartEditTask = (task) => {
    if (task.status !== 'pending') {
      return;
    }

    setEditingTask(task);
  };

  const handleSaveEditTask = async (taskId, task) => {
    try {
      setSavingEdit(true);
      const updatedTask = await updateTask(taskId, task);
      setTasks((currentTasks) => currentTasks.map((currentTask) => (
        currentTask.id === taskId ? updatedTask : currentTask
      )));
      setEditingTask(null);
      setError(null);
    } catch (err) {
      setError(`Error updating task: ${err.message}`);
      console.error('Error updating task:', err);
    } finally {
      setSavingEdit(false);
    }
  };

  const handleRequestDeleteTask = (task) => {
    setDeletingTask(task);
  };

  const handleConfirmDeleteTask = async () => {
    if (!deletingTask) {
      return;
    }

    try {
      setConfirmingDelete(true);
      await deleteTask(deletingTask.id);
      setTasks((currentTasks) => currentTasks.filter((task) => task.id !== deletingTask.id));
      setDeletingTask(null);
      setError(null);
    } catch (err) {
      setError(`Error deleting task: ${err.message}`);
      console.error('Error deleting task:', err);
    } finally {
      setConfirmingDelete(false);
    }
  };

  return (
    <div className="app-shell">
      <header className="App-header">
        <Typography component="p" className="app-eyebrow">
          Delivery Workspace
        </Typography>
        <h1>Task Planner</h1>
        <p>Track the work ahead with the new task model and a clearer view of upcoming deadlines.</p>
      </header>

      <main className="app-main">
        <div className="app-main__sidebar">
          <TaskForm onSubmit={handleCreateTask} submitting={creatingTask} />
          <SortControls onChange={setSortBy} sortBy={sortBy} />
        </div>
        <TaskList
          error={loading ? null : error}
          loading={loading}
          onDelete={handleRequestDeleteTask}
          onEdit={handleStartEditTask}
          sortBy={sortBy}
          tasks={orderedTasks}
        />
      </main>

      <EditTaskDialog
        onClose={() => setEditingTask(null)}
        onSubmit={handleSaveEditTask}
        open={Boolean(editingTask)}
        submitting={savingEdit}
        task={editingTask}
      />
      <DeleteTaskDialog
        onClose={() => setDeletingTask(null)}
        onConfirm={handleConfirmDeleteTask}
        open={Boolean(deletingTask)}
        submitting={confirmingDelete}
        task={deletingTask}
      />
    </div>
  );
}

export default App;