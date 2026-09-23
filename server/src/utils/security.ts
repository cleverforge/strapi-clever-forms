const RESERVED_KEYS = new Set(['__proto__', 'prototype', 'constructor']);

export const MAX_SUBMISSION_BYTES = 256 * 1024;
export const MAX_SUBMISSION_FIELDS = 200;
export const MAX_STRING_LENGTH = 50_000;
export const MAX_ARRAY_ITEMS = 100;
export const MAX_USER_AGENT_LENGTH = 512;
export const MAX_SLUG_LENGTH = 160;

export function isSafeFieldName(name: string): boolean {
  return /^[A-Za-z][A-Za-z0-9_-]{0,127}$/.test(name) && !RESERVED_KEYS.has(name);
}

export function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

export function assertSafeObject(value: unknown, path = 'data', depth = 0): void {
  if (depth > 8) throw new Error(`${path} is too deeply nested.`);

  if (Array.isArray(value)) {
    if (value.length > MAX_ARRAY_ITEMS) throw new Error(`${path} contains too many items.`);
    value.forEach((item, index) => assertSafeObject(item, `${path}[${index}]`, depth + 1));
    return;
  }

  if (!value || typeof value !== 'object') return;

  for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
    if (RESERVED_KEYS.has(key)) throw new Error(`${path} contains a reserved property name.`);
    assertSafeObject(item, `${path}.${key}`, depth + 1);
  }
}

export function assertSubmissionEnvelope(input: unknown): asserts input is Record<string, unknown> {
  if (!isPlainRecord(input)) throw new Error('Submission data must be a JSON object.');

  const keys = Object.keys(input);
  if (keys.length > MAX_SUBMISSION_FIELDS) throw new Error('Submission contains too many fields.');

  const serialized = JSON.stringify(input);
  if (Buffer.byteLength(serialized, 'utf8') > MAX_SUBMISSION_BYTES) {
    throw new Error('Submission payload is too large.');
  }

  assertSafeObject(input);
}

export function assertValueSize(value: unknown, fieldName: string): void {
  if (typeof value === 'string' && value.length > MAX_STRING_LENGTH) {
    throw new Error(`${fieldName} is too long.`);
  }

  if (Array.isArray(value) && value.length > MAX_ARRAY_ITEMS) {
    throw new Error(`${fieldName} contains too many values.`);
  }
}

export function safeSlug(value: unknown): string | null {
  const slug = String(value ?? '').trim();
  if (!slug || slug.length > MAX_SLUG_LENGTH) return null;
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return null;
  return slug;
}

export function truncateUserAgent(value: unknown): string | null {
  if (typeof value !== 'string' || !value) return null;
  return value.slice(0, MAX_USER_AGENT_LENGTH);
}
