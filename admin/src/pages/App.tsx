import * as React from 'react';
import {
  Box,
  Button,
  Checkbox,
  Field,
  Flex,
  SingleSelect,
  SingleSelectOption,
  TextInput,
  Textarea,
  Typography,
} from '@strapi/design-system';
import { useFetchClient } from '@strapi/strapi/admin';
import { exportForm, importForm } from '../utils/form-transfer';

type Condition = {
  logic: 'and' | 'or';
  rules: Array<{ field: string; operator: string; value?: unknown }>;
};

type FieldDef = {
  id: string;
  type: string;
  name: string;
  label: string;
  placeholder?: string;
  helpText?: string;
  required?: boolean;
  options?: { label: string; value: string }[];
  conditions?: Condition | null;
};

type Page = { id: string; title: string; description?: string; fields: FieldDef[] };

type FormDoc = {
  documentId?: string;
  name: string;
  slug: string;
  description?: string;
  lifecycle?: 'active' | 'archived';
  publishedAt?: string | null;
  requiresAuthentication?: boolean;
  pages: Page[];
  confirmation?: { type?: string; message?: string } | null;
  settings?: Record<string, unknown> | null;
};

const fieldTypes = [
  ['text', 'Text'], ['textarea', 'Textarea'], ['email', 'Email'], ['number', 'Number'],
  ['tel', 'Telephone'], ['select', 'Select'], ['radio', 'Radio'], ['checkbox', 'Checkbox'],
  ['multiselect', 'Multi-select'], ['date', 'Date'], ['time', 'Time'], ['heading', 'Heading'],
  ['paragraph', 'Paragraph'], ['hidden', 'Hidden'],
] as const;

const uid = () => Math.random().toString(36).slice(2, 10);
const slugify = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const blankForm = (): FormDoc => ({
  name: 'Untitled Form',
  slug: 'untitled-form',
  lifecycle: 'active',
  pages: [{ id: uid(), title: 'Page 1', fields: [] }],
  confirmation: { type: 'message', message: 'Thank you for your submission.' },
  settings: {},
});

