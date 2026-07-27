/**
 * Creates a successful JSON response with the standard envelope.
 */
export function successResponse<T>(data: T, status = 200): Response {
  return Response.json({ data }, { status });
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
