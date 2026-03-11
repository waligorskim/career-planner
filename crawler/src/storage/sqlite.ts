import Database from 'better-sqlite3';
import { mkdirSync } from 'fs';
import { dirname } from 'path';
import { CONFIG, Job, ScoredJob } from '../config.js';

let db: Database.Database;

export function initDatabase(): void {
  mkdirSync(dirname(CONFIG.dbPath), { recursive: true });
  db = new Database(CONFIG.dbPath);
  db.pragma('journal_mode = WAL');

  db.exec(`
    CREATE TABLE IF NOT EXISTS jobs (
      id TEXT PRIMARY KEY,
      source TEXT NOT NULL,
      title TEXT NOT NULL,
      company TEXT,
      location TEXT,
      salary_min INTEGER,
      salary_max INTEGER,
      salary_currency TEXT,
      salary_period TEXT,
      url TEXT NOT NULL,
      description TEXT,
      skills TEXT,
      published_at TEXT,
      scraped_at TEXT NOT NULL,
      score INTEGER,
      match_reasons TEXT,
      gaps TEXT,
      verdict TEXT,
      notified INTEGER DEFAULT 0,
      status TEXT DEFAULT 'new',
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_jobs_score ON jobs(score);
    CREATE INDEX IF NOT EXISTS idx_jobs_source ON jobs(source);
    CREATE INDEX IF NOT EXISTS idx_jobs_created ON jobs(created_at);
    CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
  `);
}

export function jobExists(id: string): boolean {
  const row = db.prepare('SELECT 1 FROM jobs WHERE id = ?').get(id);
  return !!row;
}

export function insertJob(job: Job): void {
  db.prepare(`
    INSERT OR IGNORE INTO jobs (id, source, title, company, location, salary_min, salary_max,
      salary_currency, salary_period, url, description, skills, published_at, scraped_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    job.id, job.source, job.title, job.company, job.location,
    job.salaryMin, job.salaryMax, job.salaryCurrency, job.salaryPeriod,
    job.url, job.description, JSON.stringify(job.skills),
    job.publishedAt, job.scrapedAt,
  );
}

export function updateJobScore(id: string, score: number, matchReasons: string[], gaps: string[], verdict: string): void {
  db.prepare(`
    UPDATE jobs SET score = ?, match_reasons = ?, gaps = ?, verdict = ?, updated_at = datetime('now')
    WHERE id = ?
  `).run(score, JSON.stringify(matchReasons), JSON.stringify(gaps), verdict, id);
}

export function getUnscoredJobs(): Job[] {
  const rows = db.prepare('SELECT * FROM jobs WHERE score IS NULL ORDER BY created_at DESC').all() as any[];
  return rows.map(rowToJob);
}

export function getUnnotifiedJobs(minScore: number): ScoredJob[] {
  const rows = db.prepare(
    'SELECT * FROM jobs WHERE score >= ? AND notified = 0 ORDER BY score DESC'
  ).all(minScore) as any[];
  return rows.map(rowToScoredJob);
}

export function markNotified(ids: string[]): void {
  const stmt = db.prepare('UPDATE jobs SET notified = 1 WHERE id = ?');
  const batch = db.transaction((jobIds: string[]) => {
    for (const id of jobIds) stmt.run(id);
  });
  batch(ids);
}

export function getRecentJobs(days: number = 7, minScore: number = 0): ScoredJob[] {
  const rows = db.prepare(`
    SELECT * FROM jobs
    WHERE created_at >= datetime('now', '-' || ? || ' days')
      AND (score IS NULL OR score >= ?)
    ORDER BY score DESC, created_at DESC
  `).all(days, minScore) as any[];
  return rows.map(rowToScoredJob);
}

export function getStats(): { total: number; scored: number; strongMatches: number; thisWeek: number } {
  const total = (db.prepare('SELECT COUNT(*) as c FROM jobs').get() as any).c;
  const scored = (db.prepare('SELECT COUNT(*) as c FROM jobs WHERE score IS NOT NULL').get() as any).c;
  const strongMatches = (db.prepare('SELECT COUNT(*) as c FROM jobs WHERE score >= 75').get() as any).c;
  const thisWeek = (db.prepare("SELECT COUNT(*) as c FROM jobs WHERE created_at >= datetime('now', '-7 days')").get() as any).c;
  return { total, scored, strongMatches, thisWeek };
}

function rowToJob(row: any): Job {
  return {
    id: row.id,
    source: row.source,
    title: row.title,
    company: row.company,
    location: row.location,
    salaryMin: row.salary_min,
    salaryMax: row.salary_max,
    salaryCurrency: row.salary_currency,
    salaryPeriod: row.salary_period,
    url: row.url,
    description: row.description,
    skills: JSON.parse(row.skills || '[]'),
    publishedAt: row.published_at,
    scrapedAt: row.scraped_at,
  };
}

function rowToScoredJob(row: any): ScoredJob {
  return {
    ...rowToJob(row),
    score: row.score ?? 0,
    matchReasons: JSON.parse(row.match_reasons || '[]'),
    gaps: JSON.parse(row.gaps || '[]'),
    verdict: row.verdict || 'no_match',
  };
}

export function closeDatabase(): void {
  if (db) db.close();
}
