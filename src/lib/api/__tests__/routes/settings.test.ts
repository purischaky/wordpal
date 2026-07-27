import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/api/file-service', () => ({
  readJsonFile: vi.fn(),
  writeJsonFile: vi.fn(),
}));

import { readJsonFile, writeJsonFile } from '@/lib/api/file-service';
import { GET, PUT } from '@/app/api/admin/settings/route';

const mockReadJsonFile = vi.mocked(readJsonFile);
const mockWriteJsonFile = vi.mocked(writeJsonFile);

function createRequest(method: string, body?: unknown): Request {
  const init: RequestInit = { method };
  if (body !== undefined) {
    init.headers = { 'Content-Type': 'application/json' };
    init.body = typeof body === 'string' ? body : JSON.stringify(body);
  }
  return new Request('http://localhost/api/admin/settings', init);
}

const validSettings = {
  scoring: {
    xpPerExercise: 10,
    xpPerLesson: 50,
    weightByExerciseType: {
      'multiple-choice': 20,
      'fill-in-blank': 20,
      'drag-and-drop': 20,
      'sentence-ordering': 20,
      'rewrite-sentence': 10,
      'free-writing': 10,
    },
    passingThreshold: 70,
  },
};

describe('Settings API Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockWriteJsonFile.mockResolvedValue(undefined);
  });

  describe('GET /api/admin/settings', () => {
    it('returns existing settings with status 200', async () => {
      mockReadJsonFile.mockResolvedValue(validSettings);

      const response = await GET(createRequest('GET') as any);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body).toHaveProperty('data');
      expect(body.data).toEqual(validSettings);
    });

    it('creates default settings when file does not exist (ENOENT)', async () => {
      const enoentError = Object.assign(new Error('ENOENT'), { code: 'ENOENT' });
      mockReadJsonFile.mockRejectedValue(enoentError);

      const response = await GET(createRequest('GET') as any);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.data).toHaveProperty('scoring');
      expect(body.data.scoring.xpPerExercise).toBe(10);
      expect(body.data.scoring.xpPerLesson).toBe(50);
      expect(body.data.scoring.passingThreshold).toBe(70);
      // Should write defaults to file
      expect(mockWriteJsonFile).toHaveBeenCalledWith('settings.json', expect.any(Object));
    });

    it('returns 500 for other read errors', async () => {
      mockReadJsonFile.mockRejectedValue(new Error('EACCES'));

      const response = await GET(createRequest('GET') as any);
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body).toHaveProperty('error');
    });
  });

  describe('PUT /api/admin/settings', () => {
    it('updates settings with valid body and returns 200', async () => {
      const response = await PUT(createRequest('PUT', validSettings) as any);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.data).toEqual(validSettings);
      expect(mockWriteJsonFile).toHaveBeenCalledWith('settings.json', validSettings);
    });

    it('returns 400 when xpPerExercise is below 1', async () => {
      const invalid = {
        scoring: {
          ...validSettings.scoring,
          xpPerExercise: 0,
        },
      };

      const response = await PUT(createRequest('PUT', invalid) as any);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body).toHaveProperty('details');
      expect(body.details.some((d: string) => d.includes('xpPerExercise'))).toBe(true);
    });

    it('returns 400 when xpPerExercise exceeds 1000', async () => {
      const invalid = {
        scoring: {
          ...validSettings.scoring,
          xpPerExercise: 1001,
        },
      };

      const response = await PUT(createRequest('PUT', invalid) as any);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.details.some((d: string) => d.includes('xpPerExercise'))).toBe(true);
    });

    it('returns 400 when xpPerLesson is below 1', async () => {
      const invalid = {
        scoring: {
          ...validSettings.scoring,
          xpPerLesson: 0,
        },
      };

      const response = await PUT(createRequest('PUT', invalid) as any);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.details.some((d: string) => d.includes('xpPerLesson'))).toBe(true);
    });

    it('returns 400 when xpPerLesson exceeds 10000', async () => {
      const invalid = {
        scoring: {
          ...validSettings.scoring,
          xpPerLesson: 10001,
        },
      };

      const response = await PUT(createRequest('PUT', invalid) as any);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.details.some((d: string) => d.includes('xpPerLesson'))).toBe(true);
    });

    it('returns 400 when exercise type weights do not sum to 100', async () => {
      const invalid = {
        scoring: {
          ...validSettings.scoring,
          weightByExerciseType: {
            'multiple-choice': 30,
            'fill-in-blank': 30,
            'drag-and-drop': 30,
          },
        },
      };

      const response = await PUT(createRequest('PUT', invalid) as any);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.details.some((d: string) => d.includes('sum to 100'))).toBe(true);
    });

    it('returns 400 when passingThreshold is below 50', async () => {
      const invalid = {
        scoring: {
          ...validSettings.scoring,
          passingThreshold: 49,
        },
      };

      const response = await PUT(createRequest('PUT', invalid) as any);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.details.some((d: string) => d.includes('passingThreshold'))).toBe(true);
    });

    it('returns 400 when passingThreshold exceeds 100', async () => {
      const invalid = {
        scoring: {
          ...validSettings.scoring,
          passingThreshold: 101,
        },
      };

      const response = await PUT(createRequest('PUT', invalid) as any);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.details.some((d: string) => d.includes('passingThreshold'))).toBe(true);
    });

    it('returns 400 for invalid JSON body', async () => {
      const request = new Request('http://localhost/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: 'not-valid-json{{{',
      });

      const response = await PUT(request as any);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toContain('Invalid JSON');
    });

    it('returns 400 when body is not an object (valid JSON but wrong type)', async () => {
      // Send a number (valid JSON, but not an object)
      const response = await PUT(createRequest('PUT', 42) as any);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body).toHaveProperty('error');
      expect(body).toHaveProperty('details');
      expect(body.details.some((d: string) => d.includes('JSON object'))).toBe(true);
    });

    it('returns 500 when file write fails', async () => {
      mockWriteJsonFile.mockRejectedValue(new Error('EACCES'));

      const response = await PUT(createRequest('PUT', validSettings) as any);
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body).toHaveProperty('error');
    });
  });
});
