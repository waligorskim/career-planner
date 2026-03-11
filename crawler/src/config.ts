import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export const CONFIG = {
  // Scoring
  anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
  scoringModel: process.env.SCORING_MODEL || 'claude-haiku-4-5-20251001',
  alertThreshold: parseInt(process.env.ALERT_THRESHOLD || '75', 10),
  digestThreshold: parseInt(process.env.DIGEST_THRESHOLD || '50', 10),

  // Telegram
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || '',
  telegramChatId: process.env.TELEGRAM_CHAT_ID || '',

  // Crawling
  requestDelayMs: 2000,
  userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',

  // Database
  dbPath: join(__dirname, '..', 'data', 'jobs.db'),

  // Profile
  profileSummary: loadProfileSummary(),
};

function loadProfileSummary(): string {
  try {
    return readFileSync(join(__dirname, '..', 'profile-summary.txt'), 'utf-8');
  } catch {
    console.warn('Warning: profile-summary.txt not found, scoring will be less accurate');
    return 'Senior technology leader, 16+ years experience, Warsaw Poland, targeting Director/Head/VP roles in AI, Data, Product, UX.';
  }
}

export interface Job {
  id: string;
  source: string;
  title: string;
  company: string;
  location: string;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string | null;
  salaryPeriod: string | null;
  url: string;
  description: string;
  skills: string[];
  publishedAt: string;
  scrapedAt: string;
}

export interface ScoredJob extends Job {
  score: number;
  matchReasons: string[];
  gaps: string[];
  verdict: 'strong_match' | 'possible_match' | 'weak_match' | 'no_match';
}

// Keywords to search across boards
export const SEARCH_QUERIES = {
  titles: [
    'Head of AI',
    'Director of AI',
    'VP AI',
    'Chief AI Officer',
    'Head of Data',
    'Director of Data',
    'Chief Data Officer',
    'Head of Analytics',
    'Director of Analytics',
    'Head of Product',
    'Director of Product',
    'VP Product',
    'CPO',
    'Head of Digital',
    'Director of Digital',
    'Head of UX',
    'CTO',
    'AI Lead',
    'Digital Transformation',
    'Entrepreneur in Residence',
  ],
  polishTitles: [
    'Dyrektor IT',
    'Dyrektor ds. Cyfrowych',
    'Dyrektor Danych',
    'Kierownik AI',
    'Szef Analityki',
    'Dyrektor Produktu',
  ],
  keywords: [
    'AI strategy',
    'generative AI',
    'LLM',
    'machine learning',
    'data-driven',
    'digital transformation',
    'product analytics',
  ],
  minSalaryPLN: 20000,
};
