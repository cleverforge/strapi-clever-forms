import * as React from 'react';
import { useFetchClient } from '@strapi/strapi/admin';
import { exportForm, importForm } from '../utils/form-transfer';

type Field = {
  id: string;
  type: string;
  name: string;
  label: string;
  placeholder?: string;
  helpText?: string;
  required?: boolean;
  options?: { label: string; value: string }[];
  conditions?: { logic: 'and' | 'or'; rules: Array<{ field: string; operator: string; value?: unknown }> } | null;
};

type Page = { id: string; title: string; description?: string; fields: Field[] };
type FormDoc = {
  documentId?: string;
  name: string;
  slug: string;
  description?: string;
  lifecycle?: 'active' | 'archived';
  publishedAt?: string | null;
  requiresAuthentication?: boolean;
  pages: Page[];
  confirmation?: any;
  settings?: any;
};

const fieldTypes = [
  ['text', 'Text'], ['textarea', 'Textarea'], ['email', 'Email'], ['number', 'Number'],
  ['tel', 'Telephone'], ['select', 'Select'], ['radio', 'Radio'], ['checkbox', 'Checkbox'],
  ['multiselect', 'Multi-select'], ['date', 'Date'], ['time', 'Time'], ['heading', 'Heading'],
  ['paragraph', 'Paragraph'], ['hidden', 'Hidden'],
];

const uid = () => Math.random().toString(36).slice(2, 10);
const slugify = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const blankForm = (): FormDoc => ({
  name: 'Untitled Form', slug: 'untitled-form', lifecycle: 'active',
  pages: [{ id: uid(), title: 'Page 1', fields: [] }],
  confirmation: { type: 'message', message: 'Thank you for your submission.' },
  settings: {},
});

const css: Record<string, React.CSSProperties> = {
  shell: { padding: 28, maxWidth: 1500, margin: '0 auto', fontFamily: 'Inter, system-ui, sans-serif' },
  top: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginBottom: 24 },
  tabs: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  button: { padding: '9px 14px', borderRadius: 6, border: '1px solid #dcdce4', background: '#fff', cursor: 'pointer', fontWeight: 600 },
  primary: { padding: '9px 14px', borderRadius: 6, border: 0, background: '#4945ff', color: '#fff', cursor: 'pointer', fontWeight: 700 },
  card: { border: '1px solid #eaeaef', borderRadius: 8, background: '#fff', padding: 18 },
  grid: { display: 'grid', gridTemplateColumns: '240px minmax(420px,1fr) 310px', gap: 16, alignItems: 'start' },
  input: { width: '100%', boxSizing: 'border-box', padding: 9, border: '1px solid #dcdce4', borderRadius: 5, marginTop: 5 },
  label: { display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 12 },
  fieldCard: { border: '1px solid #dcdce4', borderRadius: 6, padding: 12, marginBottom: 8, cursor: 'pointer', background: '#fff' },
  palette: { width: '100%', textAlign: 'left', padding: 9, marginBottom: 6, borderRadius: 5, border: '1px solid #eaeaef', background: '#f6f6f9', cursor: 'pointer' },
};

