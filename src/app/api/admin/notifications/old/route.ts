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

export async function DELETE(request: NextRequest) {
  try {
    const cutoff = request.nextUrl.searchParams.get('cutoff');

    if (!cutoff) {
      return errorResponse('cutoff query parameter is required', 400);
    }

    const cutoffDate = new Date(cutoff);
    if (isNaN(cutoffDate.getTime())) {
      return errorResponse('cutoff must be a valid ISO date string', 400);
    }

    const notifications = await readJsonFile<Notification[]>('notifications.json');
    const remaining = notifications.filter(
      (n) => new Date(n.createdAt) >= cutoffDate
    );
    const deletedCount = notifications.length - remaining.length;

    await writeJsonFile('notifications.json', remaining);

    return successResponse({ deletedCount });
  } catch (error) {
    return errorResponse('Failed to delete old notifications');
  }
}
