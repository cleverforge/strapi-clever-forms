import { describe, expect, it } from 'vitest';
import { normalizeLegacyForm, parseCleverFormSchema } from '../shared/schema';

describe('CleverForms schema', () => {
  const legacy = {
    name: 'Contact',
    slug: 'contact',
    status: 'draft',
    pages: [{ id: 'p1', title: 'Page 1', fields: [] }],
  };

  it('normalizes legacy forms to schema version 1', () => {
    const form = normalizeLegacyForm(legacy);
    expect(form.schemaVersion).toBe(1);
    expect(form.extensionApiVersion).toBe(1);
    expect(form.version).toBe(1);
  });

  it('rejects unsupported schema versions', () => {
    expect(() => parseCleverFormSchema({ ...legacy, schemaVersion: 99, extensionApiVersion: 1, version: 1 })).toThrow();
  });
});
