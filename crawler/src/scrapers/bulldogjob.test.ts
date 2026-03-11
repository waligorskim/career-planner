import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('../config.js', () => ({
  CONFIG: {
    userAgent: 'TestBot/1.0',
    requestDelayMs: 0,
  },
}));

describe('Bulldogjob Scraper', () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch);
    mockFetch.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should parse job cards from HTML', async () => {
    const html = `
      <html><body>
        <article class="job-card">
          <h3 class="job-title">Head of Analytics</h3>
          <span class="company-name">BigCo</span>
          <span class="location">Kraków</span>
          <span class="salary">20 000 - 35 000 PLN</span>
          <a href="/companies/jobs/head-of-analytics-bigco-456">View</a>
          <span class="skill">Python</span>
          <span class="skill">SQL</span>
        </article>
      </body></html>
    `;

    mockFetch.mockResolvedValue({
      ok: true,
      text: async () => html,
    });

    const { scrapeBulldogjob } = await import('./bulldogjob.js');
    const jobs = await scrapeBulldogjob();

    expect(jobs.length).toBeGreaterThan(0);
    const found = jobs.find(j => j.title === 'Head of Analytics');
    expect(found).toBeDefined();
    expect(found!.company).toBe('BigCo');
    expect(found!.location).toBe('Kraków');
    expect(found!.skills).toEqual(['Python', 'SQL']);
    expect(found!.source).toBe('bulldogjob.pl');
  });

  it('should fall back to link extraction if no job cards match', async () => {
    const html = `
      <html><body>
        <div>
          <a href="/companies/jobs/mystery-ai-role-789">Mystery AI Role</a>
          <a href="/companies/jobs/another-job-101">Data Platform Lead</a>
          <a href="/companies/jobs/s/role,ai">AI Category</a>
        </div>
      </body></html>
    `;

    mockFetch.mockResolvedValue({
      ok: true,
      text: async () => html,
    });

    const { scrapeBulldogjob } = await import('./bulldogjob.js');
    const jobs = await scrapeBulldogjob();

    // Should pick up job links but not category/nav links
    const ids = jobs.map(j => j.id);
    expect(ids.some(id => id.includes('mystery-ai-role'))).toBe(true);
    expect(ids.some(id => id.includes('/s/'))).toBe(false);
  });

  it('should handle HTTP errors gracefully', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 403,
    });

    const { scrapeBulldogjob } = await import('./bulldogjob.js');
    const jobs = await scrapeBulldogjob();
    expect(Array.isArray(jobs)).toBe(true);
  });

  it('should handle network timeouts', async () => {
    mockFetch.mockRejectedValue(new Error('ETIMEDOUT'));

    const { scrapeBulldogjob } = await import('./bulldogjob.js');
    const jobs = await scrapeBulldogjob();
    expect(Array.isArray(jobs)).toBe(true);
  });

  it('should deduplicate jobs across searches', async () => {
    const html = `
      <html><body>
        <a href="/companies/jobs/same-job-everywhere">Same Job Everywhere</a>
      </body></html>
    `;

    mockFetch.mockResolvedValue({
      ok: true,
      text: async () => html,
    });

    const { scrapeBulldogjob } = await import('./bulldogjob.js');
    const jobs = await scrapeBulldogjob();

    const dupes = jobs.filter(j => j.id === 'bulldogjob:same-job-everywhere');
    expect(dupes.length).toBe(1);
  });
});

describe('Bulldogjob parseSalary (via HTML)', () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch);
    mockFetch.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should parse "15 000 - 25 000 PLN" salary format', async () => {
    const html = `
      <html><body>
        <div class="job-card">
          <h3 class="job-title">Data Lead</h3>
          <span class="company-name">Co</span>
          <span class="salary">15 000 - 25 000 PLN</span>
          <a href="/companies/jobs/data-lead-co">View</a>
        </div>
      </body></html>
    `;

    mockFetch.mockResolvedValue({ ok: true, text: async () => html });

    const { scrapeBulldogjob } = await import('./bulldogjob.js');
    const jobs = await scrapeBulldogjob();

    const found = jobs.find(j => j.title === 'Data Lead');
    expect(found).toBeDefined();
    expect(found!.salaryMin).toBe(15000);
    expect(found!.salaryMax).toBe(25000);
  });

  it('should handle missing salary', async () => {
    const html = `
      <html><body>
        <div class="job-card">
          <h3 class="job-title">VP Product</h3>
          <span class="company-name">StartupXYZ</span>
          <a href="/companies/jobs/vp-product">View</a>
        </div>
      </body></html>
    `;

    mockFetch.mockResolvedValue({ ok: true, text: async () => html });

    const { scrapeBulldogjob } = await import('./bulldogjob.js');
    const jobs = await scrapeBulldogjob();

    const found = jobs.find(j => j.title === 'VP Product');
    expect(found).toBeDefined();
    expect(found!.salaryMin).toBeNull();
    expect(found!.salaryMax).toBeNull();
  });
});
