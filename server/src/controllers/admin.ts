import { CLEVER_FORMS_EXTENSION_API_VERSION, CLEVER_FORMS_SCHEMA_VERSION } from '../../../shared/types';
import { cleverFormsLifecycle } from '../../../shared/lifecycle';

const FORM_UID = 'plugin::clever-forms.form';
const SUBMISSION_UID = 'plugin::clever-forms.submission';

const normalize = (body: any) => ({
  name: String(body?.name || 'Untitled form').trim(),
  slug: String(body?.slug || body?.name || 'untitled-form')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, ''),
  description: body?.description || '',
  status: body?.status || 'draft',
  schemaVersion: body?.schemaVersion ?? CLEVER_FORMS_SCHEMA_VERSION,
  extensionApiVersion: body?.extensionApiVersion ?? CLEVER_FORMS_EXTENSION_API_VERSION,
  version: Math.max(1, Number(body?.version || 1)),
  requiresAuthentication: Boolean(body?.requiresAuthentication),
  pages: Array.isArray(body?.pages) ? body.pages : [],
  settings: body?.settings || {},
  confirmation: body?.confirmation || { type: 'message', message: 'Thank you for your submission.' },
});

const paging = (ctx: any) => ({
  page: Math.max(1, Number(ctx.query?.page || 1)),
  pageSize: Math.min(100, Math.max(1, Number(ctx.query?.pageSize || 20))),
});

export default {
  async list(ctx: any) {
    const { page, pageSize } = paging(ctx);
    const search = String(ctx.query?.search || '').trim();
    const filters: any = search ? { $or: [{ name: { $containsi: search } }, { slug: { $containsi: search } }] } : {};
    const documents = await strapi.documents(FORM_UID).findMany({
      sort: ['updatedAt:desc'], status: 'draft', filters,
      start: (page - 1) * pageSize, limit: pageSize,
    } as any);
    const total = await strapi.documents(FORM_UID).count({ status: 'draft', filters } as any);
    ctx.body = { data: documents, meta: { pagination: { page, pageSize, pageCount: Math.ceil(total / pageSize), total } } };
  },

  async findOne(ctx: any) {
    const document = await strapi.documents(FORM_UID).findOne({ documentId: ctx.params.documentId } as any);
    if (!document) return ctx.notFound('Form not found');
    ctx.body = { data: document };
  },

  async create(ctx: any) {
    const data = normalize(ctx.request.body?.data || ctx.request.body);
    await cleverFormsLifecycle.emit('form.beforeCreate', { data });
    const document = await strapi.documents(FORM_UID).create({ data } as any);
    await cleverFormsLifecycle.emit('form.afterCreate', { document });
    ctx.body = { data: document };
  },

  async duplicate(ctx: any) {
    const source: any = await strapi.documents(FORM_UID).findOne({ documentId: ctx.params.documentId } as any);
    if (!source) return ctx.notFound('Form not found');
    const copy = normalize({ ...source, name: `${source.name} Copy`, slug: `${source.slug}-copy`, status: 'draft', version: 1 });
    await cleverFormsLifecycle.emit('form.beforeCreate', { data: copy, sourceDocumentId: source.documentId });
    const document = await strapi.documents(FORM_UID).create({ data: copy } as any);
    await cleverFormsLifecycle.emit('form.afterCreate', { document, sourceDocumentId: source.documentId });
    ctx.body = { data: document };
  },

  async update(ctx: any) {
    const data = normalize(ctx.request.body?.data || ctx.request.body);
    await cleverFormsLifecycle.emit('form.beforeUpdate', { documentId: ctx.params.documentId, data });
    const document = await strapi.documents(FORM_UID).update({ documentId: ctx.params.documentId, data } as any);
    await cleverFormsLifecycle.emit('form.afterUpdate', { document });
    ctx.body = { data: document };
  },

  async publish(ctx: any) {
    const current: any = await strapi.documents(FORM_UID).findOne({ documentId: ctx.params.documentId } as any);
    if (!current) return ctx.notFound('Form not found');
    const nextVersion = Math.max(1, Number(current.version || 1)) + 1;
    await cleverFormsLifecycle.emit('form.beforePublish', { document: current, nextVersion });
    await strapi.documents(FORM_UID).update({
      documentId: ctx.params.documentId,
      data: {
        status: 'published',
        version: nextVersion,
        schemaVersion: current.schemaVersion ?? CLEVER_FORMS_SCHEMA_VERSION,
        extensionApiVersion: current.extensionApiVersion ?? CLEVER_FORMS_EXTENSION_API_VERSION,
      },
    } as any);
    const document = await strapi.documents(FORM_UID).publish({ documentId: ctx.params.documentId } as any);
    await cleverFormsLifecycle.emit('form.afterPublish', { document });
    ctx.body = { data: document };
  },

  async remove(ctx: any) {
    await strapi.documents(FORM_UID).delete({ documentId: ctx.params.documentId } as any);
    ctx.body = { data: { documentId: ctx.params.documentId } };
  },

  async listSubmissions(ctx: any) {
    const { page, pageSize } = paging(ctx);
    const search = String(ctx.query?.search || '').trim();
    const filters: any = search ? { data: { $containsi: search } } : {};
    const documents = await strapi.documents(SUBMISSION_UID).findMany({
      sort: ['submittedAt:desc'], populate: ['form'], filters,
      start: (page - 1) * pageSize, limit: pageSize,
    } as any);
    const total = await strapi.documents(SUBMISSION_UID).count({ filters } as any);
    ctx.body = { data: documents, meta: { pagination: { page, pageSize, pageCount: Math.ceil(total / pageSize), total } } };
  },

  async findSubmission(ctx: any) {
    const document = await strapi.documents(SUBMISSION_UID).findOne({ documentId: ctx.params.documentId, populate: ['form'] } as any);
    if (!document) return ctx.notFound('Submission not found');
    ctx.body = { data: document };
  },
};
