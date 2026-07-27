import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/api/file-service', () => ({
  readJsonFile: vi.fn(),
  writeJsonFile: vi.fn(),
}));

vi.mock('@/lib/api/id-generator', () => ({
  generateId: vi.fn(() => 'ach-mock-id'),
}));

import { readJsonFile, writeJsonFile } from '@/lib/api/file-service';
import { GET, POST } from '@/app/api/admin/achievements/route';
import { PUT, DELETE } from '@/app/api/admin/achievements/[id]/route';

const mockReadJsonFile = readJsonFile as ReturnType<typeof vi.fn>;
const mockWriteJsonFile = writeJsonFile as ReturnType<typeof vi.fn>;

function createRequest(method: string, body?: unknown): Request {
  const init: RequestInit = { method };
  if (body !== undefined) {
    init.body = JSON.stringify(body);
    init.headers = { 'Content-Type': 'application/json' };
  }
  return new Request('http://localhost/api/admin/achievements', init);
}

function createParamsCtx(id: string) {
  return { params: Promise.resolve({ id }) };
}

const sampleAchievements = [
  {
    id: 'ach-1',
    title: 'First Lesson',
    description: 'Complete your first lesson',
    triggerCriteria: 'lessons_completed',
  },
  {
    id: 'ach-2',
    title: 'Streak Master',
    description: '7-day streak',
    triggerCriteria: 'streak_days',
  },
];

describe('Achievements Collection Route - GET /api/admin/achievements', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns all achievements as array with status 200', async () => {
    mockReadJsonFile.mockResolvedValue(sampleAchievements);

    const response = await GET(createRequest('GET') as any);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.data).toEqual(sampleAchievements);
    expect(Array.isArray(json.data)).toBe(true);
  });

  it('returns 500 when file read fails', async () => {
    mockReadJsonFile.mockRejectedValue(new Error('File not found'));

    const response = await GET(createRequest('GET') as any);
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json.error).toBe('Failed to read achievements data');
  });
});

describe('Achievements Collection Route - POST /api/admin/achievements', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates a new achievement with valid body and returns 201', async () => {
    mockReadJsonFile.mockResolvedValue([...sampleAchievements]);
    mockWriteJsonFile.mockResolvedValue(undefined);

    const body = {
      title: 'New Achievement',
      description: 'A new badge',
      triggerCriteria: 'exercises_completed',
    };
    const request = createRequest('POST', body);

    const response = await POST(request as any);
    const json = await response.json();

    expect(response.status).toBe(201);
    expect(json.data.id).toBe('ach-mock-id');
    expect(json.data.title).toBe('New Achievement');
    expect(json.data.triggerCriteria).toBe('exercises_completed');
    expect(mockWriteJsonFile).toHaveBeenCalledOnce();
  });

  it('returns 400 when title is missing', async () => {
    const body = { triggerCriteria: 'lessons_completed' };
    const request = createRequest('POST', body);

    const response = await POST(request as any);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toBe('Validation failed');
    expect(json.details).toContain('title is required and must be a string');
  });

  it('returns 400 when triggerCriteria is missing', async () => {
    const body = { title: 'Some Achievement' };
    const request = createRequest('POST', body);

    const response = await POST(request as any);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toBe('Validation failed');
    expect(json.details).toContain(
      'triggerCriteria is required and must be a string'
    );
  });

  it('returns 400 when both title and triggerCriteria are missing', async () => {
    const body = { description: 'only description' };
    const request = createRequest('POST', body);

    const response = await POST(request as any);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toBe('Validation failed');
    expect(json.details.length).toBe(2);
  });

  it('returns 400 when body is not valid JSON', async () => {
    const request = new Request('http://localhost/api/admin/achievements', {
      method: 'POST',
      body: 'not json {{{',
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request as any);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toBe('Invalid JSON in request body');
  });
});

describe('Achievements Single Route - PUT /api/admin/achievements/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('updates an existing achievement and returns 200', async () => {
    mockReadJsonFile.mockResolvedValue([...sampleAchievements]);
    mockWriteJsonFile.mockResolvedValue(undefined);

    const body = { title: 'Updated Title' };
    const request = createRequest('PUT', body);

    const response = await PUT(request as any, createParamsCtx('ach-1') as any);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.data.title).toBe('Updated Title');
    expect(mockWriteJsonFile).toHaveBeenCalledOnce();
  });

  it('returns 404 when updating a non-existent achievement', async () => {
    mockReadJsonFile.mockResolvedValue([...sampleAchievements]);

    const body = { title: 'Updated' };
    const request = createRequest('PUT', body);

    const response = await PUT(
      request as any,
      createParamsCtx('non-existent') as any
    );
    const json = await response.json();

    expect(response.status).toBe(404);
    expect(json.error).toBe('Achievement not found');
  });

  it('returns 400 when title exceeds 100 characters', async () => {
    const body = { title: 'A'.repeat(101) };
    const request = createRequest('PUT', body);

    const response = await PUT(request as any, createParamsCtx('ach-1') as any);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toBe('Validation failed');
    expect(json.details).toContain('title must not exceed 100 characters');
  });

  it('returns 400 when triggerCriteria is invalid', async () => {
    const body = { triggerCriteria: 'invalid_criteria' };
    const request = createRequest('PUT', body);

    const response = await PUT(request as any, createParamsCtx('ach-1') as any);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toBe('Validation failed');
  });
});

describe('Achievements Single Route - DELETE /api/admin/achievements/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deletes an existing achievement and returns 200', async () => {
    mockReadJsonFile.mockResolvedValue([...sampleAchievements]);
    mockWriteJsonFile.mockResolvedValue(undefined);

    const response = await DELETE(
      createRequest('DELETE') as any,
      createParamsCtx('ach-1') as any
    );
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.data.deleted).toBe('ach-1');
    expect(mockWriteJsonFile).toHaveBeenCalledOnce();
  });

  it('returns 404 when deleting a non-existent achievement', async () => {
    mockReadJsonFile.mockResolvedValue([...sampleAchievements]);

    const response = await DELETE(
      createRequest('DELETE') as any,
      createParamsCtx('non-existent') as any
    );
    const json = await response.json();

    expect(response.status).toBe(404);
    expect(json.error).toBe('Achievement not found');
  });

  it('returns 500 when file read fails', async () => {
    mockReadJsonFile.mockRejectedValue(new Error('Disk error'));

    const response = await DELETE(
      createRequest('DELETE') as any,
      createParamsCtx('ach-1') as any
    );
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json.error).toBe('Failed to delete achievement');
  });
});
