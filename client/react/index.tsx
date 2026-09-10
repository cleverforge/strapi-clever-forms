import * as React from 'react';

export type RendererField = {
  name: string;
  type: string;
  label?: string;
  required?: boolean;
  options?: Array<{ label: string; value: string }>;
};

export type RendererForm = {
  slug: string;
  pages: Array<{ title?: string; fields: RendererField[] }>;
};

export function CleverForm({ form, action, onSuccess }: { form: RendererForm; action?: string; onSuccess?: (result: unknown) => void }) {
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget).entries());
    const response = await fetch(action ?? `/api/clever-forms/forms/${form.slug}/submissions`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ data }),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result?.error?.message ?? 'Form submission failed');
    onSuccess?.(result);
  }

  return (
    <form onSubmit={submit}>
      {form.pages.map((page, pageIndex) => (
        <fieldset key={pageIndex}>
          {page.title && <legend>{page.title}</legend>}
          {page.fields.map((field) => {
            if (field.type === 'heading') return <h2 key={field.name}>{field.label}</h2>;
            if (field.type === 'paragraph') return <p key={field.name}>{field.label}</p>;
            if (field.type === 'textarea') return <label key={field.name}>{field.label}<textarea name={field.name} required={field.required} /></label>;
            if (field.type === 'select') return <label key={field.name}>{field.label}<select name={field.name} required={field.required}>{field.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select></label>;
            const inputType = ['email', 'number', 'date', 'time', 'hidden'].includes(field.type) ? field.type : field.type === 'tel' ? 'tel' : 'text';
            return <label key={field.name}>{field.type !== 'hidden' && field.label}<input name={field.name} type={inputType} required={field.required} /></label>;
          })}
        </fieldset>
      ))}
      <button type="submit">Submit</button>
    </form>
  );
}

export default CleverForm;
