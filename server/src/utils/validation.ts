import type { CleverFormDefinition } from '../types';
import { assertSubmissionEnvelope, assertValueSize, isSafeFieldName } from './security';

export class CleverFormsValidationError extends Error {
  details: Record<string, string>;
  constructor(details: Record<string, string>) {
    super('Submission validation failed');
    this.name = 'CleverFormsValidationError';
    this.details = details;
  }
}

const isBlank = (value: unknown) => value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0);

export function validateSubmission(form: CleverFormDefinition, input: unknown) {
  const errors: Record<string, string> = {};
  const output: Record<string, unknown> = {};

  try {
    assertSubmissionEnvelope(input);
  } catch (error) {
    throw new CleverFormsValidationError({ _form: error instanceof Error ? error.message : 'Invalid submission.' });
  }

  const record = input as Record<string, unknown>;
  const allowedFields = new Set(
    (form.pages ?? []).flatMap((page) => (page.fields ?? []).filter((field) => !['heading', 'paragraph'].includes(field.type)).map((field) => field.name))
  );

  for (const key of Object.keys(record)) {
    if (!isSafeFieldName(key)) errors[key] = 'Invalid field name.';
    else if (!allowedFields.has(key)) errors[key] = 'Unknown field.';
  }

  for (const page of form.pages ?? []) {
    for (const field of page.fields ?? []) {
      if (['heading', 'paragraph'].includes(field.type)) continue;
      const value = record[field.name];

      if (field.required && isBlank(value)) {
        errors[field.name] = 'This field is required.';
        continue;
      }
      if (isBlank(value)) continue;

      try {
        assertValueSize(value, field.name);
      } catch (error) {
        errors[field.name] = error instanceof Error ? error.message : 'Invalid value.';
        continue;
      }

      if (field.type === 'email' && (typeof value !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))) {
        errors[field.name] = 'Enter a valid email address.';
        continue;
      }
      if (field.type === 'number' && (typeof value === 'boolean' || Number.isNaN(Number(value)))) {
        errors[field.name] = 'Enter a valid number.';
        continue;
      }
      if (field.type === 'checkbox' && typeof value !== 'boolean') {
        errors[field.name] = 'Enter a valid checkbox value.';
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
