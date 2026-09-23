import * as React from 'react';
import { evaluateConditionGroup } from '../../shared/conditions';
import type { CleverConditionGroup } from '../../shared/types';

export type RendererField = {
  name: string;
  type: string;
  label?: string;
  placeholder?: string;
  helpText?: string;
  required?: boolean;
  options?: Array<{ label: string; value: string }>;
  conditions?: CleverConditionGroup | null;
};

export type RendererForm = {
  slug: string;
  name?: string;
  description?: string;
  confirmation?: { type?: string; message?: string } | null;
  pages: Array<{ title?: string; description?: string; fields: RendererField[] }>;
};

function collectFormData(form: HTMLFormElement): Record<string, unknown> {
  const output: Record<string, unknown> = {};
  const data = new FormData(form);

  for (const [key, value] of data.entries()) {
    if (typeof value !== 'string') continue;
    if (output[key] === undefined) output[key] = value;
    else if (Array.isArray(output[key])) (output[key] as string[]).push(value);
    else output[key] = [output[key] as string, value];
  }

  for (const element of Array.from(form.elements)) {
    if (!(element instanceof HTMLInputElement) || !element.name) continue;
    if (element.type === 'checkbox' && !element.checked && output[element.name] === undefined) {
      output[element.name] = false;
    }
    if (element.type === 'number' && typeof output[element.name] === 'string' && output[element.name] !== '') {
      output[element.name] = Number(output[element.name]);
    }
  }

  return output;
}

function FieldControl({ field, value, onChange }: { field: RendererField; value: unknown; onChange: (name: string, value: unknown) => void }) {
  if (field.type === 'heading') return <h2>{field.label}</h2>;
  if (field.type === 'paragraph') return <p>{field.label}</p>;
  if (field.type === 'hidden') return <input name={field.name} type="hidden" value={String(value ?? '')} onChange={() => undefined} />;

  const label = <span>{field.label}{field.required ? ' *' : ''}</span>;

  if (field.type === 'textarea') {
    return <label>{label}<textarea name={field.name} placeholder={field.placeholder} required={field.required} value={String(value ?? '')} onChange={(e) => onChange(field.name, e.target.value)} />{field.helpText && <small>{field.helpText}</small>}</label>;
  }

  if (field.type === 'select') {
    return <label>{label}<select name={field.name} required={field.required} value={String(value ?? '')} onChange={(e) => onChange(field.name, e.target.value)}><option value="">Select…</option>{field.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select>{field.helpText && <small>{field.helpText}</small>}</label>;
  }

  if (field.type === 'multiselect') {
    const selected = Array.isArray(value) ? value.map(String) : [];
    return <label>{label}<select name={field.name} multiple required={field.required} value={selected} onChange={(e) => onChange(field.name, Array.from(e.target.selectedOptions).map((o) => o.value))}>{field.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select>{field.helpText && <small>{field.helpText}</small>}</label>;
  }

  if (field.type === 'radio') {
    return <fieldset><legend>{label}</legend>{field.options?.map((o) => <label key={o.value}><input type="radio" name={field.name} value={o.value} checked={value === o.value} required={field.required} onChange={() => onChange(field.name, o.value)} /> {o.label}</label>)}{field.helpText && <small>{field.helpText}</small>}</fieldset>;
  }

  if (field.type === 'checkboxGroup') {
    const selected = new Set(Array.isArray(value) ? value.map(String) : []);
    return <fieldset><legend>{label}</legend>{field.options?.map((o) => <label key={o.value}><input type="checkbox" name={field.name} value={o.value} checked={selected.has(o.value)} onChange={(e) => { const next = new Set(selected); e.target.checked ? next.add(o.value) : next.delete(o.value); onChange(field.name, Array.from(next)); }} /> {o.label}</label>)}{field.helpText && <small>{field.helpText}</small>}</fieldset>;
  }

  if (field.type === 'checkbox') {
    return <label><input type="checkbox" name={field.name} checked={Boolean(value)} required={field.required} onChange={(e) => onChange(field.name, e.target.checked)} /> {field.label}</label>;
  }

  const inputType = ['email', 'number', 'date', 'time'].includes(field.type) ? field.type : field.type === 'tel' ? 'tel' : 'text';
  return <label>{label}<input name={field.name} type={inputType} placeholder={field.placeholder} required={field.required} value={value === undefined || value === null ? '' : String(value)} onChange={(e) => onChange(field.name, inputType === 'number' ? (e.target.value === '' ? '' : Number(e.target.value)) : e.target.value)} />{field.helpText && <small>{field.helpText}</small>}</label>;
}

export function CleverForm({
  form,
  action,
  onSuccess,
  onError,
}: {
  form: RendererForm;
  action?: string;
  onSuccess?: (result: unknown) => void;
  onError?: (error: Error) => void;
}) {
  const [pageIndex, setPageIndex] = React.useState(0);
  const [values, setValues] = React.useState<Record<string, unknown>>({});
  const [submitting, setSubmitting] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const currentPage = form.pages[pageIndex];

  const setValue = (name: string, value: unknown) => setValues((prev) => ({ ...prev, [name]: value }));

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (pageIndex < form.pages.length - 1) {
      setPageIndex((index) => index + 1);
      return;
    }

    setSubmitting(true);
    setMessage('');
    try {
      const raw = collectFormData(event.currentTarget);
      const data: Record<string, unknown> = {};
      for (const page of form.pages) {
        for (const field of page.fields) {
          if (['heading', 'paragraph'].includes(field.type)) continue;
          if (!evaluateConditionGroup(field.conditions, values)) continue;
          if (raw[field.name] !== undefined) data[field.name] = raw[field.name];
          else if (values[field.name] !== undefined) data[field.name] = values[field.name];
        }
      }

      const response = await fetch(action ?? `/api/clever-forms/forms/${form.slug}/submissions`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ data }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result?.error?.message ?? 'Form submission failed');
      setMessage(form.confirmation?.message || 'Thank you for your submission.');
      onSuccess?.(result);
    } catch (error) {
      const normalized = error instanceof Error ? error : new Error('Form submission failed');
      setMessage(normalized.message);
      onError?.(normalized);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit}>
      {form.name && <h1>{form.name}</h1>}
      {form.description && <p>{form.description}</p>}
      <fieldset>
        {currentPage?.title && <legend>{currentPage.title}</legend>}
        {currentPage?.description && <p>{currentPage.description}</p>}
        {currentPage?.fields.map((field) => {
          if (!evaluateConditionGroup(field.conditions, values)) return null;
          return <div key={field.name}><FieldControl field={field} value={values[field.name]} onChange={setValue} /></div>;
        })}
      </fieldset>

      <div>
        {pageIndex > 0 && <button type="button" onClick={() => setPageIndex((index) => index - 1)} disabled={submitting}>Back</button>}
        <button type="submit" disabled={submitting}>{pageIndex < form.pages.length - 1 ? 'Next' : submitting ? 'Submitting…' : 'Submit'}</button>
      </div>

      {message && <p role="status">{message}</p>}
    </form>
  );
}

export default CleverForm;
