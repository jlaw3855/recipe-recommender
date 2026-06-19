import { defineConfig, devices } from '@playwright/test';

const E2E_SERVER_PORT = '3011';
const E2E_CLIENT_PORT = '5183';
const baseURL = `http://localhost:${E2E_CLIENT_PORT}`;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'list',
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: [
    {
      command: 'npm run dev -w server',
      url: `http://localhost:${E2E_SERVER_PORT}/api/health`,
      reuseExistingServer: false,
      env: {
        DATA_MODE: 'bundled',
        PORT: E2E_SERVER_PORT,
      },
    },
    {
      command: 'npm run dev -w client',
      url: baseURL,
      reuseExistingServer: false,
      env: {
        PORT: E2E_CLIENT_PORT,
        VITE_API_PROXY: `http://localhost:${E2E_SERVER_PORT}`,
      },
    },
  ],
});
