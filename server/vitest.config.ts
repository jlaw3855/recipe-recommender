import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    projects: [
      {
        extends: true,
        test: {
          name: 'bundled',
          include: ['src/**/*.test.ts'],
          exclude: ['src/**/*.live.test.ts'],
          setupFiles: ['./src/test/setup.ts'],
        },
      },
      {
        extends: true,
        test: {
          name: 'live',
          include: ['src/**/*.live.test.ts'],
          setupFiles: ['./src/test/setup-live.ts'],
        },
      },
    ],
  },
});
