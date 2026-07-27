import { readFile, writeFile } from 'fs/promises';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'src', 'data', 'admin');

/**
 * Reads and parses a JSON file from the admin data directory.
 * Throws if file not found or JSON is invalid.
 */
export async function readJsonFile<T>(filename: string): Promise<T> {
  const filePath = path.join(DATA_DIR, filename);
  const content = await readFile(filePath, 'utf-8');
  return JSON.parse(content) as T;
}

/**
 * Serializes data and writes it to a JSON file with 2-space indentation.
 */
export async function writeJsonFile<T>(filename: string, data: T): Promise<void> {
  const filePath = path.join(DATA_DIR, filename);
  const content = JSON.stringify(data, null, 2);
  await writeFile(filePath, content, 'utf-8');
}
