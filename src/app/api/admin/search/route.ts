import type { NextRequest } from 'next/server';
import { readJsonFile } from '@/lib/api/file-service';
import { successResponse, errorResponse } from '@/lib/api/response';
import { filterSearchResults, SearchResult } from '@/lib/api/search-filter';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const q = request.nextUrl.searchParams.get('q') || '';

    if (q.length < 2) {
      return successResponse([]);
    }

    const searchData = await readJsonFile<SearchResult[]>('search-data.json');
    const results = filterSearchResults(q, searchData);

    return successResponse(results);
  } catch (error) {
    return errorResponse('Failed to read search data');
  }
}
