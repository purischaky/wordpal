import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/lib/api/file-service', () => ({
  readJsonFile: vi.fn(),
  writeJsonFile: vi.fn(),
}));

import { readJsonFile, writeJsonFile } from '@/lib/api/file-service';
import { GET } from '@/app/api/admin/notifications/route';
import { PATCH } from '@/app/api/admin/notifications/[id]/read/route';
import { POST as MARK_ALL_READ } from '@/app/api/admin/notifications/mark-all-read/route';
import { DELETE as DELETE_OLD } from '@/app/api/admin/notifications/old/route';

const mockReadJsonFile = vi.mocked(readJsonFile);
const mockWriteJsonFile = vi.mocked(writeJsonFile);

function createRequest(method: string, url?: string): NextRequest {
  return new NextRequest(new URL(url || 'http://localhost/api/admin/notifications'), { method });
}

function paramsWithId(id: string) {
  return { params: Promise.resolve({ id }) };
}

describe('Notifications API Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockWriteJsonFile.mockResolvedValue(undefined);
  });

  describe('GET /api/admin/notifications', () => {
    it('returns all notifications with status 200', async () => {
      const mockNotifications = [
        { id: 'n-1', title: 'New student', isRead: false, createdAt: '2024-01-01' },
        { id: 'n-2', title: 'Update complete', isRead: true, createdAt: '2024-01-02' },
      ];
      mockReadJsonFile.mockResolvedValue(mockNotifications);

      const response = await GET(createRequest('GET') as any);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body).toHaveProperty('data');
      expect(body.data).toEqual(mockNotifications);
    });

    it('returns 500 when file read fails', async () => {
      mockReadJsonFile.mockRejectedValue(new Error('ENOENT'));

      const response = await GET(createRequest('GET') as any);
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body).toHaveProperty('error');
    });
  });

  describe('PATCH /api/admin/notifications/[id]/read', () => {
    it('marks a notification as read with status 200', async () => {
      const mockNotifications = [
        { id: 'n-1', title: 'Test', isRead: false, createdAt: '2024-01-01' },
        { id: 'n-2', title: 'Other', isRead: false, createdAt: '2024-01-02' },
      ];
      mockReadJsonFile.mockResolvedValue(mockNotifications);

      const response = await PATCH(
        createRequest('PATCH') as any,
        paramsWithId('n-1')
      );
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.data.isRead).toBe(true);
      expect(body.data.id).toBe('n-1');
      expect(mockWriteJsonFile).toHaveBeenCalledOnce();
    });

    it('returns 404 for non-existent notification ID', async () => {
      mockReadJsonFile.mockResolvedValue([
        { id: 'n-1', title: 'Test', isRead: false, createdAt: '2024-01-01' },
      ]);

      const response = await PATCH(
        createRequest('PATCH') as any,
        paramsWithId('non-existent')
      );
      const body = await response.json();

      expect(response.status).toBe(404);
      expect(body.error).toContain('not found');
    });

    it('returns 500 when file read fails', async () => {
      mockReadJsonFile.mockRejectedValue(new Error('ENOENT'));

      const response = await PATCH(
        createRequest('PATCH') as any,
        paramsWithId('n-1')
      );
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body).toHaveProperty('error');
    });
  });

  describe('POST /api/admin/notifications/mark-all-read', () => {
    it('marks all notifications as read and returns them', async () => {
      const mockNotifications = [
        { id: 'n-1', title: 'A', isRead: false, createdAt: '2024-01-01' },
        { id: 'n-2', title: 'B', isRead: false, createdAt: '2024-01-02' },
        { id: 'n-3', title: 'C', isRead: true, createdAt: '2024-01-03' },
      ];
      mockReadJsonFile.mockResolvedValue(mockNotifications);

      const response = await MARK_ALL_READ(createRequest('POST') as any);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.data).toHaveLength(3);
      expect(body.data.every((n: any) => n.isRead === true)).toBe(true);
      expect(mockWriteJsonFile).toHaveBeenCalledOnce();
    });

    it('handles an empty notification list', async () => {
      mockReadJsonFile.mockResolvedValue([]);

      const response = await MARK_ALL_READ(createRequest('POST') as any);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.data).toEqual([]);
    });

    it('returns 500 when file read fails', async () => {
      mockReadJsonFile.mockRejectedValue(new Error('ENOENT'));

      const response = await MARK_ALL_READ(createRequest('POST') as any);
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body).toHaveProperty('error');
    });
  });

  describe('DELETE /api/admin/notifications/old', () => {
    it('deletes notifications before the cutoff date and returns count', async () => {
      const mockNotifications = [
        { id: 'n-1', title: 'Old', isRead: true, createdAt: '2023-06-01T00:00:00Z' },
        { id: 'n-2', title: 'Recent', isRead: false, createdAt: '2024-06-01T00:00:00Z' },
        { id: 'n-3', title: 'Very Old', isRead: true, createdAt: '2023-01-01T00:00:00Z' },
      ];
      mockReadJsonFile.mockResolvedValue(mockNotifications);

      const url = 'http://localhost/api/admin/notifications/old?cutoff=2024-01-01T00:00:00Z';
      const response = await DELETE_OLD(createRequest('DELETE', url) as any);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.data.deletedCount).toBe(2);
      expect(mockWriteJsonFile).toHaveBeenCalledWith(
        'notifications.json',
        [{ id: 'n-2', title: 'Recent', isRead: false, createdAt: '2024-06-01T00:00:00Z' }]
      );
    });

    it('returns 0 deleted when no notifications are before cutoff', async () => {
      const mockNotifications = [
        { id: 'n-1', title: 'Recent', isRead: false, createdAt: '2024-06-01T00:00:00Z' },
      ];
      mockReadJsonFile.mockResolvedValue(mockNotifications);

      const url = 'http://localhost/api/admin/notifications/old?cutoff=2020-01-01T00:00:00Z';
      const response = await DELETE_OLD(createRequest('DELETE', url) as any);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.data.deletedCount).toBe(0);
    });

    it('returns 400 when cutoff parameter is missing', async () => {
      const url = 'http://localhost/api/admin/notifications/old';
      const response = await DELETE_OLD(createRequest('DELETE', url) as any);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toContain('cutoff');
    });

    it('returns 400 for an invalid cutoff date', async () => {
      const url = 'http://localhost/api/admin/notifications/old?cutoff=not-a-date';
      const response = await DELETE_OLD(createRequest('DELETE', url) as any);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toContain('valid ISO date');
    });

    it('returns 500 when file read fails', async () => {
      mockReadJsonFile.mockRejectedValue(new Error('ENOENT'));

      const url = 'http://localhost/api/admin/notifications/old?cutoff=2024-01-01T00:00:00Z';
      const response = await DELETE_OLD(createRequest('DELETE', url) as any);
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body).toHaveProperty('error');
    });
  });
});
