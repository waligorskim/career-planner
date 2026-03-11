import Anthropic from '@anthropic-ai/sdk';
import { CONFIG, Job, ScoredJob } from '../config.js';

let client: Anthropic;

function getClient(): Anthropic {
  if (!client) {
    client = new Anthropic({ apiKey: CONFIG.anthropicApiKey });
  }
  return client;
}

interface ScoreResult {
  score: number;
  match_reasons: string[];
  gaps: string[];
  verdict: 'strong_match' | 'possible_match' | 'weak_match' | 'no_match';
}

export async function scoreJob(job: Job): Promise<ScoreResult> {
  const salaryInfo = job.salaryMin
    ? `${job.salaryMin}${job.salaryMax ? '–' + job.salaryMax : '+'} ${job.salaryCurrency || 'PLN'}/${job.salaryPeriod || 'month'}`
    : 'Not specified';

  const prompt = `You are a job-matching assistant. Score how well this job posting matches the candidate profile below.

CANDIDATE PROFILE:
${CONFIG.profileSummary}

JOB POSTING:
Title: ${job.title}
Company: ${job.company}
Location: ${job.location}
Salary: ${salaryInfo}
Skills required: ${job.skills.join(', ') || 'Not listed'}
Description: ${job.description ? job.description.slice(0, 3000) : 'No description available — score based on title, company, and skills.'}

SCORING GUIDELINES:
- 90-100: Perfect match — senior leadership role in AI/Data/Product/Digital, strong company, Warsaw
- 75-89: Strong match — right seniority and domain, minor gaps
- 60-74: Possible match — partially overlapping domain or slightly lower seniority
- 40-59: Weak match — some relevance but significant gaps in seniority or domain
- 0-39: No match — wrong seniority, wrong domain, or clearly not relevant

Consider: seniority level, domain overlap (AI/Data/Analytics/Product/UX/Digital), company quality, location (Warsaw preferred, remote OK), and salary (25k+ PLN/month preferred).

Return ONLY valid JSON, no other text:
{"score": <0-100>, "match_reasons": ["reason1", "reason2"], "gaps": ["gap1"], "verdict": "strong_match|possible_match|weak_match|no_match"}`;

  try {
    const response = await getClient().messages.create({
      model: CONFIG.scoringModel,
      max_tokens: 300,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    // Extract JSON from response (handle potential markdown wrapping)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.warn(`[Scorer] Could not parse JSON from response for ${job.id}: ${text}`);
      return fallbackScore(job);
    }

    const result = JSON.parse(jsonMatch[0]) as ScoreResult;
    return {
      score: Math.max(0, Math.min(100, result.score)),
      match_reasons: result.match_reasons || [],
      gaps: result.gaps || [],
      verdict: result.verdict || categorizeScore(result.score),
    };
  } catch (err) {
    console.error(`[Scorer] Error scoring job ${job.id}:`, err);
    return fallbackScore(job);
  }
}

function fallbackScore(job: Job): ScoreResult {
  // Simple keyword-based fallback when API is unavailable
  const text = `${job.title} ${job.description}`.toLowerCase();
  let score = 30;

  const strongTitleWords = ['head of', 'director', 'vp ', 'vice president', 'chief', 'cto', 'cdo', 'cpo', 'dyrektor'];
  const domainWords = ['ai', 'artificial intelligence', 'data', 'analytics', 'product', 'ux', 'digital', 'machine learning', 'llm'];
  const bonusWords = ['gemini', 'e-commerce', 'startup', 'transformation', 'strategy'];

  for (const w of strongTitleWords) {
    if (text.includes(w)) { score += 15; break; }
  }
  for (const w of domainWords) {
    if (text.includes(w)) { score += 10; break; }
  }
  for (const w of bonusWords) {
    if (text.includes(w)) { score += 5; break; }
  }

  return {
    score: Math.min(score, 70), // Cap fallback at 70
    match_reasons: ['Scored by keyword fallback (API unavailable)'],
    gaps: ['Full AI scoring unavailable'],
    verdict: categorizeScore(score),
  };
}

function categorizeScore(score: number): ScoreResult['verdict'] {
  if (score >= 75) return 'strong_match';
  if (score >= 60) return 'possible_match';
  if (score >= 40) return 'weak_match';
  return 'no_match';
}

export async function scoreJobs(jobs: Job[]): Promise<ScoredJob[]> {
  console.log(`[Scorer] Scoring ${jobs.length} jobs...`);
  const scored: ScoredJob[] = [];

  for (const job of jobs) {
    const result = await scoreJob(job);
    scored.push({
      ...job,
      score: result.score,
      matchReasons: result.match_reasons,
      gaps: result.gaps,
      verdict: result.verdict,
    });

    // Brief delay to avoid rate limiting
    await new Promise(r => setTimeout(r, 500));
  }

  scored.sort((a, b) => b.score - a.score);
  console.log(`[Scorer] Done. Top score: ${scored[0]?.score || 0}, matches ≥75: ${scored.filter(j => j.score >= 75).length}`);
  return scored;
}
