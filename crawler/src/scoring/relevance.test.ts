import { describe, it, expect, vi, beforeEach } from 'vitest';
import { makeJob } from '../test-helpers.js';

// Mock the config
vi.mock('../config.js', () => ({
  CONFIG: {
    anthropicApiKey: '',
    scoringModel: 'claude-haiku-4-5-20251001',
    profileSummary: 'Senior technology leader, 16+ years experience, Warsaw Poland, targeting Director/Head/VP roles in AI, Data, Product, UX.',
  },
}));

// Mock Anthropic SDK with a class
vi.mock('@anthropic-ai/sdk', () => {
  return {
    default: class MockAnthropic {
      messages = {
        create: vi.fn(),
      };
    },
  };
});

describe('Relevance Scoring', () => {
  describe('fallback scoring (no API key)', () => {
    it('should score "Head of AI" highly via keywords', async () => {
      const { scoreJob } = await import('./relevance.js');

      const job = makeJob({
        title: 'Head of AI',
        description: 'Lead AI strategy and machine learning initiatives',
      });

      const result = await scoreJob(job);
      expect(result.score).toBeGreaterThanOrEqual(40);
      expect(result.score).toBeLessThanOrEqual(70);
      expect(result.match_reasons).toContain('Scored by keyword fallback (API unavailable)');
    });

    it('should score irrelevant jobs low', async () => {
      const { scoreJob } = await import('./relevance.js');

      const job = makeJob({
        title: 'Junior Frontend Developer',
        description: 'Build React components for our web app',
      });

      const result = await scoreJob(job);
      expect(result.score).toBeLessThanOrEqual(40);
    });

    it('should score director-level data roles well', async () => {
      const { scoreJob } = await import('./relevance.js');

      const job = makeJob({
        title: 'Director of Data',
        description: 'Lead data analytics organization',
      });

      const result = await scoreJob(job);
      expect(result.score).toBeGreaterThanOrEqual(50);
    });

    it('should recognize Polish title keywords', async () => {
      const { scoreJob } = await import('./relevance.js');

      const job = makeJob({
        title: 'Dyrektor ds. Cyfrowych',
        description: 'Digital transformation strategy',
      });

      const result = await scoreJob(job);
      expect(result.score).toBeGreaterThanOrEqual(45);
    });

    it('should cap fallback scores at 70', async () => {
      const { scoreJob } = await import('./relevance.js');

      const job = makeJob({
        title: 'Chief AI Officer and VP of Data',
        description: 'Head of AI artificial intelligence data analytics machine learning LLM digital transformation e-commerce startup strategy',
      });

      const result = await scoreJob(job);
      expect(result.score).toBeLessThanOrEqual(70);
    });
  });

  describe('API-based scoring', () => {
    it('should parse valid JSON response from Claude', async () => {
      const mockCreate = vi.fn().mockResolvedValue({
        content: [{
          type: 'text',
          text: '{"score": 92, "match_reasons": ["Perfect domain match"], "gaps": [], "verdict": "strong_match"}',
        }],
      });

      vi.doMock('@anthropic-ai/sdk', () => ({
        default: class MockAnthropic {
          messages = { create: mockCreate };
        },
      }));

      vi.resetModules();
      vi.doMock('../config.js', () => ({
        CONFIG: {
          anthropicApiKey: 'test-key',
          scoringModel: 'claude-haiku-4-5-20251001',
          profileSummary: 'Test profile',
        },
      }));

      const { scoreJob } = await import('./relevance.js');
      const job = makeJob({ title: 'Head of AI' });
      const result = await scoreJob(job);

      expect(result.score).toBe(92);
      expect(result.match_reasons).toEqual(['Perfect domain match']);
      expect(result.verdict).toBe('strong_match');
    });

    it('should handle markdown-wrapped JSON responses', async () => {
      const mockCreate = vi.fn().mockResolvedValue({
        content: [{
          type: 'text',
          text: '```json\n{"score": 80, "match_reasons": ["Good"], "gaps": ["Some gap"], "verdict": "strong_match"}\n```',
        }],
      });

      vi.doMock('@anthropic-ai/sdk', () => ({
        default: class MockAnthropic {
          messages = { create: mockCreate };
        },
      }));

      vi.resetModules();
      vi.doMock('../config.js', () => ({
        CONFIG: {
          anthropicApiKey: 'test-key',
          scoringModel: 'claude-haiku-4-5-20251001',
          profileSummary: 'Test profile',
        },
      }));

      const { scoreJob } = await import('./relevance.js');
      const result = await scoreJob(makeJob());

      expect(result.score).toBe(80);
    });

    it('should clamp scores to 0-100 range', async () => {
      const mockCreate = vi.fn().mockResolvedValue({
        content: [{
          type: 'text',
          text: '{"score": 150, "match_reasons": [], "gaps": [], "verdict": "strong_match"}',
        }],
      });

      vi.doMock('@anthropic-ai/sdk', () => ({
        default: class MockAnthropic {
          messages = { create: mockCreate };
        },
      }));

      vi.resetModules();
      vi.doMock('../config.js', () => ({
        CONFIG: {
          anthropicApiKey: 'test-key',
          scoringModel: 'claude-haiku-4-5-20251001',
          profileSummary: 'Test profile',
        },
      }));

      const { scoreJob } = await import('./relevance.js');
      const result = await scoreJob(makeJob());

      expect(result.score).toBe(100);
    });

    it('should fall back to keyword scoring on API error', async () => {
      const mockCreate = vi.fn().mockRejectedValue(new Error('API timeout'));

      vi.doMock('@anthropic-ai/sdk', () => ({
        default: class MockAnthropic {
          messages = { create: mockCreate };
        },
      }));

      vi.resetModules();
      vi.doMock('../config.js', () => ({
        CONFIG: {
          anthropicApiKey: 'test-key',
          scoringModel: 'claude-haiku-4-5-20251001',
          profileSummary: 'Test profile',
        },
      }));

      const { scoreJob } = await import('./relevance.js');
      const result = await scoreJob(makeJob({ title: 'Head of AI' }));

      expect(result.match_reasons).toContain('Scored by keyword fallback (API unavailable)');
    });
  });
});
