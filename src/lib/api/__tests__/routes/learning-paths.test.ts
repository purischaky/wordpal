import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/api/file-service', () => ({
  readJsonFile: vi.fn(),
  writeJsonFile: vi.fn(),
}));

vi.mock('@/lib/api/id-generator', () => ({
  generateId: vi.fn(() => 'lp-mock-id-123'),
}));

import { readJsonFile, writeJsonFile } from '@/lib/api/file-service';
import { GET, POST } from '@/app/api/admin/learning-paths/route';
import {
  PUT,
  DELETE,
} from '@/app/api/admin/learning-paths/[id]/route';

const mockReadJsonFile = vi.mocked(readJsonFile);
const mockWriteJsonFile = vi.mocked(writeJsonFile);

function createRequest(method: string, body?: unknown): Request {
  const init: RequestInit = { method };
  if (body !== undefined) {
    init.headers = { 'Content-Type': 'application/json' };
    init.body = typeof body === 'string' ? body : JSON.stringify(body);
  }
  return new Request('http://localhost/api/admin/learning-paths', init);
}

function paramsWithId(id: string) {
  return { params: Promise.resolve({ id }) };
}

describe('Learning Paths API Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockWriteJsonFile.mockResolvedValue(undefined);
  });

  describe('GET /api/admin/learning-paths', () => {
    it('returns a JSON array of learning paths with status 200', async () => {
      const mockPaths = [
        { id: 'lp-1', title: 'Beginner English', units: [] },
        { id: 'lp-2', title: 'Advanced Grammar', units: [] },
      ];
      mockReadJsonFile.mockResolvedValue(mockPaths);

      const response = await GET(createRequest('GET') as any);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body).toHaveProperty('data');
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data).toEqual(mockPaths);
    });

    it('returns 500 when file read fails', async () => {
      mockReadJsonFile.mockRejectedValue(new Error('ENOENT'));

      const response = await GET(createRequest('GET') as any);
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body).toHaveProperty('error');
      expect(typeof body.error).toBe('string');
    });
  });

  describe('POST /api/admin/learning-paths', () => {
    it('creates a new learning path with generated ID and returns 201', async () => {
      const mockPaths: Record<string, unknown>[] = [];
      mockReadJsonFile.mockResolvedValue(mockPaths);

      const response = await POST(
        createRequest('POST', { title: 'New Path', description: 'A new learning path' }) as any
      );
      const body = await response.json();

      expect(response.status).toBe(201);
      expect(body).toHaveProperty('data');
      expect(body.data.id).toBe('lp-mock-id-123');
      expect(body.data.title).toBe('New Path');
      expect(body.data.description).toBe('A new learning path');
      expect(body.data).toHaveProperty('createdAt');
      expect(body.data).toHaveProperty('updatedAt');
      expect(mockWriteJsonFile).toHaveBeenCalledOnce();
    });

    it('returns 400 when title is missing', async () => {
      const response = await POST(
        createRequest('POST', { description: 'No title here' }) as any
      );
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body).toHaveProperty('error');
      expect(body).toHaveProperty('details');
      expect(Array.isArray(body.details)).toBe(true);
      expect(body.details.some((d: string) => d.includes('title'))).toBe(true);
    });

    it('returns 400 when title exceeds 150 characters', async () => {
      const longTitle = 'a'.repeat(151);

      const response = await POST(
        createRequest('POST', { title: longTitle }) as any
      );
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body).toHaveProperty('error');
      expect(body).toHaveProperty('details');
      expect(body.details.some((d: string) => d.includes('150'))).toBe(true);
    });

    it('returns 400 for invalid JSON body', async () => {
      const request = new Request('http://localhost/api/admin/learning-paths', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{invalid-json///}',
      });

      const response = await POST(request as any);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body).toHaveProperty('error');
      expect(body.error).toContain('Invalid JSON');
    });

    it('returns 500 when file write fails', async () => {
      mockReadJsonFile.mockResolvedValue([]);
      mockWriteJsonFile.mockRejectedValue(new Error('EACCES'));

      const response = await POST(
        createRequest('POST', { title: 'New Path' }) as any
      );
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body).toHaveProperty('error');
    });
  });

  describe('PUT /api/admin/learning-paths/[id]', () => {
    it('updates and returns learning path with status 200', async () => {
      const mockPaths = [
        { id: 'lp-1', title: 'Old Title', description: 'Old desc' },
      ];
      mockReadJsonFile.mockResolvedValue(mockPaths);

      const response = await PUT(
        createRequest('PUT', { title: 'Updated Title' }) as any,
        paramsWithId('lp-1')
      );
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body).toHaveProperty('data');
      expect(body.data.title).toBe('Updated Title');
      expect(body.data).toHaveProperty('updatedAt');
      expect(mockWriteJsonFile).toHaveBeenCalledOnce();
    });

    it('returns 404 for non-existent learning path ID', async () => {
      const mockPaths = [
        { id: 'lp-1', title: 'Existing Path' },
      ];
      mockReadJsonFile.mockResolvedValue(mockPaths);

      const response = await PUT(
        createRequest('PUT', { title: 'Updated' }) as any,
        paramsWithId('non-existent')
      );
      const body = await response.json();

      expect(response.status).toBe(404);
      expect(body).toHaveProperty('error');
      expect(body.error).toContain('not found');
    });

    it('returns 400 for invalid body (title exceeds max length)', async () => {
      const response = await PUT(
        createRequest('PUT', { title: 'x'.repeat(151) }) as any,
        paramsWithId('lp-1')
      );
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body).toHaveProperty('error');
      expect(body).toHaveProperty('details');
    });

    it('returns 400 for invalid JSON body', async () => {
      const request = new Request('http://localhost/api/admin/learning-paths/lp-1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: 'not-json!!!',
      });

      const response = await PUT(request as any, paramsWithId('lp-1'));
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body).toHaveProperty('error');
      expect(body.error).toContain('Invalid JSON');
    });

    it('returns 500 when file read fails', async () => {
      mockReadJsonFile.mockRejectedValue(new Error('ENOENT'));

      const response = await PUT(
        createRequest('PUT', { title: 'Test' }) as any,
        paramsWithId('lp-1')
      );
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body).toHaveProperty('error');
    });
  });

  describe('DELETE /api/admin/learning-paths/[id]', () => {
    it('deletes a learning path and returns status 200', async () => {
      const mockPaths = [
        { id: 'lp-1', title: 'Path to Delete' },
        { id: 'lp-2', title: 'Path to Keep' },
      ];
      mockReadJsonFile.mockResolvedValue(mockPaths);

      const response = await DELETE(
        createRequest('DELETE') as any,
        paramsWithId('lp-1')
      );
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body).toHaveProperty('data');
      expect(body.data.deleted).toBe('lp-1');
      expect(mockWriteJsonFile).toHaveBeenCalledOnce();
      // Verify the written data no longer contains the deleted path
      const writtenData = mockWriteJsonFile.mock.calls[0][1] as Record<string, unknown>[];
      expect(writtenData).toHaveLength(1);
      expect(writtenData[0]).toHaveProperty('id', 'lp-2');
    });

    it('returns 404 for non-existent learning path ID', async () => {
      const mockPaths = [
        { id: 'lp-1', title: 'Existing Path' },
      ];
      mockReadJsonFile.mockResolvedValue(mockPaths);

      const response = await DELETE(
        createRequest('DELETE') as any,
        paramsWithId('non-existent')
      );
      const body = await response.json();

      expect(response.status).toBe(404);
      expect(body).toHaveProperty('error');
      expect(body.error).toContain('not found');
    });

    it('returns 500 when file read fails', async () => {
      mockReadJsonFile.mockRejectedValue(new Error('ENOENT'));

      const response = await DELETE(
        createRequest('DELETE') as any,
        paramsWithId('lp-1')
      );
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body).toHaveProperty('error');
    });
  });
});
