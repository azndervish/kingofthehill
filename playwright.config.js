import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 15000,
  retries: 0,
  use: {
    baseURL: 'http://127.0.0.1:4174/kingofthehill/',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'firefox',
      use: { browserName: 'firefox' },
    },
  ],
  // reuse existing preview at 4174
  webServer: {
    command: 'npx vite preview --port 4174 --host 127.0.0.1',
    url: 'http://127.0.0.1:4174/kingofthehill/',
    reuseExistingServer: true,
    timeout: 30000,
  },
});
