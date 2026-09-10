import type { CleverCondition, CleverConditionGroup, CleverConditionOperator } from './types';

const empty = (value: unknown) => value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0);
const normalizeComparable = (value: unknown) => typeof value === 'string' ? value.toLowerCase() : value;

export function evaluateCondition(condition: CleverCondition, data: Record<string, unknown>): boolean {
  const actual = data[condition.field];
  const expected = condition.value;
  const operator: CleverConditionOperator = condition.operator;

  switch (operator) {
    case 'eq': return normalizeComparable(actual) === normalizeComparable(expected);
    case 'neq': return normalizeComparable(actual) !== normalizeComparable(expected);
    case 'contains': return Array.isArray(actual) ? actual.includes(expected) : String(actual ?? '').toLowerCase().includes(String(expected ?? '').toLowerCase());
    case 'notContains': return !evaluateCondition({ ...condition, operator: 'contains' }, data);
    case 'startsWith': return String(actual ?? '').toLowerCase().startsWith(String(expected ?? '').toLowerCase());
    case 'endsWith': return String(actual ?? '').toLowerCase().endsWith(String(expected ?? '').toLowerCase());
    case 'gt': return Number(actual) > Number(expected);
    case 'gte': return Number(actual) >= Number(expected);
    case 'lt': return Number(actual) < Number(expected);
    case 'lte': return Number(actual) <= Number(expected);
    case 'isEmpty': return empty(actual);
    case 'isNotEmpty': return !empty(actual);
    case 'in': return Array.isArray(expected) && expected.includes(actual);
    case 'notIn': return !(Array.isArray(expected) && expected.includes(actual));
    default: return false;
  }
}

export function evaluateConditionGroup(group: CleverConditionGroup | null | undefined, data: Record<string, unknown>): boolean {
  if (!group || !Array.isArray(group.rules) || group.rules.length === 0) return true;
  const results = group.rules.map((rule) => 'logic' in rule ? evaluateConditionGroup(rule, data) : evaluateCondition(rule, data));
  return group.logic === 'or' ? results.some(Boolean) : results.every(Boolean);
}
