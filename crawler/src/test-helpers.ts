import { Job, ScoredJob } from './config.js';

export function makeJob(overrides: Partial<Job> = {}): Job {
  return {
    id: 'test:job-1',
    source: 'test',
    title: 'Head of AI',
    company: 'Acme Corp',
    location: 'Warsaw',
    salaryMin: 30000,
    salaryMax: 45000,
    salaryCurrency: 'PLN',
    salaryPeriod: 'month',
    url: 'https://example.com/job/1',
    description: 'Lead our AI team and drive strategy.',
    skills: ['Python', 'Machine Learning', 'Leadership'],
    publishedAt: '2026-03-10T10:00:00Z',
    scrapedAt: '2026-03-11T08:00:00Z',
    ...overrides,
  };
}

export function makeScoredJob(overrides: Partial<ScoredJob> = {}): ScoredJob {
  return {
    ...makeJob(),
    score: 85,
    matchReasons: ['Senior leadership role', 'AI domain match'],
    gaps: ['No product experience mentioned'],
    verdict: 'strong_match',
    ...overrides,
  };
}
