import type { CleverActionContext, CleverActionHandler, CleverLifecycleEvent, CleverLifecycleEventName } from './types';

type LifecycleHandler = (event: CleverLifecycleEvent) => Promise<void> | void;

class LifecycleRegistry {
  private handlers = new Map<CleverLifecycleEventName, Set<LifecycleHandler>>();

  on(name: CleverLifecycleEventName, handler: LifecycleHandler) {
    const set = this.handlers.get(name) || new Set<LifecycleHandler>();
    set.add(handler);
    this.handlers.set(name, set);
    return () => set.delete(handler);
  }

  async emit(name: CleverLifecycleEventName, payload: unknown) {
    const event: CleverLifecycleEvent = { name, payload, timestamp: new Date().toISOString() };
    for (const handler of this.handlers.get(name) || []) await handler(event);
  }
}

class ActionRegistry {
  private handlers = new Map<string, CleverActionHandler>();

  register(handler: CleverActionHandler) {
    if (!handler?.id) throw new Error('CleverForms action handlers require an id.');
    this.handlers.set(handler.id, handler);
  }

  get(id: string) { return this.handlers.get(id); }
  list() { return [...this.handlers.values()]; }

  async execute(id: string, context: CleverActionContext) {
    const handler = this.handlers.get(id);
    if (!handler) throw new Error(`Unknown CleverForms action: ${id}`);
    return handler.execute(context);
  }
}

export const cleverFormsLifecycle = new LifecycleRegistry();
export const cleverFormsActions = new ActionRegistry();
