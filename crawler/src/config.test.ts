import { describe, it, expect, vi } from 'vitest';

describe('Config', () => {
  it('should export Job interface fields', async () => {
    // Just verify the shape compiles and exports correctly
    const { CONFIG, SEARCH_QUERIES } = await import('./config.js');

    expect(CONFIG).toBeDefined();
    expect(typeof CONFIG.alertThreshold).toBe('number');
    expect(typeof CONFIG.digestThreshold).toBe('number');
    expect(typeof CONFIG.requestDelayMs).toBe('number');
    expect(typeof CONFIG.userAgent).toBe('string');
    expect(typeof CONFIG.dbPath).toBe('string');
    expect(typeof CONFIG.profileSummary).toBe('string');
  });

  it('should have SEARCH_QUERIES with title arrays', async () => {
    const { SEARCH_QUERIES } = await import('./config.js');

    expect(SEARCH_QUERIES.titles).toBeInstanceOf(Array);
    expect(SEARCH_QUERIES.titles.length).toBeGreaterThan(0);
    expect(SEARCH_QUERIES.polishTitles).toBeInstanceOf(Array);
    expect(SEARCH_QUERIES.polishTitles.length).toBeGreaterThan(0);
    expect(SEARCH_QUERIES.keywords).toBeInstanceOf(Array);
    expect(typeof SEARCH_QUERIES.minSalaryPLN).toBe('number');
  });

  it('should default alertThreshold to 75', async () => {
    const { CONFIG } = await import('./config.js');
    expect(CONFIG.alertThreshold).toBe(75);
  });

  it('should default digestThreshold to 50', async () => {
    const { CONFIG } = await import('./config.js');
    expect(CONFIG.digestThreshold).toBe(50);
  });

  it('should have a non-empty profileSummary (from file or fallback)', async () => {
    const { CONFIG } = await import('./config.js');
    expect(CONFIG.profileSummary.length).toBeGreaterThan(10);
  });
});
