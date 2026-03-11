import { CONFIG, Job } from './config.js';
import { scrapeJustJoin } from './scrapers/justjoin.js';
import { scrapeNoFluffJobs } from './scrapers/nofluffjobs.js';
import { scrapeBulldogjob } from './scrapers/bulldogjob.js';
import { scoreJob } from './scoring/relevance.js';
import {
  initDatabase,
  jobExists,
  insertJob,
  updateJobScore,
  getUnscoredJobs,
  getUnnotifiedJobs,
  markNotified,
  getStats,
  closeDatabase,
} from './storage/sqlite.js';
import { sendJobAlert, sendDigest, sendCrawlSummary } from './notifications/telegram.js';

async function crawl(): Promise<Job[]> {
  const allJobs: Job[] = [];

  // Run all scrapers, catching errors so one failure doesn't stop others
  const scrapers = [
    { name: 'JustJoin.it', fn: scrapeJustJoin },
    { name: 'NoFluffJobs', fn: scrapeNoFluffJobs },
    { name: 'Bulldogjob.pl', fn: scrapeBulldogjob },
  ];

  for (const scraper of scrapers) {
    try {
      const jobs = await scraper.fn();
      allJobs.push(...jobs);
      console.log(`[Crawl] ${scraper.name}: ${jobs.length} jobs`);
    } catch (err) {
      console.error(`[Crawl] ${scraper.name} failed:`, err);
    }
  }

  return allJobs;
}

async function main(): Promise<void> {
  console.log('=== Polish Job Crawler ===');
  console.log(`Started at ${new Date().toISOString()}`);
  console.log(`Scoring model: ${CONFIG.scoringModel}`);
  console.log(`Alert threshold: ${CONFIG.alertThreshold}`);
  console.log();

  // Initialize database
  initDatabase();

  // Step 1: Crawl all sources
  const allJobs = await crawl();
  console.log(`\n[Pipeline] Total scraped: ${allJobs.length}`);

  // Step 2: Deduplicate and store new jobs
  let newCount = 0;
  for (const job of allJobs) {
    if (!jobExists(job.id)) {
      insertJob(job);
      newCount++;
    }
  }
  console.log(`[Pipeline] New jobs: ${newCount}`);

  // Step 3: Score unscored jobs
  const unscored = getUnscoredJobs();
  console.log(`[Pipeline] Jobs to score: ${unscored.length}`);

  let strongMatchCount = 0;
  for (const job of unscored) {
    const result = await scoreJob(job);
    updateJobScore(job.id, result.score, result.match_reasons, result.gaps, result.verdict);

    if (result.score >= CONFIG.alertThreshold) {
      strongMatchCount++;
      console.log(`  ⭐ ${result.score}/100 — ${job.title} @ ${job.company} (${job.source})`);
    }
  }

  // Step 4: Send notifications for high-scoring jobs
  const toNotify = getUnnotifiedJobs(CONFIG.digestThreshold);
  console.log(`\n[Pipeline] Jobs to notify: ${toNotify.length}`);

  // Instant alerts for strong matches
  const strongMatches = toNotify.filter(j => j.score >= CONFIG.alertThreshold);
  for (const job of strongMatches) {
    await sendJobAlert(job);
    await new Promise(r => setTimeout(r, 1000)); // Telegram rate limit
  }

  // Digest for the rest
  const digestJobs = toNotify.filter(j => j.score < CONFIG.alertThreshold && j.score >= CONFIG.digestThreshold);
  if (digestJobs.length > 0) {
    await sendDigest(digestJobs);
  }

  // Mark all as notified
  if (toNotify.length > 0) {
    markNotified(toNotify.map(j => j.id));
  }

  // Summary
  await sendCrawlSummary(allJobs.length, newCount, strongMatchCount);

  // Stats
  const stats = getStats();
  console.log('\n=== Stats ===');
  console.log(`Total jobs in DB: ${stats.total}`);
  console.log(`Scored: ${stats.scored}`);
  console.log(`Strong matches (≥75): ${stats.strongMatches}`);
  console.log(`Added this week: ${stats.thisWeek}`);

  closeDatabase();
  console.log('\nDone.');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
