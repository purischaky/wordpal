import type { NextRequest } from 'next/server';
import { readJsonFile, writeJsonFile } from '@/lib/api/file-service';
import { successResponse, errorResponse } from '@/lib/api/response';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const { unitIds } = body as { unitIds: string[] };

    if (!Array.isArray(unitIds)) {
      return errorResponse('unitIds must be an array', 400);
    }

    const learningPaths = await readJsonFile<Record<string, unknown>[]>(
      'learning-paths.json'
    );
    const index = learningPaths.findIndex((lp) => lp.id === id);

    if (index === -1) {
      return errorResponse('Learning path not found', 404);
    }

    const learningPath = learningPaths[index];
    const units = (learningPath.units as Array<Record<string, unknown>>) || [];

    // Reorder units based on the provided unitIds order
    const reorderedUnits: Record<string, unknown>[] = [];
    for (let i = 0; i < unitIds.length; i++) {
      const unit = units.find((u) => u.id === unitIds[i]);
      if (unit) {
        reorderedUnits.push({ ...unit, order: i + 1 });
      }
    }

    learningPaths[index] = {
      ...learningPath,
      units: reorderedUnits,
      updatedAt: new Date().toISOString(),
    };
    await writeJsonFile('learning-paths.json', learningPaths);

    return successResponse(learningPaths[index]);
  } catch (error) {
    if (error instanceof SyntaxError) {
      return errorResponse('Invalid JSON in request body', 400);
    }
    return errorResponse('Failed to reorder learning path units');
  }
}
