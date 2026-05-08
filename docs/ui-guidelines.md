# UI Guidelines

## Purpose

This document defines the UI guidelines that should be followed across the project so the application remains consistent for users and maintainable for developers.

## General Guidelines

- All new UI work should follow these guidelines unless there is a documented reason to do otherwise.
- Developers should prefer reusable patterns and consistent behavior across screens, forms, lists, dialogs, and actions.
- UI changes should align with the functional requirements defined for the project.

## Component Guidelines

### UI-01: Use Material Components When Possible

- Developers should use Material components when a suitable component exists for the required interaction.
- Material components should be preferred for common UI elements such as inputs, dialogs, tooltips, cards, and form controls.
- Custom components should only be introduced when the needed behavior or appearance cannot be achieved cleanly with Material components.

### UI-02: Use Bootstrap Classes for Button Styling

- Buttons should use Bootstrap classes for visual styling when appropriate.
- Button styles should clearly reflect the action intent, including variants such as info, delete, success, warning, or similar semantic styles.
- Button styling should remain consistent across the application for equivalent actions.

### UI-03: Buttons Must Include Delayed Tooltips

- Buttons should provide tooltips that explain the intent of the action.
- Tooltips should only be shown when the user hovers over the button for longer than 3 seconds.
- Tooltip text should be short, clear, and specific to the action performed by the button.
- Tooltip behavior should be implemented consistently across all action buttons.

## Expected Outcomes

The UI guidelines should be considered applied correctly when:

- Material components are used wherever they fit the feature,
- button styling uses consistent Bootstrap semantic classes,
- action buttons include descriptive tooltips, and
- tooltips appear only after a hover duration longer than 3 seconds.
