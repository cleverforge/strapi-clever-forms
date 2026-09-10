import type { CleverField, CleverFormDefinition } from '../types';

export class CleverFormsValidationError extends Error {
  details: Record<string, string>;
  constructor(details: Record<string, string>) {
    super('Submission validation failed');
    this.name = 'CleverFormsValidationError';
    this.details = details;
  }
}

const isBlank = (value: unknown) => value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0);

export function validateSubmission(form: CleverFormDefinition, input: Record<string, unknown>) {
  const errors: Record<string, string> = {};
  const output: Record<string, unknown> = {};

  for (const page of form.pages ?? []) {
    for (const field of page.fields ?? []) {
      if (['heading', 'paragraph'].includes(field.type)) continue;
      const value = input[field.name];
      if (field.required && isBlank(value)) {
        errors[field.name] = 'This field is required.';
        continue;
      }
      if (isBlank(value)) continue;

      if (field.type === 'email' && (typeof value !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))) {
        errors[field.name] = 'Enter a valid email address.';
        continue;
      }
      if (field.type === 'number' && (typeof value === 'boolean' || Number.isNaN(Number(value)))) {
        errors[field.name] = 'Enter a valid number.';
        continue;
      }
      if (['select', 'radio', 'checkboxGroup', 'multiselect'].includes(field.type)) {
        const allowed = new Set((field.options ?? []).map((option) => option.value));
        const values = Array.isArray(value) ? value : [value];
        if (values.some((item) => typeof item !== 'string' || !allowed.has(item))) {
          errors[field.name] = 'Invalid option.';
          continue;
        }
      }
      output[field.name] = value;
    }
  }

  if (Object.keys(errors).length) throw new CleverFormsValidationError(errors);
  return output;
}
