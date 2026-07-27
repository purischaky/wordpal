import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/api/file-service', () => ({
  readJsonFile: vi.fn(),
  writeJsonFile: vi.fn(),
}));

vi.mock('@/lib/api/id-generator', () => ({
  generateId: vi.fn(() => 'ch-mock-id'),
}));

import { readJsonFile, writeJsonFile } from '@/lib/api/file-service';
import { GET, POST } from '@/app/api/admin/challenges/route';
import { PUT, DELETE } from '@/app/api/admin/challenges/[id]/route';
import { PATCH as PUBLISH } from '@/app/api/admin/challenges/[id]/publish/route';

const mockReadJsonFile = vi.mocked(readJsonFile);
const mockWriteJsonFile = vi.mocked(writeJsonFile);

function createRequest(method: string, url?: string, body?: unknown): Request {
  const init: RequestInit = { method };
  if (body !== undefined) {
    init.headers = { 'Content-Type': 'application/json' };
    init.body = typeof body === 'string' ? body : JSON.stringify(body);
  }
  return new Request(url || 'http://localhost/api/admin/challenges', init);
}

function paramsWithId(id: string) {
  return { params: Promise.resolve({ id }) };
}

describe('Challenges API Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockWriteJsonFile.mockResolvedValue(undefined);
  });

  describe('GET /api/admin/challenges', () => {
    it('returns all challenges with status 200', async () => {
      const mockChallenges = [
        { id: 'ch-1', title: 'Challenge 1', status: 'draft' },
        { id: 'ch-2', title: 'Challenge 2', status: 'published' },
      ];
      mockReadJsonFile.mockResolvedValue(mockChallenges);

      const response = await GET(createRequest('GET') as any);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body).toHaveProperty('data');
      expect(body.data).toEqual(mockChallenges);
    });

    it('returns 500 when file read fails', async () => {
      mockReadJsonFile.mockRejectedValue(new Error('ENOENT'));

      const response = await GET(createRequest('GET') as any);
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body).toHaveProperty('error');
    });
  });

  describe('POST /api/admin/challenges', () => {
    it('creates a new challenge with status 201', async () => {
      mockReadJsonFile.mockResolvedValue([]);

      const response = await POST(
        createRequest('POST', undefined, { title: 'New Challenge' }) as any
      );
      const body = await response.json();

      expect(response.status).toBe(201);
      expect(body.data).toHaveProperty('id', 'ch-mock-id');
      expect(body.data).toHaveProperty('title', 'New Challenge');
      expect(body.data).toHaveProperty('status', 'draft');
      expect(mockWriteJsonFile).toHaveBeenCalledOnce();
    });

    it('returns 400 for missing title', async () => {
      const response = await POST(
        createRequest('POST', undefined, { description: 'no title' }) as any
      );
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body).toHaveProperty('error');
      expect(body).toHaveProperty('details');
      expect(body.details.some((d: string) => d.includes('title'))).toBe(true);
    });

    it('returns 400 for title exceeding 150 characters', async () => {
      const response = await POST(
        createRequest('POST', undefined, { title: 'a'.repeat(151) }) as any
      );
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body).toHaveProperty('details');
      expect(body.details.some((d: string) => d.includes('150'))).toBe(true);
    });

    it('returns 400 for invalid JSON body', async () => {
      const request = new Request('http://localhost/api/admin/challenges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'not-valid-json{{{',
      });

      const response = await POST(request as any);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toContain('Invalid JSON');
    });
  });

  describe('PUT /api/admin/challenges/[id]', () => {
    it('updates challenge with status 200', async () => {
      const mockChallenges = [{ id: 'ch-1', title: 'Old Title', status: 'draft' }];
      mockReadJsonFile.mockResolvedValue(mockChallenges);

      const response = await PUT(
        createRequest('PUT', undefined, { title: 'New Title' }) as any,
        paramsWithId('ch-1')
      );
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.data.title).toBe('New Title');
      expect(mockWriteJsonFile).toHaveBeenCalledOnce();
    });

    it('returns 404 for non-existent challenge', async () => {
      mockReadJsonFile.mockResolvedValue([{ id: 'ch-1', title: 'Test' }]);

      const response = await PUT(
        createRequest('PUT', undefined, { title: 'Updated' }) as any,
        paramsWithId('non-existent')
      );
      const body = await response.json();

      expect(response.status).toBe(404);
      expect(body.error).toContain('not found');
    });
  });

  describe('DELETE /api/admin/challenges/[id]', () => {
    it('deletes challenge and returns 200', async () => {
      const mockChallenges = [
        { id: 'ch-1', title: 'To Delete' },
        { id: 'ch-2', title: 'Keep' },
      ];
      mockReadJsonFile.mockResolvedValue(mockChallenges);

      const response = await DELETE(
        createRequest('DELETE') as any,
        paramsWithId('ch-1')
      );
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.data).toEqual({ deleted: 'ch-1' });
      expect(mockWriteJsonFile).toHaveBeenCalledWith(
        'challenges.json',
        [{ id: 'ch-2', title: 'Keep' }]
      );
    });

    it('returns 404 for non-existent challenge ID', async () => {
      mockReadJsonFile.mockResolvedValue([{ id: 'ch-1', title: 'Exists' }]);

      const response = await DELETE(
        createRequest('DELETE') as any,
        paramsWithId('non-existent')
      );
      const body = await response.json();

      expect(response.status).toBe(404);
      expect(body.error).toContain('not found');
    });
  });

  describe('PATCH /api/admin/challenges/[id]/publish', () => {
    it('publishes a valid challenge with status 200', async () => {
      const validChallenge = {
        id: 'ch-1',
        title: 'Valid Challenge',
        status: 'draft',
        questions: Array.from({ length: 5 }, (_, i) => ({
          id: `q-${i}`,
          content: { correctIndex: 0, options: ['A', 'B', 'C'] },
        })),
      };
      mockReadJsonFile.mockResolvedValue([validChallenge]);

      const response = await PUBLISH(
        createRequest('PATCH') as any,
        paramsWithId('ch-1')
      );
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.data.status).toBe('published');
    });

    it('returns 400 when challenge has fewer than 5 questions', async () => {
      const invalidChallenge = {
        id: 'ch-1',
        title: 'Too Few Questions',
        status: 'draft',
        questions: [
          { id: 'q-1', content: { correctIndex: 0 } },
          { id: 'q-2', content: { correctIndex: 1 } },
        ],
      };
      mockReadJsonFile.mockResolvedValue([invalidChallenge]);

      const response = await PUBLISH(
        createRequest('PATCH') as any,
        paramsWithId('ch-1')
      );
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body).toHaveProperty('details');
      expect(body.details.some((d: string) => d.includes('at least 5'))).toBe(true);
    });

    it('returns 400 when questions lack correct answers', async () => {
      const invalidChallenge = {
        id: 'ch-1',
        title: 'No Correct Answers',
        status: 'draft',
        questions: Array.from({ length: 5 }, (_, i) => ({
          id: `q-${i}`,
          content: {},
        })),
      };
      mockReadJsonFile.mockResolvedValue([invalidChallenge]);

      const response = await PUBLISH(
        createRequest('PATCH') as any,
        paramsWithId('ch-1')
      );
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body).toHaveProperty('details');
      expect(body.details.some((d: string) => d.includes('correct answer'))).toBe(true);
    });

    it('returns 404 for non-existent challenge ID', async () => {
      mockReadJsonFile.mockResolvedValue([{ id: 'ch-1', title: 'Other' }]);

      const response = await PUBLISH(
        createRequest('PATCH') as any,
        paramsWithId('non-existent')
      );
      const body = await response.json();

      expect(response.status).toBe(404);
      expect(body.error).toContain('not found');
    });

    it('returns 500 when file read fails', async () => {
      mockReadJsonFile.mockRejectedValue(new Error('ENOENT'));

      const response = await PUBLISH(
        createRequest('PATCH') as any,
        paramsWithId('ch-1')
      );
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body).toHaveProperty('error');
    });
  });
});
