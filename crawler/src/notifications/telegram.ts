import { CONFIG, ScoredJob } from '../config.js';

const API_BASE = 'https://api.telegram.org/bot';

async function sendMessage(text: string, parseMode: 'HTML' | 'Markdown' = 'HTML'): Promise<boolean> {
  if (!CONFIG.telegramBotToken || !CONFIG.telegramChatId) {
    console.warn('[Telegram] Bot token or chat ID not configured, skipping notification');
    console.log('[Telegram] Would have sent:\n', text);
    return false;
  }

  const url = `${API_BASE}${CONFIG.telegramBotToken}/sendMessage`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CONFIG.telegramChatId,
        text,
        parse_mode: parseMode,
        disable_web_page_preview: true,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error(`[Telegram] API error: ${res.status} ${err}`);
      return false;
    }

    return true;
  } catch (err) {
    console.error('[Telegram] Send error:', err);
    return false;
  }
}

function formatSalary(job: ScoredJob): string {
  if (!job.salaryMin) return '💰 Not specified';
  const max = job.salaryMax ? `–${job.salaryMax.toLocaleString('pl-PL')}` : '+';
  return `💰 ${job.salaryMin.toLocaleString('pl-PL')}${max} ${job.salaryCurrency || 'PLN'}/${job.salaryPeriod || 'mo'}`;
}

function formatScoreBadge(score: number): string {
  if (score >= 90) return '🟢🟢🟢';
  if (score >= 80) return '🟢🟢';
  if (score >= 70) return '🟢';
  if (score >= 60) return '🟡';
  return '🔴';
}

export async function sendJobAlert(job: ScoredJob): Promise<boolean> {
  const badge = formatScoreBadge(job.score);
  const salary = formatSalary(job);

  const message = [
    `${badge} <b>Score: ${job.score}/100</b>`,
    '',
    `<b>${escapeHtml(job.title)}</b>`,
    `🏢 ${escapeHtml(job.company)}`,
    `📍 ${escapeHtml(job.location)}`,
    salary,
    `📋 ${escapeHtml(job.source)}`,
    '',
    job.matchReasons.length > 0
      ? `✅ ${job.matchReasons.map(r => escapeHtml(r)).join('\n✅ ')}`
      : '',
    job.gaps.length > 0
      ? `⚠️ ${job.gaps.map(g => escapeHtml(g)).join('\n⚠️ ')}`
      : '',
    '',
    `🔗 <a href="${job.url}">View posting</a>`,
  ].filter(Boolean).join('\n');

  return sendMessage(message);
}

export async function sendDigest(jobs: ScoredJob[]): Promise<boolean> {
  if (jobs.length === 0) {
    return sendMessage('📊 <b>Daily Job Digest</b>\n\nNo new matching jobs found today.');
  }

  const lines = [
    `📊 <b>Daily Job Digest</b> — ${jobs.length} new match${jobs.length === 1 ? '' : 'es'}`,
    '',
  ];

  for (const job of jobs.slice(0, 15)) { // Telegram message limit
    const badge = formatScoreBadge(job.score);
    const salary = job.salaryMin
      ? ` | ${job.salaryMin.toLocaleString('pl-PL')}${job.salaryMax ? '–' + job.salaryMax.toLocaleString('pl-PL') : '+'} ${job.salaryCurrency || 'PLN'}`
      : '';
    lines.push(
      `${badge} <b>${job.score}</b> | <a href="${job.url}">${escapeHtml(job.title)}</a>`,
      `   ${escapeHtml(job.company)} | ${escapeHtml(job.location)}${salary}`,
      '',
    );
  }

  if (jobs.length > 15) {
    lines.push(`<i>... and ${jobs.length - 15} more</i>`);
  }

  return sendMessage(lines.join('\n'));
}

export async function sendCrawlSummary(
  totalScraped: number,
  newJobs: number,
  strongMatches: number,
): Promise<boolean> {
  const msg = [
    `🤖 <b>Crawl Complete</b>`,
    `Scraped: ${totalScraped} | New: ${newJobs} | Strong matches: ${strongMatches}`,
  ].join('\n');
  return sendMessage(msg);
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