function Panel({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) {
  return <Box background="neutral0" borderColor="neutral200" borderWidth="1px" borderStyle="solid" hasRadius padding={5} {...props}>{children}</Box>;
}

function TextField({
  label, value, onChange, placeholder, hint,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  hint?: string;
}) {
  return (
    <Field.Root hint={hint}>
      <Field.Label>{label}</Field.Label>
      <TextInput value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />
      <Field.Hint />
    </Field.Root>
  );
}

function TextAreaField({
  label, value, onChange, hint,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
}) {
  return (
    <Field.Root hint={hint}>
      <Field.Label>{label}</Field.Label>
      <Textarea value={value} onChange={(event) => onChange(event.target.value)} />
      <Field.Hint />
    </Field.Root>
  );
}

function Preview({ form }: { form: FormDoc }) {
  return (
    <Panel>
      <Typography variant="alpha" tag="h2">{form.name}</Typography>
      {form.description && <Typography marginTop={2} textColor="neutral600">{form.description}</Typography>}
      <Flex direction="column" alignItems="stretch" gap={5} marginTop={5}>
        {form.pages.map((page) => (
          <Box key={page.id}>
            <Typography variant="beta" tag="h3">{page.title}</Typography>
            {page.description && <Typography marginTop={1} textColor="neutral600">{page.description}</Typography>}
            <Flex direction="column" alignItems="stretch" gap={3} marginTop={4}>
              {page.fields.map((field) => (
                <Box key={field.id}>
                  {field.type === 'heading' ? (
                    <Typography variant="delta" tag="h4">{field.label}</Typography>
                  ) : field.type === 'paragraph' ? (
                    <Typography>{field.label}</Typography>
                  ) : field.type === 'checkbox' ? (
                    <Checkbox disabled checked={false}>{field.label}</Checkbox>
                  ) : (
                    <Field.Root required={field.required} hint={field.helpText}>
                      <Field.Label>{field.label}</Field.Label>
                      {field.type === 'textarea' ? (
                        <Textarea disabled placeholder={field.placeholder} />
                      ) : ['select', 'multiselect', 'radio'].includes(field.type) ? (
                        <SingleSelect disabled placeholder="Select...">
                          {field.options?.map((option) => (
                            <SingleSelectOption key={option.value} value={option.value}>{option.label}</SingleSelectOption>
                          ))}
                        </SingleSelect>
                      ) : (
                        <TextInput disabled type={field.type === 'tel' ? 'tel' : field.type} placeholder={field.placeholder} />
                      )}
                      <Field.Hint />
                    </Field.Root>
                  )}
                </Box>
              ))}
            </Flex>
          </Box>
        ))}
      </Flex>
    </Panel>
  );
}

export function App() {
  const client = useFetchClient();
  const [view, setView] = React.useState<'forms'|'editor'|'submissions'|'settings'>('forms');
  const [forms, setForms] = React.useState<FormDoc[]>([]);
  const [submissions, setSubmissions] = React.useState<any[]>([]);
  const [submissionStatus, setSubmissionStatus] = React.useState('');
  const [selectedSubmission, setSelectedSubmission] = React.useState<any | null>(null);
  const [form, setForm] = React.useState<FormDoc>(blankForm());
  const [pageIndex, setPageIndex] = React.useState(0);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [preview, setPreview] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [message, setMessage] = React.useState('');

  const loadForms = React.useCallback(async () => {
    try {
      const res = await client.get<{ data: FormDoc[] }>('/clever-forms/forms');
      setForms(res.data?.data || []);
    } catch {
      setMessage('Unable to load forms.');
    }
  }, [client]);

  const loadSubmissions = React.useCallback(async () => {
    try {
      const query = submissionStatus ? `?status=${encodeURIComponent(submissionStatus)}` : '';
      const res = await client.get<{ data: any[] }>(`/clever-forms/submissions${query}`);
      setSubmissions(res.data?.data || []);
    } catch {
      setMessage('Unable to load submissions.');
    }
  }, [client, submissionStatus]);

  React.useEffect(() => { void loadForms(); }, [loadForms]);
  React.useEffect(() => { if (view === 'submissions') void loadSubmissions(); }, [view, loadSubmissions]);

  const currentPage = form.pages[pageIndex] || form.pages[0];
  const selected = currentPage?.fields.find((field) => field.id === selectedId) || null;

  const updateField = (patch: Partial<FieldDef>) => {
    setForm((prev) => ({
      ...prev,
      pages: prev.pages.map((page, index) => index === pageIndex
        ? { ...page, fields: page.fields.map((field) => field.id === selectedId ? { ...field, ...patch } : field) }
        : page),
    }));
  };

  const addField = (type: string, title: string) => {
    const id = uid();
    const field: FieldDef = {
      id,
      type,
      name: `${type}_${id.slice(0, 4)}`,
      label: title,
      required: false,
      conditions: null,
    };
    if (['select', 'radio', 'multiselect'].includes(type)) {
      field.options = [{ label: 'Option 1', value: 'option-1' }];
    }
    setForm((prev) => ({
      ...prev,
      pages: prev.pages.map((page, index) => index === pageIndex ? { ...page, fields: [...page.fields, field] } : page),
    }));
    setSelectedId(id);
  };

  const moveField = (index: number, direction: number) => {
    const next = index + direction;
    if (next < 0 || next >= currentPage.fields.length) return;
    setForm((prev) => ({
      ...prev,
      pages: prev.pages.map((page, pageIdx) => {
        if (pageIdx !== pageIndex) return page;
        const fields = [...page.fields];
        [fields[index], fields[next]] = [fields[next], fields[index]];
        return { ...page, fields };
      }),
    }));
  };

  const removeField = (id: string) => {
    setForm((prev) => ({
      ...prev,
      pages: prev.pages.map((page, index) => index === pageIndex
        ? { ...page, fields: page.fields.filter((field) => field.id !== id) }
        : page),
    }));
    setSelectedId(null);
  };

  const addPage = () => {
    const page = { id: uid(), title: `Page ${form.pages.length + 1}`, fields: [] };
    setForm((prev) => ({ ...prev, pages: [...prev.pages, page] }));
    setPageIndex(form.pages.length);
    setSelectedId(null);
  };

  const duplicatePage = () => {
    const source = currentPage;
    const copy: Page = {
      ...source,
      id: uid(),
      title: `${source.title} Copy`,
      fields: source.fields.map((field) => ({ ...field, id: uid(), name: `${field.name}_copy` })),
    };
    setForm((prev) => ({
      ...prev,
      pages: [...prev.pages.slice(0, pageIndex + 1), copy, ...prev.pages.slice(pageIndex + 1)],
    }));
    setPageIndex(pageIndex + 1);
    setSelectedId(null);
  };

  const removePage = () => {
    if (form.pages.length <= 1) {
      setMessage('A form must have at least one page.');
      return;
    }
    setForm((prev) => ({ ...prev, pages: prev.pages.filter((_, index) => index !== pageIndex) }));
    setPageIndex(Math.max(0, pageIndex - 1));
    setSelectedId(null);
  };

  const movePage = (direction: number) => {
    const next = pageIndex + direction;
    if (next < 0 || next >= form.pages.length) return;
    setForm((prev) => {
      const pages = [...prev.pages];
      [pages[pageIndex], pages[next]] = [pages[next], pages[pageIndex]];
      return { ...prev, pages };
    });
    setPageIndex(next);
    setSelectedId(null);
  };

  const allFields = form.pages
    .flatMap((page) => page.fields)
    .filter((field) => !['heading', 'paragraph', 'hidden'].includes(field.type) && field.id !== selectedId);

  const setCondition = (patch: Partial<{ field: string; operator: string; value: unknown }>) => {
    if (!selected) return;
    const existing = selected.conditions?.rules?.[0] || {
      field: allFields[0]?.name || '',
      operator: 'eq',
      value: '',
    };
    updateField({ conditions: { logic: 'and', rules: [{ ...existing, ...patch }] } });
  };

  const save = async (publish = false) => {
    setBusy(true);
    setMessage('');
    try {
      const saved = form.documentId
        ? await client.put(`/clever-forms/forms/${form.documentId}`, { data: form })
        : await client.post('/clever-forms/forms', { data: form });
      const savedData = (saved as { data?: any }).data;\n      const doc: any = savedData?.data || savedData;
      const documentId = doc.documentId || form.documentId;
      setForm((prev) => ({ ...prev, ...doc, documentId }));
      if (publish && documentId) {
        await client.post(`/clever-forms/forms/${documentId}/publish`);
        setForm((prev) => ({ ...prev, publishedAt: new Date().toISOString() }));
      }
      setMessage(publish ? 'Form published.' : 'Draft saved.');
      await loadForms();
    } catch (error: any) {
      setMessage(error?.message || 'Save failed.');
    } finally {
      setBusy(false);
    }
  };

  const edit = (doc: FormDoc) => {
    setForm(doc);
    setPageIndex(0);
    setSelectedId(null);
    setView('editor');
  };

  const create = () => {
    setForm(blankForm());
    setPageIndex(0);
    setSelectedId(null);
    setView('editor');
  };

  const duplicateForm = async (doc: FormDoc) => {
    if (!doc.documentId) return;
    setBusy(true);
    try {
      await client.post(`/clever-forms/forms/${doc.documentId}/duplicate`);
      setMessage('Form duplicated.');
      await loadForms();
    } catch (error: any) {
      setMessage(error?.message || 'Unable to duplicate form.');
    } finally {
      setBusy(false);
    }
  };

  const toggleArchive = async (doc: FormDoc) => {
    if (!doc.documentId) return;
    const lifecycle = doc.lifecycle === 'archived' ? 'active' : 'archived';
    setBusy(true);
    try {
      await client.put(`/clever-forms/forms/${doc.documentId}/lifecycle`, { data: { lifecycle } });
      setMessage(lifecycle === 'archived' ? 'Form archived.' : 'Form restored.');
      await loadForms();
    } catch (error: any) {
      setMessage(error?.message || 'Unable to update form.');
    } finally {
      setBusy(false);
    }
  };

  const downloadExport = () => {
    const blob = new Blob([exportForm(form)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${form.slug || 'clever-form'}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const uploadImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const imported = importForm(await file.text());
      setForm(imported);
      setPageIndex(0);
      setSelectedId(null);
      setView('editor');
      setMessage('Form imported as a new draft.');
    } catch (error: any) {
      setMessage(error?.message || 'Unable to import form.');
    }
    event.target.value = '';
  };

  const updateSubmissionStatus = async (documentId: string, status: string) => {
    setBusy(true);
    try {
      await client.put(`/clever-forms/submissions/${documentId}/status`, { data: { status } });
      setMessage('Submission status updated.');
      if (selectedSubmission?.documentId === documentId) {
        setSelectedSubmission((prev: any) => ({ ...prev, status }));
      }
      await loadSubmissions();
    } catch (error: any) {
      setMessage(error?.message || 'Unable to update submission.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Box padding={7} background="neutral100" minHeight="100vh">
      <Box maxWidth="1500px" marginLeft="auto" marginRight="auto">
        <Flex justifyContent="space-between" alignItems="center" gap={4} marginBottom={6}>
          <Box>
            <Typography variant="alpha" tag="h1">CleverForms</Typography>
            <Typography textColor="neutral600" marginTop={1}>Forms and workflow foundation by CleverForge</Typography>
          </Box>
          <Flex gap={2} wrap="wrap">
            <Button variant={view === 'forms' ? 'default' : 'secondary'} onClick={() => setView('forms')}>Forms</Button>
            <Button variant={view === 'submissions' ? 'default' : 'secondary'} onClick={() => setView('submissions')}>Submissions</Button>
            <Button variant={view === 'settings' ? 'default' : 'secondary'} onClick={() => setView('settings')}>Settings</Button>
            {view === 'forms' && <Button onClick={create}>Create form</Button>}
          </Flex>
        </Flex>

        {message && (
          <Box background="primary100" borderColor="primary200" borderWidth="1px" borderStyle="solid" hasRadius padding={3} marginBottom={4}>
            <Typography>{message}</Typography>
          </Box>
        )}

        {view === 'forms' && (
          <Panel>
            <Typography variant="beta" tag="h2">Forms</Typography>
            <Flex direction="column" alignItems="stretch" gap={3} marginTop={4}>
              {forms.length === 0 ? (
                <Typography textColor="neutral600">No forms yet. Create your first form.</Typography>
              ) : forms.map((item) => (
                <Box key={item.documentId} padding={4} borderColor="neutral200" borderWidth="1px" borderStyle="solid" hasRadius>
                  <Flex justifyContent="space-between" alignItems="center" gap={4}>
                    <Box>
                      <Typography fontWeight="bold">{item.name}</Typography>
                      <Typography variant="pi" textColor="neutral600">/{item.slug}</Typography>
                    </Box>
                    <Flex gap={4} alignItems="center">
                      <Typography variant="pi">{item.pages?.length || 0} page(s)</Typography>
                      <Typography variant="pi">{item.lifecycle === 'archived' ? 'Archived' : item.publishedAt ? 'Published' : 'Draft'}</Typography>
                      <Flex gap={2}>
                        <Button variant="secondary" size="S" onClick={() => edit(item)}>Edit</Button>
                        <Button variant="secondary" size="S" disabled={busy} onClick={() => void duplicateForm(item)}>Duplicate</Button>
                        <Button variant="secondary" size="S" disabled={busy} onClick={() => void toggleArchive(item)}>
                          {item.lifecycle === 'archived' ? 'Restore' : 'Archive'}
                        </Button>
                      </Flex>
                    </Flex>
                  </Flex>
                </Box>
              ))}
            </Flex>
          </Panel>
        )}

        {view === 'editor' && (
          <Flex direction="column" alignItems="stretch" gap={4}>
            <Panel>
              <Flex gap={4} alignItems="end" wrap="wrap">
                <Box flex="1 1 320px">
                  <TextField
                    label="Form name"
                    value={form.name}
                    onChange={(value) => setForm({ ...form, name: value, slug: form.documentId ? form.slug : slugify(value) })}
                  />
                </Box>
                <Box flex="1 1 280px">
                  <TextField label="Slug" value={form.slug} onChange={(value) => setForm({ ...form, slug: slugify(value) })} />
                </Box>
                <Button variant="secondary" onClick={() => setPreview((value) => !value)}>{preview ? 'Builder' : 'Preview'}</Button>
                <Button variant="secondary" onClick={downloadExport}>Export</Button>
                <Box>
                  <Button variant="secondary" onClick={() => document.getElementById('cleverforms-import')?.click()}>Import</Button>
                  <input id="cleverforms-import" type="file" accept="application/json,.json" onChange={uploadImport} style={{ display: 'none' }} />
                </Box>
                <Button variant="secondary" loading={busy} onClick={() => void save(false)}>Save draft</Button>
                <Button loading={busy} onClick={() => void save(true)}>Publish</Button>
              </Flex>
            </Panel>

            {preview ? <Preview form={form} /> : (
              <Flex gap={4} alignItems="flex-start">
                <Box width="240px" flexShrink={0}>
                  <Panel>
                    <Typography variant="delta" tag="h3">Fields</Typography>
                    <Flex direction="column" alignItems="stretch" gap={2} marginTop={3}>
                      {fieldTypes.map(([type, title]) => (
                        <Button key={type} variant="secondary" fullWidth onClick={() => addField(type, title)}>+ {title}</Button>
                      ))}
                    </Flex>
                  </Panel>
                </Box>

                <Box flex="1 1 auto" minWidth="0">
                  <Panel>
                    <Flex gap={2} wrap="wrap" marginBottom={4}>
                      {form.pages.map((page, index) => (
                        <Button
                          key={page.id}
                          variant={index === pageIndex ? 'default' : 'secondary'}
                          size="S"
                          onClick={() => { setPageIndex(index); setSelectedId(null); }}
                        >
                          {page.title}
                        </Button>
                      ))}
                      <Button variant="secondary" size="S" onClick={addPage}>+ Page</Button>
                    </Flex>

                    <Flex gap={2} wrap="wrap" marginBottom={4}>
                      <Button variant="secondary" size="S" onClick={() => movePage(-1)}>Move left</Button>
                      <Button variant="secondary" size="S" onClick={() => movePage(1)}>Move right</Button>
                      <Button variant="secondary" size="S" onClick={duplicatePage}>Duplicate page</Button>
                      <Button variant="secondary" size="S" onClick={removePage}>Remove page</Button>
                    </Flex>

                    <Flex direction="column" alignItems="stretch" gap={4}>
                      <TextField
                        label="Page title"
                        value={currentPage.title}
                        onChange={(value) => setForm((prev) => ({
                          ...prev,
                          pages: prev.pages.map((page, index) => index === pageIndex ? { ...page, title: value } : page),
                        }))}
                      />
                      <TextAreaField
                        label="Page description"
                        value={currentPage.description || ''}
                        onChange={(value) => setForm((prev) => ({
                          ...prev,
                          pages: prev.pages.map((page, index) => index === pageIndex ? { ...page, description: value } : page),
                        }))}
                      />

                      {currentPage.fields.length === 0 && (
                        <Box padding={6} background="neutral100" hasRadius>
                          <Typography textColor="neutral600" textAlign="center">Choose a field from the left to start building.</Typography>
                        </Box>
                      )}

                      {currentPage.fields.map((field, index) => (
                        <Box
                          key={field.id}
                          padding={4}
                          borderColor={selectedId === field.id ? 'primary600' : 'neutral200'}
                          borderWidth="1px"
                          borderStyle="solid"
                          hasRadius
                          background="neutral0"
                          onClick={() => setSelectedId(field.id)}
                        >
                          <Flex justifyContent="space-between" gap={3} alignItems="center">
                            <Box>
                              <Typography fontWeight="bold">{field.label}</Typography>
                              <Typography variant="pi" textColor="neutral600">{field.type} · {field.name}</Typography>
                            </Box>
                            <Flex gap={2}>
                              <Button variant="secondary" size="S" onClick={(event) => { event.stopPropagation(); moveField(index, -1); }}>Up</Button>
                              <Button variant="secondary" size="S" onClick={(event) => { event.stopPropagation(); moveField(index, 1); }}>Down</Button>
                            </Flex>
                          </Flex>
                        </Box>
                      ))}
                    </Flex>
                  </Panel>
                </Box>

                <Box width="320px" flexShrink={0}>
                  <Panel>
                    <Typography variant="delta" tag="h3">Properties</Typography>
                    {!selected ? (
                      <Typography marginTop={3} textColor="neutral600">Select a field to edit it.</Typography>
                    ) : (
                      <Flex direction="column" alignItems="stretch" gap={4} marginTop={4}>
                        <TextField label="Label" value={selected.label} onChange={(value) => updateField({ label: value })} />
                        <TextField label="Field name" value={selected.name} onChange={(value) => updateField({ name: slugify(value).replace(/-/g, '_') })} />

                        {!['heading', 'paragraph'].includes(selected.type) && (
                          <>
                            <TextField label="Placeholder" value={selected.placeholder || ''} onChange={(value) => updateField({ placeholder: value })} />
                            <TextField label="Help text" value={selected.helpText || ''} onChange={(value) => updateField({ helpText: value })} />
                            <Checkbox checked={!!selected.required} onCheckedChange={(checked) => updateField({ required: checked === true })}>Required</Checkbox>
                          </>
                        )}

                        {selected.options && (
                          <TextAreaField
                            label="Options"
                            hint="One option per line"
                            value={selected.options.map((option) => option.label).join('\n')}
                            onChange={(value) => updateField({
                              options: value.split('\n').filter(Boolean).map((entry) => ({ label: entry, value: slugify(entry) })),
                            })}
                          />
                        )}

                        <Box paddingTop={3} borderColor="neutral200" borderWidth="1px 0 0 0" borderStyle="solid">
                          <Typography fontWeight="bold">Conditional logic</Typography>
                          <Box marginTop={3}>
                            <Checkbox
                              checked={!!selected.conditions}
                              onCheckedChange={(checked) => updateField({
                                conditions: checked === true
                                  ? { logic: 'and', rules: [{ field: allFields[0]?.name || '', operator: 'eq', value: '' }] }
                                  : null,
                              })}
                            >
                              Show this field conditionally
                            </Checkbox>
                          </Box>

                          {selected.conditions && (
                            <Flex direction="column" alignItems="stretch" gap={3} marginTop={4}>
                              <Field.Root>
                                <Field.Label>When field</Field.Label>
                                <SingleSelect value={String(selected.conditions.rules[0]?.field || '')} onChange={(value) => setCondition({ field: String(value) })} placeholder="Select field...">
                                  {allFields.map((field) => <SingleSelectOption key={field.id} value={field.name}>{field.label} ({field.name})</SingleSelectOption>)}
                                </SingleSelect>
                              </Field.Root>

                              <Field.Root>
                                <Field.Label>Operator</Field.Label>
                                <SingleSelect value={String(selected.conditions.rules[0]?.operator || 'eq')} onChange={(value) => setCondition({ operator: String(value) })}>
                                  <SingleSelectOption value="eq">Equals</SingleSelectOption>
                                  <SingleSelectOption value="neq">Does not equal</SingleSelectOption>
                                  <SingleSelectOption value="contains">Contains</SingleSelectOption>
                                  <SingleSelectOption value="isEmpty">Is empty</SingleSelectOption>
                                  <SingleSelectOption value="isNotEmpty">Is not empty</SingleSelectOption>
                                </SingleSelect>
                              </Field.Root>

                              {!['isEmpty', 'isNotEmpty'].includes(String(selected.conditions.rules[0]?.operator)) && (
                                <TextField
                                  label="Value"
                                  value={String(selected.conditions.rules[0]?.value ?? '')}
                                  onChange={(value) => setCondition({ value })}
                                />
                              )}
                            </Flex>
                          )}
                        </Box>

                        <Button variant="secondary" fullWidth onClick={() => removeField(selected.id)}>Remove field</Button>
                      </Flex>
                    )}
                  </Panel>
                </Box>
              </Flex>
            )}
          </Flex>
        )}

        {view === 'submissions' && (
          <Flex gap={4} alignItems="flex-start">
            <Box flex="1 1 auto">
              <Panel>
                <Flex justifyContent="space-between" alignItems="flex-end" gap={4}>
                  <Box>
                    <Typography variant="beta" tag="h2">Submissions</Typography>
                    <Typography textColor="neutral600" marginTop={1}>Review submitted form data and workflow status.</Typography>
                  </Box>
                  <Field.Root>
                    <Field.Label>Status</Field.Label>
                    <SingleSelect value={submissionStatus} onChange={(value) => setSubmissionStatus(String(value))} onClear={() => setSubmissionStatus('')} placeholder="All statuses">
                      <SingleSelectOption value="received">Received</SingleSelectOption>
                      <SingleSelectOption value="processing">Processing</SingleSelectOption>
                      <SingleSelectOption value="completed">Completed</SingleSelectOption>
                      <SingleSelectOption value="rejected">Rejected</SingleSelectOption>
                    </SingleSelect>
                  </Field.Root>
                </Flex>

                <Flex direction="column" alignItems="stretch" gap={3} marginTop={5}>
                  {submissions.length === 0 ? (
                    <Typography textColor="neutral600">No submissions found.</Typography>
                  ) : submissions.map((submission: any) => (
                    <Button key={submission.documentId} variant="secondary" fullWidth onClick={() => setSelectedSubmission(submission)}>
                      {submission.form?.name || 'Form submission'} · {submission.status || 'received'} · {new Date(submission.submittedAt || submission.createdAt).toLocaleString()}
                    </Button>
                  ))}
                </Flex>
              </Panel>
            </Box>

            {selectedSubmission && (
              <Box width="420px" flexShrink={0}>
                <Panel>
                  <Flex justifyContent="space-between" alignItems="center" gap={3}>
                    <Typography variant="delta" tag="h3">Submission</Typography>
                    <Button variant="secondary" size="S" onClick={() => setSelectedSubmission(null)}>Close</Button>
                  </Flex>

                  <Typography fontWeight="bold" marginTop={4}>{selectedSubmission.form?.name || 'Form'}</Typography>
                  <Typography variant="pi" textColor="neutral600">{selectedSubmission.documentId}</Typography>

                  <Box marginTop={4}>
                    <Field.Root>
                      <Field.Label>Workflow status</Field.Label>
                      <SingleSelect
                        value={selectedSubmission.status || 'received'}
                        disabled={busy}
                        onChange={(value) => void updateSubmissionStatus(selectedSubmission.documentId, String(value))}
                      >
                        <SingleSelectOption value="received">Received</SingleSelectOption>
                        <SingleSelectOption value="processing">Processing</SingleSelectOption>
                        <SingleSelectOption value="completed">Completed</SingleSelectOption>
                        <SingleSelectOption value="rejected">Rejected</SingleSelectOption>
                      </SingleSelect>
                    </Field.Root>
                  </Box>

                  <Typography fontWeight="bold" marginTop={5}>Submitted data</Typography>
                  <Flex direction="column" alignItems="stretch" gap={2} marginTop={3}>
                    {Object.entries(selectedSubmission.data || {}).map(([key, value]) => (
                      <Box key={key} paddingBottom={2} borderColor="neutral200" borderWidth="0 0 1px 0" borderStyle="solid">
                        <Typography variant="pi" fontWeight="bold">{key}</Typography>
                        <Typography>{Array.isArray(value) ? value.join(', ') : typeof value === 'object' ? JSON.stringify(value) : String(value ?? '')}</Typography>
                      </Box>
                    ))}
                  </Flex>
                </Panel>
              </Box>
            )}
          </Flex>
        )}

        {view === 'settings' && (
          <Panel>
            <Typography variant="beta" tag="h2">Settings</Typography>
            <Typography textColor="neutral600" marginTop={2}>
              CleverForms Core settings are provider-neutral. Extension APIs are reserved for compatible integrations and future Strapi capabilities.
            </Typography>
            <Box marginTop={5} maxWidth="640px">
              <TextField
                label="Default confirmation message"
                value={form.confirmation?.message || ''}
                onChange={(value) => setForm({ ...form, confirmation: { ...form.confirmation, message: value } })}
              />
            </Box>
          </Panel>
        )}
      </Box>
    </Box>
  );
}

export default App;
