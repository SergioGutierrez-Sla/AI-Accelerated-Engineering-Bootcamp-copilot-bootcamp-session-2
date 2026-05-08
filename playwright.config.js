const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  fullyParallel: false,
  retries: 0,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:3001',
    trace: 'on-first-retry',
    viewport: { width: 1280, height: 900 },
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],
  webServer: [
    {
      command: 'PORT=3031 ENABLE_TEST_ENDPOINTS=true node packages/backend/src/index.js',
      url: 'http://127.0.0.1:3031/',
      reuseExistingServer: false,
      timeout: 120_000,
    },
    {
      command: 'BROWSER=none PORT=3001 REACT_APP_API_BASE_URL=http://127.0.0.1:3031 npm run start --workspace=frontend',
      url: 'http://127.0.0.1:3001',
      reuseExistingServer: false,
      timeout: 120_000,
    },
  ],
});