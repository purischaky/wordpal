import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
} from '@/lib/api/response';

describe('Feature: admin-api-routes, Property 14: Response Envelope Consistency', () => {
  /**
   * Validates: Requirements 13.1, 13.2, 13.3
   */

  it('successResponse always includes a "data" field with the provided payload', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.jsonValue(),
        async (payload) => {
          const response = successResponse(payload);
          const body = await response.json();

          expect(body).toHaveProperty('data');
          expect(body.data).toEqual(payload);
          expect(response.status).toBe(200);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('successResponse wraps arbitrary data payloads in { data } envelope', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.oneof(
          fc.jsonValue(),
          fc.array(fc.jsonValue()),
          fc.dictionary(fc.string({ minLength: 1, maxLength: 10 }), fc.jsonValue())
        ),
        async (payload) => {
          const response = successResponse(payload);
          const body = await response.json();

          expect(body).toHaveProperty('data');
          expect(Object.prototype.hasOwnProperty.call(body, 'data')).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('errorResponse always includes an "error" field as a non-empty string', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1 }),
        async (message) => {
          const response = errorResponse(message);
          const body = await response.json();

          expect(body).toHaveProperty('error');
          expect(typeof body.error).toBe('string');
          expect(body.error.length).toBeGreaterThan(0);
          expect(body.error).toBe(message);
          expect(response.status).toBe(500);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('errorResponse respects custom status codes', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1 }),
        fc.constantFrom(400, 401, 403, 404, 409, 422, 500, 502, 503),
        async (message, status) => {
          const response = errorResponse(message, status);
          const body = await response.json();

          expect(body).toHaveProperty('error');
          expect(typeof body.error).toBe('string');
          expect(response.status).toBe(status);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('validationErrorResponse includes "error" field and "details" array', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1 }),
        fc.array(fc.string({ minLength: 1 }), { minLength: 1 }),
        async (message, details) => {
          const response = validationErrorResponse(message, details);
          const body = await response.json();

          expect(body).toHaveProperty('error');
          expect(typeof body.error).toBe('string');
          expect(body.error.length).toBeGreaterThan(0);
          expect(body.error).toBe(message);

          expect(body).toHaveProperty('details');
          expect(Array.isArray(body.details)).toBe(true);
          expect(body.details.length).toBeGreaterThan(0);
          expect(body.details).toEqual(details);

          expect(response.status).toBe(400);
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('Feature: admin-api-routes, Property 15: Non-JSON Body Rejection', () => {
  /**
   * Validates: Requirements 12.1
   */

  // Generator for strings that are definitely not valid JSON
  const nonJsonString = fc
    .string({ minLength: 1 })
    .filter((s) => {
      try {
        JSON.parse(s);
        return false;
      } catch {
        return true;
      }
    });

  it('non-JSON strings produce a SyntaxError when parsed as JSON via Request.json()', async () => {
    await fc.assert(
      fc.asyncProperty(nonJsonString, async (invalidJson) => {
        const request = new Request('http://localhost/api/admin/test', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: invalidJson,
        });

        let caughtError: unknown = null;
        try {
          await request.json();
        } catch (error) {
          caughtError = error;
        }

        expect(caughtError).toBeInstanceOf(SyntaxError);
      }),
      { numRuns: 100 }
    );
  });

  it('non-JSON bodies handled by route pattern return 400 with appropriate error message', async () => {
    await fc.assert(
      fc.asyncProperty(nonJsonString, async (invalidJson) => {
        // Simulate the route handler pattern from the design doc:
        // try { await request.json() } catch (error) { if (error instanceof SyntaxError) return errorResponse(..., 400) }
        const request = new Request('http://localhost/api/admin/test', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: invalidJson,
        });

        let response: Response;
        try {
          await request.json();
          response = successResponse({ parsed: true });
        } catch (error) {
          if (error instanceof SyntaxError) {
            response = errorResponse('Invalid JSON in request body', 400);
          } else {
            response = errorResponse('Unexpected error', 500);
          }
        }

        expect(response!.status).toBe(400);
        const body = await response!.json();
        expect(body).toHaveProperty('error');
        expect(typeof body.error).toBe('string');
        expect(body.error).toContain('Invalid JSON');
      }),
      { numRuns: 100 }
    );
  });
});