function Preview({ form }: { form: FormDoc }) {
  return <div style={{ ...css.card, background: '#f6f6f9' }}>
    <h2 style={{ marginTop: 0 }}>{form.name}</h2>
    {form.description && <p>{form.description}</p>}
    {form.pages.map((page) => <section key={page.id} style={{ marginBottom: 24 }}>
      <h3>{page.title}</h3>
      {page.fields.map((field) => <div key={field.id} style={{ marginBottom: 14 }}>
        {field.type === 'heading' ? <h4>{field.label}</h4> : field.type === 'paragraph' ? <p>{field.label}</p> : <>
          <label style={{ fontWeight: 650 }}>{field.label}{field.required ? ' *' : ''}</label>
          {field.type === 'textarea' ? <textarea style={css.input} placeholder={field.placeholder} disabled /> :
           ['select','multiselect'].includes(field.type) ? <select style={css.input} disabled><option>Select…</option>{field.options?.map(o => <option key={o.value}>{o.label}</option>)}</select> :
           field.type === 'radio' ? <div>{field.options?.map(o => <label key={o.value} style={{ display: 'block' }}><input type="radio" disabled /> {o.label}</label>)}</div> :
           field.type === 'checkbox' ? <div><input type="checkbox" disabled /> {field.helpText || field.label}</div> :
           <input style={css.input} type={field.type === 'tel' ? 'tel' : field.type} placeholder={field.placeholder} disabled />}
          {field.helpText && field.type !== 'checkbox' && <small>{field.helpText}</small>}
        </>}
      </div>)}
    </section>)}
  </div>;
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
  }, [client, submissionStatus]);

  const loadSubmissions = React.useCallback(async () => {
    try {
      const query = submissionStatus ? `?status=${encodeURIComponent(submissionStatus)}` : '';
      const res = await client.get<{ data: any[] }>(`/clever-forms/submissions${query}`);
      setSubmissions(res.data?.data || []);
    } catch {
      setMessage('Unable to load submissions.');
    }
  }, [client]);

  React.useEffect(() => { loadForms(); }, [loadForms]);
  React.useEffect(() => { if (view === 'submissions') loadSubmissions(); }, [view, loadSubmissions]);

  const currentPage = form.pages[pageIndex] || form.pages[0];
  const selected = currentPage?.fields.find(f => f.id === selectedId) || null;

  const updateField = (patch: Partial<Field>) => setForm(prev => ({ ...prev, pages: prev.pages.map((p, i) => i === pageIndex ? { ...p, fields: p.fields.map(f => f.id === selectedId ? { ...f, ...patch } : f) } : p) }));
  const addField = (type: string, title: string) => {
    const id = uid();
    const field: Field = { id, type, name: `${type}_${id.slice(0,4)}`, label: title, required: false, conditions: null };
    if (['select','radio','multiselect'].includes(type)) field.options = [{ label: 'Option 1', value: 'option-1' }];
    setForm(prev => ({ ...prev, pages: prev.pages.map((p, i) => i === pageIndex ? { ...p, fields: [...p.fields, field] } : p) }));
    setSelectedId(id);
  };
  const moveField = (index: number, direction: number) => {
    const next = index + direction; if (next < 0 || next >= currentPage.fields.length) return;
    setForm(prev => ({ ...prev, pages: prev.pages.map((p, i) => { if (i !== pageIndex) return p; const fields = [...p.fields]; [fields[index], fields[next]] = [fields[next], fields[index]]; return { ...p, fields }; }) }));
  };
  const removeField = (id: string) => { setForm(prev => ({ ...prev, pages: prev.pages.map((p, i) => i === pageIndex ? { ...p, fields: p.fields.filter(f => f.id !== id) } : p) })); setSelectedId(null); };
  const addPage = () => { const p = { id: uid(), title: `Page ${form.pages.length + 1}`, fields: [] }; setForm(prev => ({ ...prev, pages: [...prev.pages, p] })); setPageIndex(form.pages.length); setSelectedId(null); };
  const duplicatePage = () => {
    const source = currentPage;
    const copy: Page = { ...source, id: uid(), title: `${source.title} Copy`, fields: source.fields.map(field => ({ ...field, id: uid(), name: `${field.name}_copy` })) };
    setForm(prev => ({ ...prev, pages: [...prev.pages.slice(0, pageIndex + 1), copy, ...prev.pages.slice(pageIndex + 1)] }));
    setPageIndex(pageIndex + 1); setSelectedId(null);
  };
  const removePage = () => {
    if (form.pages.length <= 1) { setMessage('A form must have at least one page.'); return; }
    setForm(prev => ({ ...prev, pages: prev.pages.filter((_, i) => i !== pageIndex) }));
    setPageIndex(Math.max(0, pageIndex - 1)); setSelectedId(null);
  };
  const movePage = (direction: number) => {
    const next = pageIndex + direction; if (next < 0 || next >= form.pages.length) return;
    setForm(prev => { const pages = [...prev.pages]; [pages[pageIndex], pages[next]] = [pages[next], pages[pageIndex]]; return { ...prev, pages }; });
    setPageIndex(next); setSelectedId(null);
  };
  const allFields = form.pages.flatMap(p => p.fields).filter(f => !['heading','paragraph','hidden'].includes(f.type) && f.id !== selectedId);
  const setCondition = (patch: Partial<{ field: string; operator: string; value: unknown }>) => {
    if (!selected) return;
    const existing = selected.conditions?.rules?.[0] || { field: allFields[0]?.name || '', operator: 'eq', value: '' };
    updateField({ conditions: { logic: 'and', rules: [{ ...existing, ...patch }] } });
  };

  const save = async (publish = false) => {
    setBusy(true); setMessage('');
    try {
      let saved: any;
      if (form.documentId) saved = await client.put(`/clever-forms/forms/${form.documentId}`, { data: form });
      else saved = await client.post('/clever-forms/forms', { data: form });
      const doc = saved.data?.data || saved.data;
      const documentId = doc.documentId || form.documentId;
      setForm(prev => ({ ...prev, ...doc, documentId }));
      if (publish && documentId) { await client.post(`/clever-forms/forms/${documentId}/publish`); setForm(prev => ({ ...prev, publishedAt: new Date().toISOString() })); }
      setMessage(publish ? 'Form published.' : 'Draft saved.');
      await loadForms();
    } catch (e: any) { setMessage(e?.message || 'Save failed.'); }
    finally { setBusy(false); }
  };

  const edit = async (doc: FormDoc) => { setForm(doc); setPageIndex(0); setSelectedId(null); setView('editor'); };
  const create = () => { setForm(blankForm()); setPageIndex(0); setSelectedId(null); setView('editor'); };
  const duplicateForm = async (doc: FormDoc) => {
    if (!doc.documentId) return;
    setBusy(true);
    try { await client.post(`/clever-forms/forms/${doc.documentId}/duplicate`); setMessage('Form duplicated.'); await loadForms(); }
    catch (e: any) { setMessage(e?.message || 'Unable to duplicate form.'); } finally { setBusy(false); }
  };
  const toggleArchive = async (doc: FormDoc) => {
    if (!doc.documentId) return;
    const lifecycle = doc.lifecycle === 'archived' ? 'active' : 'archived';
    setBusy(true);
    try { await client.put(`/clever-forms/forms/${doc.documentId}/lifecycle`, { data: { lifecycle } }); setMessage(lifecycle === 'archived' ? 'Form archived.' : 'Form restored.'); await loadForms(); }
    catch (e: any) { setMessage(e?.message || 'Unable to update form.'); } finally { setBusy(false); }
  };
  const downloadExport = () => {
    const blob = new Blob([exportForm(form)], { type: 'application/json' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a');
    a.href = url; a.download = `${form.slug || 'clever-form'}.json`; a.click(); URL.revokeObjectURL(url);
  };
  const uploadImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; if (!file) return;
    try { const imported = importForm(await file.text()); setForm(imported); setPageIndex(0); setSelectedId(null); setView('editor'); setMessage('Form imported as a new draft.'); }
    catch (e: any) { setMessage(e?.message || 'Unable to import form.'); }
    event.target.value = '';
  };

  const updateSubmissionStatus = async (documentId: string, status: string) => {
    setBusy(true);
    try {
      await client.put(`/clever-forms/submissions/${documentId}/status`, { data: { status } });
      setMessage('Submission status updated.');
      if (selectedSubmission?.documentId === documentId) setSelectedSubmission((prev: any) => ({ ...prev, status }));
      await loadSubmissions();
    } catch (e: any) { setMessage(e?.message || 'Unable to update submission.'); }
    finally { setBusy(false); }
  };

  return <main style={css.shell}>
    <div style={css.top}>
      <div><h1 style={{ margin: 0 }}>CleverForms</h1><p style={{ margin: '4px 0 0', color: '#666687' }}>Forms and workflow foundation by CleverForge</p></div>
      <div style={css.tabs}>
        <button style={css.button} onClick={() => setView('forms')}>Forms</button>
        <button style={css.button} onClick={() => setView('submissions')}>Submissions</button>
        <button style={css.button} onClick={() => setView('settings')}>Settings</button>
        {view === 'forms' && <button style={css.primary} onClick={create}>Create form</button>}
      </div>
    </div>
    {message && <div style={{ ...css.card, marginBottom: 16, padding: 12 }}>{message}</div>}

    {view === 'forms' && <div style={css.card}>
      <h2 style={{ marginTop: 0 }}>Forms</h2>
      {forms.length === 0 ? <p>No forms yet. Create your first form.</p> : forms.map((f: any) => <div key={f.documentId} style={{ display: 'grid', gridTemplateColumns: '1fr 120px 120px 280px', gap: 12, padding: '12px 0', borderBottom: '1px solid #eee' }}>
        <div><strong>{f.name}</strong><div style={{ color: '#666687', fontSize: 13 }}>/{f.slug}</div></div>
        <span>{f.pages?.length || 0} page(s)</span><span>{f.lifecycle === 'archived' ? 'archived' : f.publishedAt ? 'published' : 'draft'}</span><div style={{display:'flex',gap:6}}><button style={css.button} onClick={() => edit(f)}>Edit</button><button style={css.button} disabled={busy} onClick={() => duplicateForm(f)}>Duplicate</button><button style={css.button} disabled={busy} onClick={() => toggleArchive(f)}>{f.lifecycle === 'archived' ? 'Restore' : 'Archive'}</button></div>
      </div>)}
    </div>}

    {view === 'editor' && <>
      <div style={{ ...css.card, marginBottom: 16, display: 'grid', gridTemplateColumns: '1fr 1fr auto auto auto auto auto', gap: 12, alignItems: 'end' }}>
        <label style={css.label}>Form name<input style={css.input} value={form.name} onChange={e => setForm({ ...form, name: e.target.value, slug: form.documentId ? form.slug : slugify(e.target.value) })} /></label>
        <label style={css.label}>Slug<input style={css.input} value={form.slug} onChange={e => setForm({ ...form, slug: slugify(e.target.value) })} /></label>
        <button style={css.button} onClick={() => setPreview(!preview)}>{preview ? 'Builder' : 'Preview'}</button>
        <button style={css.button} onClick={downloadExport}>Export</button>
        <label style={{...css.button,display:'inline-block'}}>Import<input type="file" accept="application/json,.json" onChange={uploadImport} style={{display:'none'}} /></label>
        <button style={css.button} disabled={busy} onClick={() => save(false)}>Save draft</button>
        <button style={css.primary} disabled={busy} onClick={() => save(true)}>Publish</button>
      </div>
      {preview ? <Preview form={form} /> : <div style={css.grid}>
        <aside style={css.card}><h3 style={{ marginTop: 0 }}>Fields</h3>{fieldTypes.map(([type,title]) => <button key={type} style={css.palette} onClick={() => addField(type,title)}>+ {title}</button>)}</aside>
        <section style={css.card}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>{form.pages.map((p,i) => <button key={p.id} style={i === pageIndex ? css.primary : css.button} onClick={() => { setPageIndex(i); setSelectedId(null); }}>{p.title}</button>)}<button style={css.button} onClick={addPage}>+ Page</button></div>
          <div style={{display:'flex',gap:6,marginBottom:12}}><button style={css.button} onClick={() => movePage(-1)}>← Page</button><button style={css.button} onClick={() => movePage(1)}>Page →</button><button style={css.button} onClick={duplicatePage}>Duplicate page</button><button style={css.button} onClick={removePage}>Remove page</button></div>
          <label style={css.label}>Page title<input style={css.input} value={currentPage.title} onChange={e => setForm(prev => ({ ...prev, pages: prev.pages.map((p,i) => i === pageIndex ? { ...p, title: e.target.value } : p) }))} /></label>
          <label style={css.label}>Page description<textarea style={{...css.input,minHeight:70}} value={currentPage.description || ''} onChange={e => setForm(prev => ({ ...prev, pages: prev.pages.map((p,i) => i === pageIndex ? { ...p, description: e.target.value } : p) }))} /></label>
          {currentPage.fields.length === 0 && <div style={{ padding: 30, border: '2px dashed #dcdce4', borderRadius: 8, textAlign: 'center', color: '#666687' }}>Choose a field from the left to start building.</div>}
          {currentPage.fields.map((field,index) => <div key={field.id} style={{ ...css.fieldCard, outline: selectedId === field.id ? '2px solid #4945ff' : undefined }} onClick={() => setSelectedId(field.id)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}><div><strong>{field.label}</strong><div style={{ fontSize: 12, color: '#666687' }}>{field.type} · {field.name}</div></div><div><button style={css.button} onClick={e => {e.stopPropagation(); moveField(index,-1)}}>↑</button> <button style={css.button} onClick={e => {e.stopPropagation(); moveField(index,1)}}>↓</button></div></div>
          </div>)}
        </section>
        <aside style={css.card}><h3 style={{ marginTop: 0 }}>Properties</h3>{!selected ? <p>Select a field to edit it.</p> : <>
          <label style={css.label}>Label<input style={css.input} value={selected.label} onChange={e => updateField({ label: e.target.value })} /></label>
          <label style={css.label}>Field name<input style={css.input} value={selected.name} onChange={e => updateField({ name: slugify(e.target.value).replace(/-/g,'_') })} /></label>
          {!['heading','paragraph'].includes(selected.type) && <><label style={css.label}>Placeholder<input style={css.input} value={selected.placeholder || ''} onChange={e => updateField({ placeholder: e.target.value })} /></label><label style={css.label}>Help text<input style={css.input} value={selected.helpText || ''} onChange={e => updateField({ helpText: e.target.value })} /></label><label style={{ display:'flex',gap:8,marginBottom:12 }}><input type="checkbox" checked={!!selected.required} onChange={e => updateField({ required: e.target.checked })} /> Required</label></>}
          {selected.options && <label style={css.label}>Options (one per line)<textarea style={{ ...css.input, minHeight: 100 }} value={selected.options.map(o => o.label).join('\n')} onChange={e => updateField({ options: e.target.value.split('\n').filter(Boolean).map(v => ({ label:v, value:slugify(v) })) })} /></label>}
          <details style={{ marginBottom: 16 }} open={!!selected.conditions}><summary>Conditional logic</summary>
            <label style={{display:'flex',gap:8,margin:'12px 0'}}><input type="checkbox" checked={!!selected.conditions} onChange={e => updateField({ conditions: e.target.checked ? { logic:'and', rules:[{ field: allFields[0]?.name || '', operator:'eq', value:'' }] } : null })} /> Show this field conditionally</label>
            {selected.conditions && <><label style={css.label}>When field<select style={css.input} value={String(selected.conditions.rules[0]?.field || '')} onChange={e => setCondition({field:e.target.value})}><option value="">Select field…</option>{allFields.map(f => <option key={f.id} value={f.name}>{f.label} ({f.name})</option>)}</select></label>
            <label style={css.label}>Operator<select style={css.input} value={String(selected.conditions.rules[0]?.operator || 'eq')} onChange={e => setCondition({operator:e.target.value})}><option value="eq">Equals</option><option value="neq">Does not equal</option><option value="contains">Contains</option><option value="isEmpty">Is empty</option><option value="isNotEmpty">Is not empty</option></select></label>
            {!['isEmpty','isNotEmpty'].includes(String(selected.conditions.rules[0]?.operator)) && <label style={css.label}>Value<input style={css.input} value={String(selected.conditions.rules[0]?.value ?? '')} onChange={e => setCondition({value:e.target.value})} /></label>}</>}
          </details>
          <button style={{ ...css.button, width:'100%' }} onClick={() => removeField(selected.id)}>Remove field</button>
        </>}</aside>
      </div>}
    </>}

    {view === 'submissions' && <div style={{display:'grid',gridTemplateColumns:selectedSubmission ? 'minmax(500px,1fr) 420px' : '1fr',gap:16}}>
      <div style={css.card}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'end',gap:12,marginBottom:16}}><div><h2 style={{ margin:0 }}>Submissions</h2><p style={{margin:'4px 0 0',color:'#666687'}}>Review submitted form data and workflow status.</p></div><label style={css.label}>Status<select style={{...css.input,minWidth:170}} value={submissionStatus} onChange={e => setSubmissionStatus(e.target.value)}><option value="">All statuses</option><option value="received">Received</option><option value="processing">Processing</option><option value="completed">Completed</option><option value="rejected">Rejected</option></select></label></div>
        {submissions.length === 0 ? <p>No submissions found.</p> : submissions.map((s:any) => <button key={s.documentId} style={{...css.fieldCard,width:'100%',textAlign:'left'}} onClick={() => setSelectedSubmission(s)}><div style={{display:'flex',justifyContent:'space-between',gap:12}}><div><strong>{s.form?.name || 'Form submission'}</strong><div style={{ fontSize:13,color:'#666687' }}>{new Date(s.submittedAt || s.createdAt).toLocaleString()}</div></div><span>{s.status || 'received'}</span></div></button>)}
      </div>
      {selectedSubmission && <aside style={css.card}><div style={{display:'flex',justifyContent:'space-between',gap:8}}><h3 style={{marginTop:0}}>Submission</h3><button style={css.button} onClick={() => setSelectedSubmission(null)}>Close</button></div><p><strong>{selectedSubmission.form?.name || 'Form'}</strong><br/><small>{selectedSubmission.documentId}</small></p><label style={css.label}>Workflow status<select style={css.input} value={selectedSubmission.status || 'received'} disabled={busy} onChange={e => updateSubmissionStatus(selectedSubmission.documentId,e.target.value)}><option value="received">Received</option><option value="processing">Processing</option><option value="completed">Completed</option><option value="rejected">Rejected</option></select></label><h4>Submitted data</h4><div>{Object.entries(selectedSubmission.data || {}).map(([key,value]) => <div key={key} style={{padding:'8px 0',borderBottom:'1px solid #eee'}}><strong style={{fontSize:12}}>{key}</strong><div style={{whiteSpace:'pre-wrap',overflowWrap:'anywhere'}}>{Array.isArray(value) ? value.join(', ') : typeof value === 'object' ? JSON.stringify(value) : String(value ?? '')}</div></div>)}</div></aside>}
    </div>}

    {view === 'settings' && <div style={css.card}><h2 style={{ marginTop:0 }}>Settings</h2><p>CleverForms Core settings are provider-neutral. Extension APIs are reserved for compatible integrations and future Strapi capabilities.</p><label style={css.label}>Default confirmation message<input style={css.input} value={form.confirmation?.message || ''} onChange={e => setForm({ ...form, confirmation:{...form.confirmation,message:e.target.value} })} /></label></div>}
  </main>;
}

export default App;
