import { describe, expect, it } from 'vitest';
import { validateSubmission, CleverFormsValidationError } from '../server/src/utils/validation';

const form: any = {
  name: 'Contact', slug: 'contact', lifecycle: 'active', publishedAt: '2026-01-01T00:00:00.000Z', version: 1,
  pages: [{ fields: [
    { name: 'email', type: 'email', required: true },
    { name: 'topic', type: 'select', options: [{ label: 'Support', value: 'support' }] },
  ] }],
};

describe('validateSubmission', () => {
  it('accepts configured valid values', () => {
    expect(validateSubmission(form, { email: 'a@example.com', topic: 'support' }))
      .toEqual({ email: 'a@example.com', topic: 'support' });
  });

  it('rejects unknown fields instead of silently accepting client-controlled data', () => {
    expect(() => validateSubmission(form, { email: 'a@example.com', admin: true }))
      .toThrow(CleverFormsValidationError);
  });

  it('rejects invalid configured choices', () => {
    expect(() => validateSubmission(form, { email: 'a@example.com', topic: 'hacked' }))
      .toThrow(CleverFormsValidationError);
  });

  it('requires configured required fields', () => {
    expect(() => validateSubmission(form, {})).toThrow(CleverFormsValidationError);
  });

  it('rejects oversized string values', () => {
    expect(() => validateSubmission(form, { email: 'a'.repeat(50_001) }))
      .toThrow(CleverFormsValidationError);
  });
});
