export type ExportedCleverForm = {
  schemaVersion: 1;
  exportedAt: string;
  product: 'CleverForms';
  form: Record<string, unknown>;
};

const allowedTopLevel = [
  'name', 'slug', 'description', 'status', 'requiresAuthentication',
  'pages', 'confirmation', 'settings', 'version',
] as const;

export function exportForm(form: any): string {
  const clean: Record<string, unknown> = {};
  for (const key of allowedTopLevel) {
    if (form?.[key] !== undefined) clean[key] = form[key];
  }

  const payload: ExportedCleverForm = {
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    product: 'CleverForms',
    form: clean,
  };

  return JSON.stringify(payload, null, 2);
}

export function importForm(raw: string): any {
  const parsed = JSON.parse(raw) as ExportedCleverForm;
  if (parsed?.schemaVersion !== 1 || parsed?.product !== 'CleverForms' || !parsed?.form) {
    throw new Error('Unsupported CleverForms export file.');
  }

  const form = parsed.form as any;
  if (!Array.isArray(form.pages)) throw new Error('Imported form is missing pages.');

  return {
    ...form,
    documentId: undefined,
    status: 'draft',
    name: `${form.name || 'Imported Form'} Copy`,
    slug: `${form.slug || 'imported-form'}-copy`,
  };
}
