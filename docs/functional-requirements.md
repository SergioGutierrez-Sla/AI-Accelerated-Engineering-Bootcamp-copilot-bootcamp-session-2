# Functional Requirements

## Purpose

This document defines the functional requirements needed to complete the task management application. The current application supports creating and deleting simple items. To complete the project, the application must evolve into a more complete task manager with richer task metadata, editing capabilities, safer deletion flows, and configurable sorting.

## Functional Requirements

### FR-01: Task Model Must Support Due Dates

- The system must store a due date for each task.
- The task creation flow must include a date field that allows the user to select a due date.
- The task model must be updated in both frontend and backend layers to include the due date field.
- The due date must be returned in task API responses and persisted with the task record.

### FR-02: Task Model Must Support Descriptions

- The system must store a description for each task.
- The task creation flow must include a description field so users can add more details to a task.
- The task model must be updated in both frontend and backend layers to include the description field.
- The description must be returned in task API responses and persisted with the task record.

### FR-03: Users Must Be Able to Edit Pending Tasks

- The system must allow users to edit a task that is still pending.
- The edit flow must allow updating, at minimum, the task name, description, and due date.
- The edit action must be available from the task list for eligible tasks.
- The system must persist the updated task information and refresh the UI to show the latest values.

### FR-04: Task Deletion Must Require Confirmation

- The system must display a confirmation modal when a user attempts to delete a task.
- The modal must clearly identify that the action will delete the selected task.
- The user must be able to confirm or cancel the deletion.
- The task must only be deleted after explicit confirmation.

### FR-05: Users Must Be Able to Sort Tasks

- The system must provide sorting logic for the task list.
- Users must be able to sort tasks by name.
- Users must be able to sort tasks by description.
- Users must be able to sort tasks by due date.
- Sorting must be applied consistently to the list shown in the UI.

### FR-06: Default Sorting and Due Date Highlighting

- The default order of tasks must show the tasks with the nearest due date first.
- Tasks that are due in three or fewer days must be visually highlighted.
- The highlight must use a light red background so urgent tasks are easy to identify.
- The highlighting must be applied automatically based on the current date and the task due date.

## Completion Criteria

The project should be considered functionally complete when:

- users can create tasks with a name, description, and due date,
- task data is correctly stored and retrieved through the backend,
- pending tasks can be edited,
- deletions require confirmation through a modal,
- the task list can be sorted by name, description, or due date,
- the default task ordering shows the nearest due dates first, and
- tasks due within three days are visually highlighted with a light red background.
