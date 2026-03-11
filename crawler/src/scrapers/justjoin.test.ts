import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('../config.js', () => ({
  CONFIG: {
    userAgent: 'TestBot/1.0',
    requestDelayMs: 0, // No delay in tests
  },
  SEARCH_QUERIES: {
    titles: ['Head of AI'],
    polishTitles: ['Dyrektor IT'],
    keywords: ['AI strategy'],
    minSalaryPLN: 20000,
  },
}));

describe('JustJoin.it Scraper', () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch);
    mockFetch.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should map API response to Job format', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        data: [{
          slug: 'head-of-ai-acme-123',
          title: 'Head of AI',
          companyName: 'Acme Corp',
          city: 'Warszawa',
          workplaceType: 'office',
          employmentTypes: [{
            from: 30000,
            to: 50000,
            currency: 'pln',
            type: 'b2b',
          }],
          requiredSkills: ['Python', 'TensorFlow'],
          publishedAt: '2026-03-10T12:00:00Z',
        }],
      }),
    });

    const { scrapeJustJoin } = await import('./justjoin.js');
    const jobs = await scrapeJustJoin();

    // Should have at least one job from the mock
    const found = jobs.find(j => j.id === 'justjoin:head-of-ai-acme-123');
    expect(found).toBeDefined();
    expect(found!.title).toBe('Head of AI');
    expect(found!.company).toBe('Acme Corp');
    expect(found!.location).toBe('Warszawa');
    expect(found!.salaryMin).toBe(30000);
    expect(found!.salaryMax).toBe(50000);
    expect(found!.salaryCurrency).toBe('PLN');
    expect(found!.source).toBe('justjoin.it');
    expect(found!.url).toContain('head-of-ai-acme-123');
    expect(found!.skills).toEqual(['Python', 'TensorFlow']);
  });

  it('should deduplicate jobs from multiple search strategies', async () => {
    const sameOffer = {
      slug: 'same-job-slug',
      title: 'Director of Data',
      companyName: 'DataCo',
      city: 'Warszawa',
      workplaceType: 'hybrid',
      employmentTypes: [],
      requiredSkills: ['SQL'],
      publishedAt: '2026-03-10T12:00:00Z',
    };

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ data: [sameOffer] }),
    });

    const { scrapeJustJoin } = await import('./justjoin.js');
    const jobs = await scrapeJustJoin();

    // Same slug should appear only once despite being returned by multiple searches
    const matches = jobs.filter(j => j.id === 'justjoin:same-job-slug');
    expect(matches.length).toBe(1);
  });

  it('should handle API errors gracefully', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    });

    const { scrapeJustJoin } = await import('./justjoin.js');
    const jobs = await scrapeJustJoin();

    // Should return empty array, not throw
    expect(Array.isArray(jobs)).toBe(true);
  });

  it('should handle network failures gracefully', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));

    const { scrapeJustJoin } = await import('./justjoin.js');
    const jobs = await scrapeJustJoin();

    expect(Array.isArray(jobs)).toBe(true);
  });

  it('should handle missing employment types', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        data: [{
          slug: 'no-salary-job',
          title: 'AI Lead',
          companyName: 'Mystery Inc',
          city: '',
          workplaceType: 'remote',
          employmentTypes: [],
          requiredSkills: [],
          publishedAt: '2026-03-10T12:00:00Z',
        }],
      }),
    });

    const { scrapeJustJoin } = await import('./justjoin.js');
    const jobs = await scrapeJustJoin();

    const found = jobs.find(j => j.id === 'justjoin:no-salary-job');
    expect(found).toBeDefined();
    expect(found!.salaryMin).toBeNull();
    expect(found!.salaryMax).toBeNull();
    expect(found!.location).toBe('Remote');
  });
});
