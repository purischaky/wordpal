import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock file-service module
vi.mock('@/lib/api/file-service', () => ({
  readJsonFile: vi.fn(),
  writeJsonFile: vi.fn(),
}));

// Mock id-generator module
vi.mock('@/lib/api/id-generator', () => ({
  generateId: vi.fn(() => 'les-mock-id-123'),
}));

import { readJsonFile, writeJsonFile } from '@/lib/api/file-service';
import { generateId } from '@/lib/api/id-generator';

// We need to import after mocks are set up
import { GET, POST } from '@/app/api/admin/lessons/route';
import { PUT, DELETE } from '@/app/api/admin/lessons/[id]/route';
import { POST as DUPLICATE } from '@/app/api/admin/lessons/[id]/duplicate/route';
import { PATCH as PUBLISH } from '@/app/api/admin/lessons/[id]/publish/route';

const mockReadJsonFile = vi.mocked(readJsonFile);
const mockWriteJsonFile = vi.mocked(writeJsonFile);
const mockGenerateId = vi.mocked(generateId);

// Helper to create a NextRequest-like object
function createRequest(body?: unknown): Request {
  if (body === undefined) {
    return new Request('http://localhost/api/admin/lessons', { method: 'GET' });
  }
  return new Request('http://localhost/api/admin/lessons', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

// Helper to create params for dynamic routes
function createParams(id: string): { params: Promise<{ id: string }> } {
  return { params: Promise.resolve({ id }) };
}

// Sample test lesson data
const sampleLessons = [
  {
    id: 'les-1',
    title: 'Present Tense Basics',
    description: 'Learn present tense conjugation',
    grammarFocus: 'Present Tense',
    cefrLevel: 'A1',
    status: 'draft',
    exerciseCount: 5,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'les-2',
    title: 'Past Tense Introduction',
    description: 'Introduction to past tense',
    grammarFocus: 'Past Tense',
    cefrLevel: 'A2',
    status: 'published',
    exerciseCount: 3,
    createdAt: '2024-01-02T00:00:00.000Z',
    updatedAt: '2024-01-02T00:00:00.000Z',
  },
  {
    id: 'les-3',
    title: 'Incomplete Lesson',
    description: '',
    grammarFocus: '',
    cefrLevel: '',
    status: 'draft',
    exerciseCount: 0,
    createdAt: '2024-01-03T00:00:00.000Z',
    updatedAt: '2024-01-03T00:00:00.000Z',
  },
];

describe('Lessons API Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockWriteJsonFile.mockResolvedValue(undefined);
  });

  describe('GET /api/admin/lessons', () => {
    it('returns all lessons with 200 status', async () => {
      mockReadJsonFile.mockResolvedValue(sampleLessons);

      const response = await GET();
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.data).toEqual(sampleLessons);
      expect(mockReadJsonFile).toHaveBeenCalledWith('lessons.json');
    });

    it('returns empty array when no lessons exist', async () => {
      mockReadJsonFile.mockResolvedValue([]);

      const response = await GET();
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.data).toEqual([]);
    });

    it('returns 500 when file read fails', async () => {
      mockReadJsonFile.mockRejectedValue(new Error('ENOENT'));

      const response = await GET();
      const json = await response.json();

      expect(response.status).toBe(500);
      expect(json.error).toBe('Failed to read lessons data');
    });
  });

  describe('POST /api/admin/lessons', () => {
    it('creates a new lesson with valid body and returns 201', async () => {
      mockReadJsonFile.mockResolvedValue([...sampleLessons]);
      mockGenerateId.mockReturnValue('les-new-123');

      const body = { title: 'New Lesson', description: 'A new lesson' };
      const request = createRequest(body);

      const response = await POST(request as any);
      const json = await response.json();

      expect(response.status).toBe(201);
      expect(json.data.id).toBe('les-new-123');
      expect(json.data.title).toBe('New Lesson');
      expect(json.data.description).toBe('A new lesson');
      expect(json.data.status).toBe('draft');
      expect(mockWriteJsonFile).toHaveBeenCalledWith('lessons.json', expect.any(Array));
    });

    it('returns 400 when title is missing', async () => {
      const body = { description: 'Missing title' };
      const request = createRequest(body);

      const response = await POST(request as any);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.error).toBe('Validation failed');
      expect(json.details).toContain('title is required and must be a string');
    });

    it('returns 400 when title exceeds 150 characters', async () => {
      const body = { title: 'x'.repeat(151) };
      const request = createRequest(body);

      const response = await POST(request as any);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.error).toBe('Validation failed');
      expect(json.details).toContain('title must not exceed 150 characters');
    });

    it('returns 400 for invalid JSON body', async () => {
      const request = new Request('http://localhost/api/admin/lessons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'not valid json{',
      });

      const response = await POST(request as any);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.error).toBe('Invalid JSON in request body');
    });
  });

  describe('PUT /api/admin/lessons/[id]', () => {
    it('updates an existing lesson and returns 200', async () => {
      mockReadJsonFile.mockResolvedValue([...sampleLessons]);

      const body = { title: 'Updated Title' };
      const request = new Request('http://localhost/api/admin/lessons/les-1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const response = await PUT(request as any, createParams('les-1'));
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.data.title).toBe('Updated Title');
      expect(json.data.id).toBe('les-1');
      expect(mockWriteJsonFile).toHaveBeenCalledWith('lessons.json', expect.any(Array));
    });

    it('returns 404 for non-existent lesson ID', async () => {
      mockReadJsonFile.mockResolvedValue([...sampleLessons]);

      const body = { title: 'Updated' };
      const request = new Request('http://localhost/api/admin/lessons/non-existent', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const response = await PUT(request as any, createParams('non-existent'));
      const json = await response.json();

      expect(response.status).toBe(404);
      expect(json.error).toBe('Lesson not found');
    });

    it('returns 400 for invalid update body', async () => {
      const body = { title: '' };
      const request = new Request('http://localhost/api/admin/lessons/les-1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const response = await PUT(request as any, createParams('les-1'));
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.error).toBe('Validation failed');
    });

    it('returns 400 for invalid JSON body', async () => {
      const request = new Request('http://localhost/api/admin/lessons/les-1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: '{invalid json',
      });

      const response = await PUT(request as any, createParams('les-1'));
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.error).toBe('Invalid JSON in request body');
    });
  });

  describe('DELETE /api/admin/lessons/[id]', () => {
    it('deletes an existing lesson and returns 200', async () => {
      mockReadJsonFile.mockResolvedValue([...sampleLessons]);

      const request = new Request('http://localhost/api/admin/lessons/les-1', {
        method: 'DELETE',
      });

      const response = await DELETE(request as any, createParams('les-1'));
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.data.message).toBe('Lesson deleted');
      expect(mockWriteJsonFile).toHaveBeenCalledWith(
        'lessons.json',
        expect.not.arrayContaining([expect.objectContaining({ id: 'les-1' })])
      );
    });

    it('returns 404 for non-existent lesson ID', async () => {
      mockReadJsonFile.mockResolvedValue([...sampleLessons]);

      const request = new Request('http://localhost/api/admin/lessons/non-existent', {
        method: 'DELETE',
      });

      const response = await DELETE(request as any, createParams('non-existent'));
      const json = await response.json();

      expect(response.status).toBe(404);
      expect(json.error).toBe('Lesson not found');
    });

    it('returns 500 when file operation fails', async () => {
      mockReadJsonFile.mockRejectedValue(new Error('disk error'));

      const request = new Request('http://localhost/api/admin/lessons/les-1', {
        method: 'DELETE',
      });

      const response = await DELETE(request as any, createParams('les-1'));
      const json = await response.json();

      expect(response.status).toBe(500);
      expect(json.error).toBe('Failed to delete lesson');
    });
  });

  describe('POST /api/admin/lessons/[id]/duplicate', () => {
    it('duplicates a lesson with "Copy of " prefix and draft status', async () => {
      mockReadJsonFile.mockResolvedValue([...sampleLessons]);
      mockGenerateId.mockReturnValue('les-dup-456');

      const request = new Request('http://localhost/api/admin/lessons/les-1/duplicate', {
        method: 'POST',
      });

      const response = await DUPLICATE(request as any, createParams('les-1'));
      const json = await response.json();

      expect(response.status).toBe(201);
      expect(json.data.title).toBe('Copy of Present Tense Basics');
      expect(json.data.status).toBe('draft');
      expect(json.data.id).toBe('les-dup-456');
      expect(json.data.id).not.toBe('les-1');
    });

    it('preserves content fields from original lesson', async () => {
      mockReadJsonFile.mockResolvedValue([...sampleLessons]);
      mockGenerateId.mockReturnValue('les-dup-789');

      const request = new Request('http://localhost/api/admin/lessons/les-1/duplicate', {
        method: 'POST',
      });

      const response = await DUPLICATE(request as any, createParams('les-1'));
      const json = await response.json();

      expect(json.data.description).toBe('Learn present tense conjugation');
      expect(json.data.grammarFocus).toBe('Present Tense');
      expect(json.data.cefrLevel).toBe('A1');
      expect(json.data.exerciseCount).toBe(5);
    });

    it('returns 404 for non-existent lesson ID', async () => {
      mockReadJsonFile.mockResolvedValue([...sampleLessons]);

      const request = new Request('http://localhost/api/admin/lessons/non-existent/duplicate', {
        method: 'POST',
      });

      const response = await DUPLICATE(request as any, createParams('non-existent'));
      const json = await response.json();

      expect(response.status).toBe(404);
      expect(json.error).toBe('Lesson not found');
    });

    it('writes the duplicated lesson to the store', async () => {
      mockReadJsonFile.mockResolvedValue([...sampleLessons]);
      mockGenerateId.mockReturnValue('les-dup-write');

      const request = new Request('http://localhost/api/admin/lessons/les-1/duplicate', {
        method: 'POST',
      });

      await DUPLICATE(request as any, createParams('les-1'));

      expect(mockWriteJsonFile).toHaveBeenCalledWith(
        'lessons.json',
        expect.arrayContaining([expect.objectContaining({ id: 'les-dup-write' })])
      );
    });
  });

  describe('PATCH /api/admin/lessons/[id]/publish', () => {
    it('publishes a valid lesson and returns updated record', async () => {
      mockReadJsonFile.mockResolvedValue([...sampleLessons]);

      const request = new Request('http://localhost/api/admin/lessons/les-1/publish', {
        method: 'PATCH',
      });

      const response = await PUBLISH(request as any, createParams('les-1'));
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.data.status).toBe('published');
      expect(json.data.id).toBe('les-1');
    });

    it('returns 400 when lesson fails publish validation (no exercises)', async () => {
      mockReadJsonFile.mockResolvedValue([...sampleLessons]);

      const request = new Request('http://localhost/api/admin/lessons/les-3/publish', {
        method: 'PATCH',
      });

      const response = await PUBLISH(request as any, createParams('les-3'));
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.error).toBe('Validation failed');
      expect(json.details).toEqual(expect.arrayContaining([
        expect.stringContaining('exercise'),
      ]));
    });

    it('returns 400 listing all missing fields for incomplete lesson', async () => {
      mockReadJsonFile.mockResolvedValue([...sampleLessons]);

      const request = new Request('http://localhost/api/admin/lessons/les-3/publish', {
        method: 'PATCH',
      });

      const response = await PUBLISH(request as any, createParams('les-3'));
      const json = await response.json();

      expect(response.status).toBe(400);
      // les-3 has empty description, grammarFocus, cefrLevel, and 0 exercises
      expect(json.details.length).toBeGreaterThanOrEqual(2);
    });

    it('returns 404 for non-existent lesson ID', async () => {
      mockReadJsonFile.mockResolvedValue([...sampleLessons]);

      const request = new Request('http://localhost/api/admin/lessons/non-existent/publish', {
        method: 'PATCH',
      });

      const response = await PUBLISH(request as any, createParams('non-existent'));
      const json = await response.json();

      expect(response.status).toBe(404);
      expect(json.error).toBe('Lesson not found');
    });

    it('writes the published lesson to the store', async () => {
      mockReadJsonFile.mockResolvedValue([...sampleLessons]);

      const request = new Request('http://localhost/api/admin/lessons/les-1/publish', {
        method: 'PATCH',
      });

      await PUBLISH(request as any, createParams('les-1'));

      expect(mockWriteJsonFile).toHaveBeenCalledWith(
        'lessons.json',
        expect.arrayContaining([
          expect.objectContaining({ id: 'les-1', status: 'published' }),
        ])
      );
    });
  });
});
