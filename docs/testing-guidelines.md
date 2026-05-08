# Testing Guidelines

## Purpose

This document defines the testing principles and standards that developers should follow across the project. The goal is to keep tests reliable, maintainable, and aligned with the project architecture.

## Core Principles

- Tests should be maintainable and follow best practices.
- All tests must be isolated and independent.
- Setup and teardown hooks are required so tests succeed on multiple runs.
- All new features should include appropriate tests.

## Test Types

### TG-01: Unit Tests

- Use Jest to test individual functions and React components in isolation.
- Unit tests should use the naming convention `*.test.js` or `*.test.ts`.
- Backend unit tests should be placed in `packages/backend/__tests__/`.
- Frontend unit tests should be placed in `packages/frontend/src/__tests__/`.
- Name unit test files to match what they are testing, for example `app.test.js` for `app.js`.

### TG-02: Integration Tests

- Use Jest and Supertest to test backend API endpoints with real HTTP requests.
- Integration tests should be placed in `packages/backend/__tests__/integration/`.
- Integration tests should use the naming convention `*.test.js` or `*.test.ts`.
- Name integration test files clearly based on what they test, for example `todos-api.test.js` for TODO API endpoints.

### TG-03: End-to-End Tests

- Use Playwright as the required framework to test complete UI workflows through browser automation.
- E2E tests should be placed in `tests/e2e/`.
- E2E tests should use the naming convention `*.spec.js` or `*.spec.ts`.
- Name E2E test files based on the user journey they test, for example `todo-workflow.spec.js`.
- Playwright tests must use one browser only.
- Playwright tests must use the Page Object Model (POM) pattern for maintainability.
- Limit E2E tests to 5-8 critical user journeys, focusing on happy paths and key edge cases instead of exhaustive coverage.

## Configuration Guidelines

### TG-04: Port Configuration

- Always use environment variables with sensible defaults for port configuration.
- Backend applications should use `const PORT = process.env.PORT || 3030;`.
- Frontend applications should use React's default port `3000`, while allowing overrides through the `PORT` environment variable.
- This configuration approach allows CI and CD workflows to dynamically detect ports.

## Execution Standards

### TG-05: Test Isolation and Reliability

- Every test should create or arrange its own data and must not rely on other tests.
- Tests must clean up after themselves when they create persistent state or external side effects.
- Setup and teardown hooks should be used where appropriate to prepare and reset test state consistently.
- Test suites should be safe to run repeatedly without producing inconsistent results.

### TG-06: Feature Coverage Expectations

- New features should include unit, integration, or end-to-end coverage as appropriate for the change.
- The selected test level should match the behavior being validated.
- Critical user-facing workflows should be covered by automated tests.

## Expected Outcomes

The testing guidelines should be considered applied correctly when:

- unit, integration, and E2E tests follow the required tools, locations, and naming conventions,
- Playwright tests stay focused on a small set of critical journeys using one browser and the POM pattern,
- port configuration remains environment-driven with sensible defaults,
- tests are isolated, repeatable, and maintainable, and
- new functionality ships with appropriate automated coverage.
