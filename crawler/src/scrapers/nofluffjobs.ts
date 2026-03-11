import { Job, CONFIG, SEARCH_QUERIES } from '../config.js';

const BASE_URL = 'https://nofluffjobs.com/api';

interface NoFluffPosting {
  id: string;
  name: string;
  title: string;
  url: string;
  salary?: {
    from: number;
    to: number;
    currency: string;
    type: string;    // "month" | "year" | "hour"
  };
  location?: {
    places: Array<{ city: string; url: string }>;
  };
  company?: {
    name: string;
  };
  posted: number;    // timestamp
  category: string;
  seniority: string[];
  technology?: string[];
  tiles?: {
    values: Array<{ value: string; type: string }>;
  };
}

interface NoFluffSearchResponse {
  postings: NoFluffPosting[];
  totalCount: number;
  totalPages: number;
}

async function searchPostings(criteria: string): Promise<NoFluffPosting[]> {
  // NoFluffJobs uses a criteria-based search in the URL
  const url = `${BASE_URL}/search/posting?criteria=${encodeURIComponent(criteria)}`;

  const res = await fetch(url, {
    headers: {
      'User-Agent': CONFIG.userAgent,
      'Accept': 'application/json',
    },
  });

  if (!res.ok) {
    console.error(`[NoFluffJobs] API error: ${res.status} ${res.statusText}`);
    return [];
  }

  const data = await res.json() as NoFluffSearchResponse;
  return data.postings || [];
}

async function getPostingDetails(postingId: string): Promise<string> {
  try {
    const res = await fetch(`${BASE_URL}/posting/${postingId}`, {
      headers: {
        'User-Agent': CONFIG.userAgent,
        'Accept': 'application/json',
      },
    });
    if (!res.ok) return '';
    const data = await res.json() as { requirements?: { description?: string }; body?: string };
    return data.requirements?.description || data.body || '';
  } catch {
    return '';
  }
}

function mapToJob(posting: NoFluffPosting): Job {
  const city = posting.location?.places?.[0]?.city || 'Remote';
  return {
    id: `nofluff:${posting.id}`,
    source: 'nofluffjobs.com',
    title: posting.title || posting.name,
    company: posting.company?.name || 'Unknown',
    location: city,
    salaryMin: posting.salary?.from || null,
    salaryMax: posting.salary?.to || null,
    salaryCurrency: posting.salary?.currency?.toUpperCase() || 'PLN',
    salaryPeriod: posting.salary?.type || 'month',
    url: `https://nofluffjobs.com/pl/job/${posting.url || posting.id}`,
    description: '',
    skills: posting.technology || [],
    publishedAt: posting.posted ? new Date(posting.posted).toISOString() : new Date().toISOString(),
    scrapedAt: new Date().toISOString(),
  };
}

export async function scrapeNoFluffJobs(): Promise<Job[]> {
  console.log('[NoFluffJobs] Starting crawl...');
  const allJobs: Map<string, Job> = new Map();

  // Different search criteria to cast a wide net
  const searches = [
    // Senior management roles with salary floor
    `salary>pln${SEARCH_QUERIES.minSalaryPLN}m seniority=senior,expert`,
    // Director-level keyword searches
    'keyword=director,head,dyrektor,manager',
    // AI-specific roles
    'category=artificial-intelligence',
    // Data roles
    'category=business-intelligence',
    // Product/project management
    'category=project-manager salary>pln20000m',
    // Specific title searches
    'keyword=head,AI,data,analytics,product',
  ];

  for (const criteria of searches) {
    try {
      const postings = await searchPostings(criteria);
      for (const posting of postings) {
        const job = mapToJob(posting);
        allJobs.set(job.id, job);
      }
      await delay(CONFIG.requestDelayMs);
    } catch (err) {
      console.error(`[NoFluffJobs] Error searching "${criteria}":`, err);
    }
  }

  // Fetch descriptions for top jobs (limit to avoid rate limiting)
  const jobs = Array.from(allJobs.values());
  const topJobs = jobs.slice(0, 30); // Only fetch details for first 30
  for (const job of topJobs) {
    const postingId = job.id.replace('nofluff:', '');
    job.description = await getPostingDetails(postingId);
    await delay(1000);
  }

  console.log(`[NoFluffJobs] Found ${jobs.length} unique jobs`);
  return jobs;
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
