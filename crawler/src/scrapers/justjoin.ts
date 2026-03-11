import { Job, CONFIG, SEARCH_QUERIES } from '../config.js';

const BASE_URL = 'https://api.justjoin.it/v2/user-panel/offers';

interface JustJoinOffer {
  slug: string;
  title: string;
  companyName: string;
  city: string;
  workplaceType: string;
  employmentTypes: Array<{
    from: number | null;
    to: number | null;
    currency: string;
    type: string;
  }>;
  requiredSkills: string[];
  publishedAt: string;
  body?: string;
}

async function fetchPage(params: URLSearchParams, page: number): Promise<JustJoinOffer[]> {
  params.set('page', String(page));
  params.set('perPage', '50');
  params.set('sortBy', 'published');
  params.set('orderBy', 'DESC');

  const url = `${BASE_URL}?${params.toString()}`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': CONFIG.userAgent,
      'Accept': 'application/json',
      'Version': '2',
    },
  });

  if (!res.ok) {
    console.error(`JustJoin API error: ${res.status} ${res.statusText}`);
    return [];
  }

  const data = await res.json() as { data?: JustJoinOffer[] };
  return data.data || [];
}

function mapToJob(offer: JustJoinOffer): Job {
  const emp = offer.employmentTypes?.[0];
  return {
    id: `justjoin:${offer.slug}`,
    source: 'justjoin.it',
    title: offer.title,
    company: offer.companyName,
    location: offer.city || 'Remote',
    salaryMin: emp?.from || null,
    salaryMax: emp?.to || null,
    salaryCurrency: emp?.currency?.toUpperCase() || null,
    salaryPeriod: 'month',
    url: `https://justjoin.it/offers/${offer.slug}`,
    description: offer.body || '',
    skills: offer.requiredSkills || [],
    publishedAt: offer.publishedAt,
    scrapedAt: new Date().toISOString(),
  };
}

export async function scrapeJustJoin(): Promise<Job[]> {
  console.log('[JustJoin.it] Starting crawl...');
  const allJobs: Map<string, Job> = new Map();

  // Strategy 1: Search by management/director categories for Warsaw
  const categorySearches = [
    { slug: 'warszawa', categories: ['management'] },
    { slug: 'warszawa', categories: ['data'] },
    { slug: 'warszawa', categories: ['artificial-intelligence'] },
    { slug: 'warszawa', categories: ['product-management'] },
    { slug: 'all-locations', categories: ['management'] },
  ];

  for (const search of categorySearches) {
    const params = new URLSearchParams();
    if (search.slug !== 'all-locations') {
      params.set('slug', search.slug);
    }
    for (const cat of search.categories) {
      params.append('categories[]', cat);
    }
    params.set('experienceLevel[]', 'senior');
    params.set('experienceLevel[]', 'c-level');

    try {
      const offers = await fetchPage(params, 1);
      for (const offer of offers) {
        const job = mapToJob(offer);
        allJobs.set(job.id, job);
      }
      await delay(CONFIG.requestDelayMs);
    } catch (err) {
      console.error(`[JustJoin.it] Error fetching category ${search.categories}:`, err);
    }
  }

  // Strategy 2: Search by specific title keywords
  const titleKeywords = [
    'Director', 'Head of', 'VP', 'Chief', 'Lead AI', 'Lead Data',
  ];

  for (const keyword of titleKeywords) {
    const params = new URLSearchParams();
    params.set('slug', 'warszawa');
    params.set('keyword', keyword);

    try {
      const offers = await fetchPage(params, 1);
      for (const offer of offers) {
        const job = mapToJob(offer);
        allJobs.set(job.id, job);
      }
      await delay(CONFIG.requestDelayMs);
    } catch (err) {
      console.error(`[JustJoin.it] Error searching keyword "${keyword}":`, err);
    }
  }

  const jobs = Array.from(allJobs.values());
  console.log(`[JustJoin.it] Found ${jobs.length} unique jobs`);
  return jobs;
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
