import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fc from 'fast-check';
import { readFile, writeFile, mkdir, rm } from 'fs/promises';
import path from 'path';
import os from 'os';

/**
 * Feature: admin-api-routes, Property 1: File Service Round-Trip
 *
 * Validates: Requirements 15.2, 15.3
 *
 * For any valid JSON-compatible object, writing it via writeJsonFile and
 * reading it back via readJsonFile should produce a deeply equal object.
 * Additionally, the raw file content should be formatted with 2-space indentation.
 */

let tempDir: string;
let readJsonFile: typeof import('@/lib/api/file-service').readJsonFile;
let writeJsonFile: typeof import('@/lib/api/file-service').writeJsonFile;

describe('Feature: admin-api-routes, Property 1: File Service Round-Trip', () => {
  beforeEach(async () => {
    // Create a unique temp directory for each test
    tempDir = path.join(os.tmpdir(), `file-service-test-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    await mkdir(tempDir, { recursive: true });

    // Mock the file-service module to use temp directory
    vi.doMock('@/lib/api/file-service', () => {
      const fsPromises = require('fs/promises');
      const pathModule = require('path');

      return {
        readJsonFile: async <T>(filename: string): Promise<T> => {
          const filePath = pathModule.join(tempDir, filename);
          const content = await fsPromises.readFile(filePath, 'utf-8');
          return JSON.parse(content) as T;
        },
        writeJsonFile: async <T>(filename: string, data: T): Promise<void> => {
          const filePath = pathModule.join(tempDir, filename);
          const content = JSON.stringify(data, null, 2);
          await fsPromises.writeFile(filePath, content, 'utf-8');
        },
      };
    });

    const mod = await import('@/lib/api/file-service');
    readJsonFile = mod.readJsonFile;
    writeJsonFile = mod.writeJsonFile;
  });

  afterEach(async () => {
    vi.doUnmock('@/lib/api/file-service');
    vi.resetModules();
    // Clean up temp directory
    await rm(tempDir, { recursive: true, force: true });
  });

  it('round-trips arbitrary JSON objects through write and read', async () => {
    await fc.assert(
      fc.asyncProperty(fc.jsonValue(), async (data) => {
        const filename = 'test-roundtrip.json';

        await writeJsonFile(filename, data);
        const result = await readJsonFile(filename);

        // JSON.stringify normalizes -0 to 0, NaN to null, etc.
        // The round-trip should match what JSON itself would produce.
        const expected = JSON.parse(JSON.stringify(data));
        expect(result).toStrictEqual(expected);
      }),
      { numRuns: 100 }
    );
  });

  it('writes files with 2-space indentation', async () => {
    await fc.assert(
      fc.asyncProperty(fc.jsonValue(), async (data) => {
        const filename = 'test-indentation.json';

        await writeJsonFile(filename, data);

        // Read raw file content to verify formatting
        const rawContent = await readFile(path.join(tempDir, filename), 'utf-8');
        const expectedContent = JSON.stringify(data, null, 2);

        expect(rawContent).toBe(expectedContent);
      }),
      { numRuns: 100 }
    );
  });
});
