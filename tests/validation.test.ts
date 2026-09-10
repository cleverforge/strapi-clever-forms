import { describe, expect, it } from 'vitest';
import { validateSubmission, CleverFormsValidationError } from '../server/src/utils/validation';

const form: any = {
  name: 'Contact', slug: 'contact', status: 'published', version: 1,
  pages: [{ fields: [
    { name: 'email', type: 'email', required: true },
    { name: 'topic', type: 'select', options: [{ label: 'Support', value: 'support' }] },
  ] }],
};

describe('validateSubmission', () => {
  it('accepts valid values and strips unknown keys', () => {
    expect(validateSubmission(form, { email: 'a@example.com', topic: 'support', admin: true }))
      .toEqual({ email: 'a@example.com', topic: 'support' });
  });

  it('rejects invalid configured choices', () => {
    expect(() => validateSubmission(form, { email: 'a@example.com', topic: 'hacked' }))
      .toThrow(CleverFormsValidationError);
  });

  it('requires configured required fields', () => {
    expect(() => validateSubmission(form, {})).toThrow(CleverFormsValidationError);
  });
});
