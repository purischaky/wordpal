import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/api/file-service', () => ({
  readJsonFile: vi.fn(),
  writeJsonFile: vi.fn(),
}));

vi.mock('@/lib/api/id-generator', () => ({
  generateId: vi.fn(() => 'ex-mock-id'),
}));

import { readJsonFile, writeJsonFile } from '@/lib/api/file-service';
import { GET, POST } from '@/app/api/admin/exercises/route';
import {
  GET as GET_BY_ID,
  PUT,
  DELETE,
} from '@/app/api/admin/exercises/[id]/route';

const mockReadJsonFile = readJsonFile as ReturnType<typeof vi.fn>;
const mockWriteJsonFile = writeJsonFile as ReturnType<typeof vi.fn>;

function createRequest(method: string, body?: unknown): Request {
  const init: RequestInit = { method };
  if (body !== undefined) {
    init.body = JSON.stringify(body);
    init.headers = { 'Content-Type': 'application/json' };
  }
  return new Request('http://localhost/api/admin/exercises', init);
}

function createParamsCtx(id: string) {
  return { params: Promise.resolve({ id }) };
}

const sampleExercises: Record<string, unknown> = {
  'ex-1': { type: 'multiple-choice', question: 'What is grammar?' },
  'ex-2': { type: 'fill-in-blank', question: 'Fill the ___' },
};

describe('Exercises Collection Route - GET /api/admin/exercises', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns all exercises as a JSON object with status 200', async () => {
    mockReadJsonFile.mockResolvedValue(sampleExercises);

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.data).toEqual(sampleExercises);
  });

  it('returns 500 when file read fails', async () => {
    mockReadJsonFile.mockRejectedValue(new Error('File not found'));

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json.error).toBe('Failed to read exercises data');
  });
});

describe('Exercises Collection Route - POST /api/admin/exercises', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates a new exercise with valid body and returns 201', async () => {
    mockReadJsonFile.mockResolvedValue({ ...sampleExercises });
    mockWriteJsonFile.mockResolvedValue(undefined);

    const body = { type: 'multiple-choice', question: 'New question' };
    const request = createRequest('POST', body);

    const response = await POST(request as any);
    const json = await response.json();

    expect(response.status).toBe(201);
    expect(json.data.id).toBe('ex-mock-id');
    expect(json.data.type).toBe('multiple-choice');
    expect(mockWriteJsonFile).toHaveBeenCalledOnce();
  });

  it('returns 400 when type field is missing', async () => {
    const body = { question: 'No type field' };
    const request = createRequest('POST', body);

    const response = await POST(request as any);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toBe('Validation failed');
    expect(json.details).toContain('type is required and must be a string');
  });

  it('returns 400 when type is invalid', async () => {
    const body = { type: 'invalid-type' };
    const request = createRequest('POST', body);

    const response = await POST(request as any);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toBe('Validation failed');
    expect(json.details.length).toBeGreaterThan(0);
  });

  it('returns 400 when body is not valid JSON', async () => {
    const request = new Request('http://localhost/api/admin/exercises', {
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

describe('Exercises Single Route - GET /api/admin/exercises/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns a specific exercise with status 200', async () => {
    mockReadJsonFile.mockResolvedValue(sampleExercises);

    const response = await GET_BY_ID(
      createRequest('GET') as any,
      createParamsCtx('ex-1') as any
    );
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.data).toEqual(sampleExercises['ex-1']);
  });

  it('returns 404 for a non-existent exercise ID', async () => {
    mockReadJsonFile.mockResolvedValue(sampleExercises);

    const response = await GET_BY_ID(
      createRequest('GET') as any,
      createParamsCtx('non-existent') as any
    );
    const json = await response.json();

    expect(response.status).toBe(404);
    expect(json.error).toBe('Exercise not found');
  });

  it('returns 500 when file read fails', async () => {
    mockReadJsonFile.mockRejectedValue(new Error('Disk error'));

    const response = await GET_BY_ID(
      createRequest('GET') as any,
      createParamsCtx('ex-1') as any
    );
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json.error).toBe('Failed to read exercise data');
  });
});

describe('Exercises Single Route - PUT /api/admin/exercises/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('updates an existing exercise and returns 200', async () => {
    mockReadJsonFile.mockResolvedValue({ ...sampleExercises });
    mockWriteJsonFile.mockResolvedValue(undefined);

    const body = { type: 'fill-in-blank', question: 'Updated question' };
    const request = createRequest('PUT', body);

    const response = await PUT(request as any, createParamsCtx('ex-1') as any);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.data.type).toBe('fill-in-blank');
    expect(json.data.question).toBe('Updated question');
    expect(mockWriteJsonFile).toHaveBeenCalledOnce();
  });

  it('returns 404 when updating a non-existent exercise', async () => {
    mockReadJsonFile.mockResolvedValue({ ...sampleExercises });

    const body = { type: 'fill-in-blank' };
    const request = createRequest('PUT', body);

    const response = await PUT(
      request as any,
      createParamsCtx('non-existent') as any
    );
    const json = await response.json();

    expect(response.status).toBe(404);
    expect(json.error).toBe('Exercise not found');
  });

  it('returns 400 when type is invalid in update', async () => {
    const body = { type: 'bad-type' };
    const request = createRequest('PUT', body);

    const response = await PUT(request as any, createParamsCtx('ex-1') as any);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toBe('Validation failed');
  });
});

describe('Exercises Single Route - DELETE /api/admin/exercises/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deletes an existing exercise and returns 200', async () => {
    mockReadJsonFile.mockResolvedValue({ ...sampleExercises });
    mockWriteJsonFile.mockResolvedValue(undefined);

    const response = await DELETE(
      createRequest('DELETE') as any,
      createParamsCtx('ex-1') as any
    );
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.data.message).toBe('Exercise deleted');
    expect(mockWriteJsonFile).toHaveBeenCalledOnce();
  });

  it('returns 404 when deleting a non-existent exercise', async () => {
    mockReadJsonFile.mockResolvedValue({ ...sampleExercises });

    const response = await DELETE(
      createRequest('DELETE') as any,
      createParamsCtx('non-existent') as any
    );
    const json = await response.json();

    expect(response.status).toBe(404);
    expect(json.error).toBe('Exercise not found');
  });
});
