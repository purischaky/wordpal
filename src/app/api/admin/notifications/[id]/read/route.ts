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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const notifications = await readJsonFile<Notification[]>('notifications.json');
    const index = notifications.findIndex((n) => n.id === id);

    if (index === -1) {
      return errorResponse('Notification not found', 404);
    }

    notifications[index] = { ...notifications[index], isRead: true };
    await writeJsonFile('notifications.json', notifications);

    return successResponse(notifications[index]);
  } catch (error) {
    return errorResponse('Failed to update notification');
  }
}
