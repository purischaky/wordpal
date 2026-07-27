import type { NextRequest } from 'next/server';
import { readJsonFile, writeJsonFile } from '@/lib/api/file-service';
import { successResponse, errorResponse } from '@/lib/api/response';

export const dynamic = 'force-dynamic';

interface Notification {
  id: string;
  isRead: boolean;
  createdAt: string;
  [key: string]: unknown;
}

export async function POST(request: NextRequest) {
  try {
    const notifications = await readJsonFile<Notification[]>('notifications.json');
    const updated = notifications.map((n) => ({ ...n, isRead: true }));
    await writeJsonFile('notifications.json', updated);

    return successResponse(updated);
  } catch (error) {
    return errorResponse('Failed to mark notifications as read');
  }
}
