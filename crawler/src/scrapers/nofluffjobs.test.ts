import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('../config.js', () => ({
  CONFIG: {
    userAgent: 'TestBot/1.0',
    requestDelayMs: 0,
  },
  SEARCH_QUERIES: {
    minSalaryPLN: 20000,
  },
}));

describe('NoFluffJobs Scraper', () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch);
    mockFetch.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should map API postings to Job format', async () => {
    // First calls return search results, detail calls return description
    mockFetch.mockImplementation(async (url: string) => {
      if (url.includes('/search/posting')) {
        return {
          ok: true,
          json: async () => ({
            postings: [{
              id: 'nfj-123',
              name: 'Head of Data',
              title: 'Head of Data',
              url: 'head-of-data-nfj-123',
              salary: { from: 25000, to: 40000, currency: 'PLN', type: 'month' },
              location: { places: [{ city: 'Kraków', url: 'krakow' }] },
              company: { name: 'DataHouse' },
              posted: Date.now(),
              category: 'data',
              seniority: ['expert'],
              technology: ['Python', 'Spark'],
            }],
            totalCount: 1,
            totalPages: 1,
          }),
        };
      }
      // posting detail
      return {
        ok: true,
        json: async () => ({
          requirements: { description: 'Lead our data team.' },
        }),
      };
    });

    const { scrapeNoFluffJobs } = await import('./nofluffjobs.js');
    const jobs = await scrapeNoFluffJobs();

    const found = jobs.find(j => j.id === 'nofluff:nfj-123');
    expect(found).toBeDefined();
    expect(found!.title).toBe('Head of Data');
    expect(found!.company).toBe('DataHouse');
    expect(found!.location).toBe('Kraków');
    expect(found!.salaryMin).toBe(25000);
    expect(found!.salaryMax).toBe(40000);
    expect(found!.salaryCurrency).toBe('PLN');
    expect(found!.source).toBe('nofluffjobs.com');
    expect(found!.skills).toEqual(['Python', 'Spark']);
  });

  it('should handle missing salary gracefully', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        postings: [{
          id: 'nfj-no-salary',
          name: 'AI Researcher',
          title: 'AI Researcher',
          url: 'ai-researcher',
          location: { places: [] },
          company: { name: 'Unknown' },
          posted: Date.now(),
          category: 'ai',
          seniority: ['senior'],
        }],
        totalCount: 1,
        totalPages: 1,
      }),
    });

    const { scrapeNoFluffJobs } = await import('./nofluffjobs.js');
    const jobs = await scrapeNoFluffJobs();

    const found = jobs.find(j => j.id === 'nofluff:nfj-no-salary');
    expect(found).toBeDefined();
    expect(found!.salaryMin).toBeNull();
    expect(found!.location).toBe('Remote');
  });

  it('should handle API failure without crashing', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 503,
      statusText: 'Service Unavailable',
    });

    const { scrapeNoFluffJobs } = await import('./nofluffjobs.js');
    const jobs = await scrapeNoFluffJobs();
    expect(Array.isArray(jobs)).toBe(true);
  });

  it('should handle empty postings array', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ postings: [], totalCount: 0, totalPages: 0 }),
    });

    const { scrapeNoFluffJobs } = await import('./nofluffjobs.js');
    const jobs = await scrapeNoFluffJobs();
    expect(jobs).toHaveLength(0);
  });
});
