import { describe, expect, it } from 'vitest';
import { evaluateConditionGroup } from '../shared/conditions';

describe('conditional logic', () => {
  it('supports nested and/or groups', () => {
    const group: any = {
      logic: 'and',
      rules: [
        { field: 'age', operator: 'gte', value: 18 },
        {
          logic: 'or',
          rules: [
            { field: 'state', operator: 'eq', value: 'PA' },
            { field: 'state', operator: 'eq', value: 'NY' },
          ],
        },
      ],
    };

    expect(evaluateConditionGroup(group, { age: 21, state: 'PA' })).toBe(true);
    expect(evaluateConditionGroup(group, { age: 17, state: 'PA' })).toBe(false);
    expect(evaluateConditionGroup(group, { age: 21, state: 'NJ' })).toBe(false);
  });

  it('supports contains and empty operators', () => {
    expect(evaluateConditionGroup({ logic: 'and', rules: [{ field: 'name', operator: 'contains', value: 'lex' }] } as any, { name: 'Alexandra' })).toBe(true);
    expect(evaluateConditionGroup({ logic: 'and', rules: [{ field: 'notes', operator: 'isEmpty' }] } as any, { notes: '' })).toBe(true);
  });
});
