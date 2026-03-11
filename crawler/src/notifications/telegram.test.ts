import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { makeScoredJob } from '../test-helpers.js';

vi.mock('../config.js', () => ({
  CONFIG: {
    telegramBotToken: 'test-token-123',
    telegramChatId: '12345',
  },
}));

describe('Telegram Notifications', () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch);
    mockFetch.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('sendJobAlert', () => {
    it('should send a formatted alert for a high-scoring job', async () => {
      mockFetch.mockResolvedValue({ ok: true });

      const { sendJobAlert } = await import('./telegram.js');
      const job = makeScoredJob({
        score: 92,
        title: 'Head of AI',
        company: 'Acme Corp',
        location: 'Warsaw',
        salaryMin: 30000,
        salaryMax: 45000,
      });

      const result = await sendJobAlert(job);
      expect(result).toBe(true);

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [url, options] = mockFetch.mock.calls[0];
      expect(url).toContain('test-token-123');
      expect(url).toContain('sendMessage');

      const body = JSON.parse(options.body);
      expect(body.chat_id).toBe('12345');
      expect(body.text).toContain('92/100');
      expect(body.text).toContain('Head of AI');
      expect(body.text).toContain('Acme Corp');
      expect(body.parse_mode).toBe('HTML');
    });

    it('should escape HTML in job details', async () => {
      mockFetch.mockResolvedValue({ ok: true });

      const { sendJobAlert } = await import('./telegram.js');
      const job = makeScoredJob({
        title: 'Lead <AI> & Data',
        company: 'Corp "R&D"',
      });

      await sendJobAlert(job);

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.text).toContain('&lt;AI&gt;');
      expect(body.text).toContain('&amp;');
      expect(body.text).not.toContain('<AI>');
    });

    it('should handle Telegram API errors', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 429,
        text: async () => 'Too Many Requests',
      });

      const { sendJobAlert } = await import('./telegram.js');
      const result = await sendJobAlert(makeScoredJob());
      expect(result).toBe(false);
    });

    it('should handle network failure', async () => {
      mockFetch.mockRejectedValue(new Error('DNS resolution failed'));

      const { sendJobAlert } = await import('./telegram.js');
      const result = await sendJobAlert(makeScoredJob());
      expect(result).toBe(false);
    });
  });

  describe('sendDigest', () => {
    it('should format digest with multiple jobs', async () => {
      mockFetch.mockResolvedValue({ ok: true });

      const { sendDigest } = await import('./telegram.js');
      const jobs = [
        makeScoredJob({ title: 'Job A', score: 70 }),
        makeScoredJob({ title: 'Job B', score: 60 }),
      ];

      const result = await sendDigest(jobs);
      expect(result).toBe(true);

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.text).toContain('Daily Job Digest');
      expect(body.text).toContain('2 new matches');
    });

    it('should handle empty digest', async () => {
      mockFetch.mockResolvedValue({ ok: true });

      const { sendDigest } = await import('./telegram.js');
      const result = await sendDigest([]);
      expect(result).toBe(true);

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.text).toContain('No new matching jobs');
    });

    it('should truncate digest at 15 jobs', async () => {
      mockFetch.mockResolvedValue({ ok: true });

      const { sendDigest } = await import('./telegram.js');
      const jobs = Array.from({ length: 20 }, (_, i) =>
        makeScoredJob({ id: `test:digest-${i}`, title: `Job ${i}`, score: 65 }),
      );

      await sendDigest(jobs);

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.text).toContain('and 5 more');
    });

    it('should show singular "match" for single job', async () => {
      mockFetch.mockResolvedValue({ ok: true });

      const { sendDigest } = await import('./telegram.js');
      await sendDigest([makeScoredJob()]);

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.text).toContain('1 new match');
      expect(body.text).not.toContain('1 new matches');
    });
  });

  describe('sendCrawlSummary', () => {
    it('should send summary with correct counts', async () => {
      mockFetch.mockResolvedValue({ ok: true });

      const { sendCrawlSummary } = await import('./telegram.js');
      const result = await sendCrawlSummary(150, 12, 3);
      expect(result).toBe(true);

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.text).toContain('150');
      expect(body.text).toContain('12');
      expect(body.text).toContain('3');
    });
  });
});

describe('Telegram Notifications (no config)', () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch);
    mockFetch.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should skip sending when bot token is missing', async () => {
    vi.doMock('../config.js', () => ({
      CONFIG: {
        telegramBotToken: '',
        telegramChatId: '12345',
      },
    }));
    vi.resetModules();

    const { sendJobAlert } = await import('./telegram.js');
    const result = await sendJobAlert(makeScoredJob());
    expect(result).toBe(false);
    expect(mockFetch).not.toHaveBeenCalled();
  });
});
