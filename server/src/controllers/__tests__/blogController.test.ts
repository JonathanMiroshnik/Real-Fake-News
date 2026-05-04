import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response } from 'express';

/* ------------------------------------------------------------------ */
/*  Mock factories — vi.hoisted() is required for ESM compatibility    */
/* ------------------------------------------------------------------ */

const { mockGetRelevantArticles, mockGetFeaturedArticle } = vi.hoisted(() => ({
  mockGetRelevantArticles: vi.fn(),
  mockGetFeaturedArticle: vi.fn(),
}));

const { mockGetPostByKey } = vi.hoisted(() => ({
  mockGetPostByKey: vi.fn(),
}));

vi.mock('../../services/blogService.js', () => ({
  getRelevantArticles: mockGetRelevantArticles,
  getFeaturedArticleForDate: mockGetFeaturedArticle,
}));

vi.mock('../../lib/database/sqliteOperations.js', () => ({
  getPostByKey: mockGetPostByKey,
  getPostsCount: vi.fn(),
}));

vi.mock('../../services/fakeDataService.js', () => ({
  isFakeDataEnabled: vi.fn().mockReturnValue(false),
  generateFakeArticle: vi.fn(),
  generateFakeFeaturedArticle: vi.fn(),
  getFakeBlogResponse: vi.fn(),
}));

vi.mock('../../lib/database/databaseConfigurations.js', () => ({
  blogDatabaseConfig: {
    source: 'blog_posts',
    exists: vi.fn(),
    find: vi.fn(),
    getKey: vi.fn(),
    copyValues: vi.fn(),
  },
}));

import {
  getRelevantArticlesController,
  getArticleByKeyController,
  getFeaturedArticleController,
} from '../blogController.js';

function createMockResponse(): Response {
  const res: Partial<Response> = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res as Response;
}

describe('Blog Controller', () => {
  let mockRes: Response;

  beforeEach(() => {
    mockRes = createMockResponse();
    vi.clearAllMocks();
  });

  /** ── getRelevantArticlesController ── */
  describe('getRelevantArticlesController', () => {
    it('should return articles on success', async () => {
      const mockArticles = [
        { key: '1', title: 'Article 1', content: 'Content' },
        { key: '2', title: 'Article 2', content: 'Content' },
      ];

      mockGetRelevantArticles.mockResolvedValue({
        success: true,
        articles: mockArticles as any,
        error: '',
      });

      await getRelevantArticlesController({} as Request, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        articles: mockArticles,
        error: '',
      });
    });

    it('should return 500 when service throws', async () => {
      mockGetRelevantArticles.mockRejectedValue(
        new Error('Database connection failed'),
      );

      await getRelevantArticlesController({} as Request, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Failed to fetch relevant articles',
      });
    });

    it('should handle empty articles gracefully', async () => {
      mockGetRelevantArticles.mockResolvedValue({
        success: true,
        articles: [],
        error: '',
      });

      await getRelevantArticlesController({} as Request, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        articles: [],
        error: '',
      });
    });
  });

  /** ── getArticleByKeyController ── */
  describe('getArticleByKeyController', () => {
    it('should return article when key is provided and found', async () => {
      const mockArticle = { key: 'abc-123', title: 'Found Article', content: 'Content' };

      mockGetPostByKey.mockResolvedValue(mockArticle as any);

      const mockReq = { params: { key: 'abc-123' } } as unknown as Request;
      await getArticleByKeyController(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        article: mockArticle,
      });
    });
  });

  /** ── getFeaturedArticleController ── */
  describe('getFeaturedArticleController', () => {
    it('should return article when featured article exists', async () => {
      const mockArticle = { key: 'featured-1', title: 'Featured Article', isFeatured: true };

      mockGetFeaturedArticle.mockResolvedValue(mockArticle as any);

      const mockReq = { query: {} } as unknown as Request;
      await getFeaturedArticleController(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        article: mockArticle,
      });
    });

    it('should handle errors gracefully', async () => {
      mockGetFeaturedArticle.mockRejectedValue(
        new Error('Service error'),
      );

      const mockReq = { query: {} } as unknown as Request;
      await getFeaturedArticleController(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Failed to fetch featured article',
      });
    });
  });
});
