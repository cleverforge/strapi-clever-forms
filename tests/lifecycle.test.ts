import { describe, expect, it, vi } from 'vitest';
import { cleverFormsActions, cleverFormsLifecycle } from '../shared/lifecycle';

describe('lifecycle registry', () => {
  it('emits registered lifecycle handlers', async () => {
    const handler = vi.fn();
    const unsubscribe = cleverFormsLifecycle.on('form.afterPublish', handler);
    await cleverFormsLifecycle.emit('form.afterPublish', { documentId: 'abc' });
    expect(handler).toHaveBeenCalledTimes(1);
    unsubscribe();
  });
});

describe('action registry', () => {
  it('registers and executes provider-neutral actions', async () => {
    cleverFormsActions.register({
      id: 'test.echo',
      execute: async (context) => ({ ok: true, data: context.form.slug }),
    });

    const result = await cleverFormsActions.execute('test.echo', {
      form: {
        schemaVersion: 1,
        extensionApiVersion: 1,
        name: 'Test',
        slug: 'test',
        status: 'draft',
        version: 1,
        pages: [{ id: 'p1', title: 'Page 1', fields: [] }],
      },
    });

    expect(result).toEqual({ ok: true, data: 'test' });
  });
});
