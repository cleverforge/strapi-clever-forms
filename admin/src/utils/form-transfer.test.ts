import { describe, expect, it } from 'vitest';
import { exportForm, importForm } from './form-transfer';

describe('form transfer', () => {
  it('exports only supported form properties', () => {
    const raw = exportForm({
      documentId: 'secret-id',
      name: 'Contact',
      slug: 'contact',
      status: 'published',
      pages: [{ id: 'p1', title: 'Page 1', fields: [] }],
      internalOnly: 'nope',
    });
    const parsed = JSON.parse(raw);
    expect(parsed.schemaVersion).toBe(1);
    expect(parsed.form.name).toBe('Contact');
    expect(parsed.form.documentId).toBeUndefined();
    expect(parsed.form.internalOnly).toBeUndefined();
  });

  it('imports as a new draft copy', () => {
    const raw = JSON.stringify({
      schemaVersion: 1,
      product: 'CleverForms',
      exportedAt: new Date().toISOString(),
      form: { name: 'Contact', slug: 'contact', pages: [] },
    });
    const form = importForm(raw);
    expect(form.documentId).toBeUndefined();
    expect(form.status).toBe('draft');
    expect(form.name).toBe('Contact Copy');
  });

  it('rejects unsupported files', () => {
    expect(() => importForm('{"schemaVersion":2}')).toThrow();
  });
});
