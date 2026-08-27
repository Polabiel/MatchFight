import { describe, it, expect } from 'vitest';
import { appRouter } from './index';

describe('API Smoke Test', () => {
  it('should have an appRouter', () => {
    expect(appRouter).toBeDefined();
  });
});