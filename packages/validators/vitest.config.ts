import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    // Since we are using ES modules, we need to set this
    // but vitest should handle it by default with "type": "module" in package.json
  },
});