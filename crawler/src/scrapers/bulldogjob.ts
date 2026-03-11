import * as cheerio from 'cheerio';
import { Job, CONFIG } from '../config.js';

const BASE_URL = 'https://bulldogjob.pl/companies/jobs';

interface BulldogSearch {
  path: string;
  label: string;
}

const SEARCHES: BulldogSearch[] = [
  { path: '/s/role,ai/city,Warszawa', label: 'AI Warsaw' },
  { path: '/s/role,management/city,Warszawa', label: 'Management Warsaw' },
  { path: '/s/role,data/city,Warszawa', label: 'Data Warsaw' },
  { path: '/s/role,product-management/city,Warszawa', label: 'Product Warsaw' },
  { path: '/s/role,ai', label: 'AI all locations' },
  { path: '/s/role,management', label: 'Management all locations' },
];

async function fetchPage(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      'User-Agent': CONFIG.userAgent,
      'Accept': 'text/html,application/xhtml+xml',
      'Accept-Language': 'pl-PL,pl;q=0.9,en;q=0.8',
    },
  });

  if (!res.ok) {
    console.error(`[Bulldogjob] HTTP error: ${res.status} for ${url}`);
    return '';
  }

  return res.text();
}

function parseJobList(html: string, searchLabel: string): Job[] {
  const $ = cheerio.load(html);
  const jobs: Job[] = [];

  // Bulldogjob uses job card elements — selectors may need updating
  // These are the most common patterns:
  $('[data-testid="job-item"], .job-item, article.job, .job-card, .offer-card').each((_, el) => {
    const $el = $(el);

    const title = $el.find('h2, h3, .job-title, [data-testid="job-title"]').first().text().trim();
    const company = $el.find('.company-name, [data-testid="company-name"], .employer').first().text().trim();
    const link = $el.find('a[href*="/companies/jobs/"]').first().attr('href')
      || $el.find('a').first().attr('href')
      || '';
    const salaryText = $el.find('.salary, [data-testid="salary"], .money').first().text().trim();
    const location = $el.find('.location, [data-testid="location"], .city').first().text().trim() || 'Warsaw';

    if (!title || !link) return;

    const fullUrl = link.startsWith('http') ? link : `https://bulldogjob.pl${link}`;
    const slug = link.split('/').pop() || link;

    const { min, max } = parseSalary(salaryText);

    jobs.push({
      id: `bulldogjob:${slug}`,
      source: 'bulldogjob.pl',
      title,
      company,
      location,
      salaryMin: min,
      salaryMax: max,
      salaryCurrency: 'PLN',
      salaryPeriod: 'month',
      url: fullUrl,
      description: '',
      skills: extractSkills($el, $),
      publishedAt: new Date().toISOString(),
      scrapedAt: new Date().toISOString(),
    });
  });

  // Fallback: try to find job links if the above selectors didn't match
  if (jobs.length === 0) {
    $('a[href*="/companies/jobs/"]').each((_, el) => {
      const $a = $(el);
      const href = $a.attr('href') || '';
      // Skip navigation/category links
      if (href.includes('/s/') || href === '/companies/jobs/' || href.endsWith('/jobs')) return;

      const title = $a.text().trim();
      if (!title || title.length < 3 || title.length > 200) return;

      const fullUrl = href.startsWith('http') ? href : `https://bulldogjob.pl${href}`;
      const slug = href.split('/').pop() || href;

      jobs.push({
        id: `bulldogjob:${slug}`,
        source: 'bulldogjob.pl',
        title,
        company: '',
        location: 'Warsaw',
        salaryMin: null,
        salaryMax: null,
        salaryCurrency: 'PLN',
        salaryPeriod: 'month',
        url: fullUrl,
        description: '',
        skills: [],
        publishedAt: new Date().toISOString(),
        scrapedAt: new Date().toISOString(),
      });
    });
  }

  return jobs;
}

function extractSkills($el: cheerio.Cheerio<any>, $: cheerio.CheerioAPI): string[] {
  const skills: string[] = [];
  $el.find('.skill, .tag, .tech-tag, [data-testid="skill"]').each((_, tag) => {
    const text = $(tag).text().trim();
    if (text) skills.push(text);
  });
  return skills;
}

function parseSalary(text: string): { min: number | null; max: number | null } {
  if (!text) return { min: null, max: null };

  // Match patterns like "15 000 - 25 000 PLN" or "15000-25000"
  const match = text.replace(/\s/g, '').match(/(\d+)[–\-−](\d+)/);
  if (match) {
    return { min: parseInt(match[1], 10), max: parseInt(match[2], 10) };
  }

  // Single number
  const single = text.replace(/\s/g, '').match(/(\d{4,})/);
  if (single) {
    return { min: parseInt(single[1], 10), max: null };
  }

  return { min: null, max: null };
}

export async function scrapeBulldogjob(): Promise<Job[]> {
  console.log('[Bulldogjob.pl] Starting crawl...');
  const allJobs: Map<string, Job> = new Map();

  for (const search of SEARCHES) {
    const url = `${BASE_URL}${search.path}`;
    try {
      const html = await fetchPage(url);
      if (html) {
        const jobs = parseJobList(html, search.label);
        for (const job of jobs) {
          allJobs.set(job.id, job);
        }
        console.log(`[Bulldogjob.pl] "${search.label}": ${jobs.length} jobs`);
      }
      await delay(CONFIG.requestDelayMs);
    } catch (err) {
      console.error(`[Bulldogjob.pl] Error crawling "${search.label}":`, err);
    }
  }

  const jobs = Array.from(allJobs.values());
  console.log(`[Bulldogjob.pl] Found ${jobs.length} unique jobs total`);
  return jobs;
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
