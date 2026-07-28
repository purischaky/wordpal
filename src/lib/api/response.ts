function toCamelCase(key: string): string {
  return key.replace(/_([a-z0-9])/g, (_, c: string) => c.toUpperCase());
}

/**
 * Recursively converts snake_case object keys to camelCase.
 *
 * Postgres/PostgREST always returns snake_case columns, but every type in
 * src/types/admin.ts (and the frontend code that reads them) is camelCase —
 * a holdover from when the API was backed by hand-written camelCase JSON
 * files. Routes that pass Supabase rows straight through must go through
 * this so the response actually matches what the frontend expects; routes
 * built on a SECURITY DEFINER RPC that constructs its own jsonb (e.g.
 * get_student_profile) are already camelCase and pass through unchanged.
 */
export function camelizeKeys<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((v) => camelizeKeys(v)) as unknown as T;
  }
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([k, v]) => [toCamelCase(k), camelizeKeys(v)])
    ) as T;
  }
  return value;
}

/**
 * Recursively renames a key, at any depth, in objects/arrays. Used for the
 * handful of fields that differ by more than casing — e.g. the DB column
 * `position` (chosen to avoid colliding with SQL's ORDER BY) vs. the
 * `order` field every admin type exposes it as.
 */
export function renameKey<T>(value: T, from: string, to: string): T {
  if (Array.isArray(value)) {
    return value.map((v) => renameKey(v, from, to)) as unknown as T;
  }
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([k, v]) => [k === from ? to : k, renameKey(v, from, to)])
    ) as T;
  }
  return value;
}

/**
 * Creates a successful JSON response with the standard envelope.
 */
export function successResponse<T>(data: T, status = 200): Response {
  return Response.json({ data: camelizeKeys(data) }, { status });
}

/**
 * Creates an error JSON response with the standard envelope.
 */
export function errorResponse(message: string, status = 500): Response {
  return Response.json({ error: message }, { status });
}

/**
 * Creates a validation error response with field-level details.
 */
export function validationErrorResponse(
  message: string,
  details: string[]
): Response {
  return Response.json({ error: message, details }, { status: 400 });
}
