import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { makeJob } from '../test-helpers.js';

// Mock CONFIG before importing sqlite module
vi.mock('../config.js', () => ({
  CONFIG: {
    dbPath: ':memory:',
  },
}));

// Dynamic import so mock is in place
const {
  initDatabase,
  jobExists,
  insertJob,
  updateJobScore,
  getUnscoredJobs,
  getUnnotifiedJobs,
  markNotified,
  getRecentJobs,
  getStats,
  closeDatabase,
} = await import('./sqlite.js');

describe('SQLite Storage', () => {
  beforeEach(() => {
    initDatabase();
  });

  afterEach(() => {
    closeDatabase();
  });

  it('should initialize database without errors', () => {
    // initDatabase already called in beforeEach — just verify stats work
    const stats = getStats();
    expect(stats.total).toBe(0);
    expect(stats.scored).toBe(0);
    expect(stats.strongMatches).toBe(0);
  });

  it('should insert and check job existence', () => {
    const job = makeJob({ id: 'test:exist-1' });
    expect(jobExists(job.id)).toBe(false);
    insertJob(job);
    expect(jobExists(job.id)).toBe(true);
  });

  it('should not duplicate jobs on INSERT OR IGNORE', () => {
    const job = makeJob({ id: 'test:dup-1' });
    insertJob(job);
    insertJob(job); // should not throw
    const stats = getStats();
    expect(stats.total).toBe(1);
  });

  it('should return unscored jobs', () => {
    insertJob(makeJob({ id: 'test:unscored-1' }));
    insertJob(makeJob({ id: 'test:unscored-2' }));
    const unscored = getUnscoredJobs();
    expect(unscored).toHaveLength(2);
    expect(unscored[0].id).toBeDefined();
  });

  it('should update job scores', () => {
    const job = makeJob({ id: 'test:score-1' });
    insertJob(job);

    updateJobScore(job.id, 85, ['Good match'], ['No salary'], 'strong_match');

    const unscored = getUnscoredJobs();
    expect(unscored).toHaveLength(0);

    const stats = getStats();
    expect(stats.scored).toBe(1);
    expect(stats.strongMatches).toBe(1);
  });

  it('should return unnotified jobs above threshold', () => {
    const job = makeJob({ id: 'test:notify-1' });
    insertJob(job);
    updateJobScore(job.id, 80, ['Match'], [], 'strong_match');

    const toNotify = getUnnotifiedJobs(50);
    expect(toNotify).toHaveLength(1);
    expect(toNotify[0].score).toBe(80);
    expect(toNotify[0].matchReasons).toEqual(['Match']);
  });

  it('should not return jobs below threshold as unnotified', () => {
    const job = makeJob({ id: 'test:low-1' });
    insertJob(job);
    updateJobScore(job.id, 30, [], ['No match'], 'no_match');

    const toNotify = getUnnotifiedJobs(50);
    expect(toNotify).toHaveLength(0);
  });

  it('should mark jobs as notified', () => {
    const job = makeJob({ id: 'test:mark-1' });
    insertJob(job);
    updateJobScore(job.id, 80, ['Match'], [], 'strong_match');

    markNotified([job.id]);

    const toNotify = getUnnotifiedJobs(50);
    expect(toNotify).toHaveLength(0);
  });

  it('should batch-mark multiple jobs as notified', () => {
    insertJob(makeJob({ id: 'test:batch-1' }));
    insertJob(makeJob({ id: 'test:batch-2' }));
    updateJobScore('test:batch-1', 90, [], [], 'strong_match');
    updateJobScore('test:batch-2', 80, [], [], 'strong_match');

    markNotified(['test:batch-1', 'test:batch-2']);

    const toNotify = getUnnotifiedJobs(50);
    expect(toNotify).toHaveLength(0);
  });

  it('should return correct stats', () => {
    insertJob(makeJob({ id: 'test:stats-1' }));
    insertJob(makeJob({ id: 'test:stats-2' }));
    insertJob(makeJob({ id: 'test:stats-3' }));
    updateJobScore('test:stats-1', 90, [], [], 'strong_match');
    updateJobScore('test:stats-2', 60, [], [], 'possible_match');

    const stats = getStats();
    expect(stats.total).toBe(3);
    expect(stats.scored).toBe(2);
    expect(stats.strongMatches).toBe(1);
    expect(stats.thisWeek).toBe(3);
  });

  it('should preserve skills as JSON array', () => {
    const job = makeJob({ id: 'test:skills-1', skills: ['Python', 'TensorFlow'] });
    insertJob(job);

    const unscored = getUnscoredJobs();
    expect(unscored[0].skills).toEqual(['Python', 'TensorFlow']);
  });

  it('should handle empty skills gracefully', () => {
    const job = makeJob({ id: 'test:skills-empty', skills: [] });
    insertJob(job);

    const unscored = getUnscoredJobs();
    expect(unscored[0].skills).toEqual([]);
  });

  it('should handle null salary values', () => {
    const job = makeJob({
      id: 'test:null-salary',
      salaryMin: null,
      salaryMax: null,
      salaryCurrency: null,
    });
    insertJob(job);

    const unscored = getUnscoredJobs();
    expect(unscored[0].salaryMin).toBeNull();
    expect(unscored[0].salaryMax).toBeNull();
  });
});
