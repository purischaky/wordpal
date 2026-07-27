import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/lib/api/file-service', () => ({
  readJsonFile: vi.fn(),
  writeJsonFile: vi.fn(),
}));

import { readJsonFile } from '@/lib/api/file-service';
import { GET } from '@/app/api/admin/search/route';

const mockReadJsonFile = vi.mocked(readJsonFile);

function createRequest(url: string): NextRequest {
  return new NextRequest(new URL(url));
}

describe('Search API Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockSearchData = [
    { id: 's-1', title: 'Grammar Lesson', subtitle: 'Learn basics', category: 'lessons', href: '/admin/lessons/1' },
    { id: 's-2', title: 'Vocabulary Challenge', subtitle: 'Test words', category: 'challenges', href: '/admin/challenges/1' },
    { id: 's-3', title: 'Writing Exercise', subtitle: 'Practice grammar', category: 'exercises', href: '/admin/exercises/1' },
    { id: 's-4', title: 'Reading Comprehension', subtitle: 'Advanced texts', category: 'lessons', href: '/admin/lessons/2' },
    { id: 's-5', title: 'Grammar Quiz', subtitle: 'Quick test', category: 'challenges', href: '/admin/challenges/2' },
    { id: 's-6', title: 'Grammar Rules', subtitle: 'Reference', category: 'lessons', href: '/admin/lessons/3' },
  ];

  describe('GET /api/admin/search', () => {
    it('returns empty array when query is missing', async () => {
      const response = await GET(
        createRequest('http://localhost/api/admin/search') as any
      );
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.data).toEqual([]);
    });

    it('returns empty array when query is a single character', async () => {
      const response = await GET(
        createRequest('http://localhost/api/admin/search?q=a') as any
      );
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.data).toEqual([]);
    });

    it('returns empty array when query is empty string', async () => {
      const response = await GET(
        createRequest('http://localhost/api/admin/search?q=') as any
      );
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.data).toEqual([]);
    });

    it('returns matching results for query of 2+ characters', async () => {
      mockReadJsonFile.mockResolvedValue(mockSearchData);

      const response = await GET(
        createRequest('http://localhost/api/admin/search?q=grammar') as any
      );
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.data.length).toBeGreaterThan(0);
      // All results should contain "grammar" in title or subtitle (case-insensitive)
      for (const result of body.data) {
        const matchesTitle = result.title.toLowerCase().includes('grammar');
        const matchesSubtitle = result.subtitle.toLowerCase().includes('grammar');
        expect(matchesTitle || matchesSubtitle).toBe(true);
      }
    });

    it('performs case-insensitive matching', async () => {
      mockReadJsonFile.mockResolvedValue(mockSearchData);

      const response = await GET(
        createRequest('http://localhost/api/admin/search?q=GRAMMAR') as any
      );
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.data.length).toBeGreaterThan(0);
    });

    it('matches against subtitle field', async () => {
      mockReadJsonFile.mockResolvedValue(mockSearchData);

      const response = await GET(
        createRequest('http://localhost/api/admin/search?q=basics') as any
      );
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.data.length).toBe(1);
      expect(body.data[0].id).toBe('s-1');
    });

    it('limits results to max 5 per category', async () => {
      // Create 8 items in the same category that all match the query
      const manyLessons = Array.from({ length: 8 }, (_, i) => ({
        id: `s-${i}`,
        title: `Grammar Lesson ${i}`,
        subtitle: 'description',
        category: 'lessons',
        href: `/admin/lessons/${i}`,
      }));
      mockReadJsonFile.mockResolvedValue(manyLessons);

      const response = await GET(
        createRequest('http://localhost/api/admin/search?q=grammar') as any
      );
      const body = await response.json();

      expect(response.status).toBe(200);
      // Should be limited to 5 since all are in the same category
      expect(body.data.length).toBe(5);
    });

    it('returns results grouped across multiple categories', async () => {
      mockReadJsonFile.mockResolvedValue(mockSearchData);

      const response = await GET(
        createRequest('http://localhost/api/admin/search?q=grammar') as any
      );
      const body = await response.json();

      expect(response.status).toBe(200);
      // "Grammar" appears in title of items in lessons, challenges, and exercises categories
      const categories = [...new Set(body.data.map((r: any) => r.category))];
      expect(categories.length).toBeGreaterThanOrEqual(2);
    });

    it('returns empty array when no results match', async () => {
      mockReadJsonFile.mockResolvedValue(mockSearchData);

      const response = await GET(
        createRequest('http://localhost/api/admin/search?q=zznonexistent') as any
      );
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.data).toEqual([]);
    });

    it('returns 500 when file read fails', async () => {
      mockReadJsonFile.mockRejectedValue(new Error('ENOENT'));

      const response = await GET(
        createRequest('http://localhost/api/admin/search?q=test') as any
      );
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body).toHaveProperty('error');
    });
  });
});
