import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/api/file-service', () => ({
  readJsonFile: vi.fn(),
  writeJsonFile: vi.fn(),
}));

import { readJsonFile, writeJsonFile } from '@/lib/api/file-service';
import { GET } from '@/app/api/admin/students/route';
import {
  GET as GET_BY_ID,
  PUT,
} from '@/app/api/admin/students/[id]/route';

const mockReadJsonFile = vi.mocked(readJsonFile);
const mockWriteJsonFile = vi.mocked(writeJsonFile);

function createRequest(method: string, body?: unknown): Request {
  const init: RequestInit = { method };
  if (body !== undefined) {
    init.headers = { 'Content-Type': 'application/json' };
    init.body = typeof body === 'string' ? body : JSON.stringify(body);
  }
  return new Request('http://localhost/api/admin/students', init);
}

function paramsWithId(id: string) {
  return { params: Promise.resolve({ id }) };
}

describe('Students API Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockWriteJsonFile.mockResolvedValue(undefined);
  });

  describe('GET /api/admin/students', () => {
    it('returns a JSON array of students with status 200', async () => {
      const mockStudents = [
        { id: 'stu-1', name: 'Alice', status: 'active' },
        { id: 'stu-2', name: 'Bob', status: 'inactive' },
      ];
      mockReadJsonFile.mockResolvedValue(mockStudents);

      const response = await GET(createRequest('GET') as any);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body).toHaveProperty('data');
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data).toEqual(mockStudents);
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

  describe('GET /api/admin/students/[id]', () => {
    it('returns student profile with status 200 for valid ID', async () => {
      const mockProfiles = {
        'stu-1': { id: 'stu-1', name: 'Alice', level: 'B1' },
      };
      mockReadJsonFile.mockResolvedValue(mockProfiles);

      const response = await GET_BY_ID(
        createRequest('GET') as any,
        paramsWithId('stu-1')
      );
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body).toHaveProperty('data');
      expect(body.data).toEqual(mockProfiles['stu-1']);
    });

    it('returns 404 for non-existent student ID', async () => {
      const mockProfiles = {
        'stu-1': { id: 'stu-1', name: 'Alice' },
      };
      mockReadJsonFile.mockResolvedValue(mockProfiles);

      const response = await GET_BY_ID(
        createRequest('GET') as any,
        paramsWithId('non-existent-id')
      );
      const body = await response.json();

      expect(response.status).toBe(404);
      expect(body).toHaveProperty('error');
      expect(body.error).toContain('not found');
    });

    it('returns 500 when file read fails', async () => {
      mockReadJsonFile.mockRejectedValue(new Error('ENOENT'));

      const response = await GET_BY_ID(
        createRequest('GET') as any,
        paramsWithId('stu-1')
      );
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body).toHaveProperty('error');
    });
  });

  describe('PUT /api/admin/students/[id]', () => {
    it('updates and returns student with status 200 for valid body', async () => {
      const mockStudents = [
        { id: 'stu-1', name: 'Alice', status: 'active' },
      ];
      mockReadJsonFile.mockResolvedValue(mockStudents);

      const response = await PUT(
        createRequest('PUT', { status: 'inactive' }) as any,
        paramsWithId('stu-1')
      );
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body).toHaveProperty('data');
      expect(body.data.status).toBe('inactive');
      expect(mockWriteJsonFile).toHaveBeenCalledOnce();
    });

    it('returns 404 when student ID does not exist', async () => {
      const mockStudents = [
        { id: 'stu-1', name: 'Alice', status: 'active' },
      ];
      mockReadJsonFile.mockResolvedValue(mockStudents);

      const response = await PUT(
        createRequest('PUT', { status: 'inactive' }) as any,
        paramsWithId('non-existent')
      );
      const body = await response.json();

      expect(response.status).toBe(404);
      expect(body).toHaveProperty('error');
      expect(body.error).toContain('not found');
    });

    it('returns 400 for invalid body (bad status value)', async () => {
      const response = await PUT(
        createRequest('PUT', { status: 'invalid-status' }) as any,
        paramsWithId('stu-1')
      );
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body).toHaveProperty('error');
      expect(body).toHaveProperty('details');
      expect(Array.isArray(body.details)).toBe(true);
    });

    it('returns 400 for invalid JSON body', async () => {
      const request = new Request('http://localhost/api/admin/students/stu-1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: 'not-valid-json{{{',
      });

      const response = await PUT(request as any, paramsWithId('stu-1'));
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body).toHaveProperty('error');
      expect(body.error).toContain('Invalid JSON');
    });

    it('returns 500 when file write fails', async () => {
      const mockStudents = [
        { id: 'stu-1', name: 'Alice', status: 'active' },
      ];
      mockReadJsonFile.mockResolvedValue(mockStudents);
      mockWriteJsonFile.mockRejectedValue(new Error('EACCES'));

      const response = await PUT(
        createRequest('PUT', { name: 'Alice Updated' }) as any,
        paramsWithId('stu-1')
      );
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body).toHaveProperty('error');
    });
  });
});
