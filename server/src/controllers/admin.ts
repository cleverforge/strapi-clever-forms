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
  requiresAuthentication: Boolean(body?.requiresAuthentication),
  pages: Array.isArray(body?.pages) ? body.pages : [],
  settings: body?.settings || {},
  confirmation: body?.confirmation || { type: 'message', message: 'Thank you for your submission.' },
});

export default {
  async list(ctx: any) {
    const documents = await strapi.documents(FORM_UID).findMany({
      sort: ['updatedAt:desc'],
      status: 'draft',
    } as any);
    ctx.body = { data: documents };
  },

  async findOne(ctx: any) {
    const document = await strapi.documents(FORM_UID).findOne({ documentId: ctx.params.documentId } as any);
    if (!document) return ctx.notFound('Form not found');
    ctx.body = { data: document };
  },

  async create(ctx: any) {
    const data = normalize(ctx.request.body?.data || ctx.request.body);
    const document = await strapi.documents(FORM_UID).create({ data } as any);
    ctx.body = { data: document };
  },

  async update(ctx: any) {
    const data = normalize(ctx.request.body?.data || ctx.request.body);
    const document = await strapi.documents(FORM_UID).update({ documentId: ctx.params.documentId, data } as any);
    ctx.body = { data: document };
  },

  async publish(ctx: any) {
    await strapi.documents(FORM_UID).update({
      documentId: ctx.params.documentId,
      data: { status: 'published' },
    } as any);
    const document = await strapi.documents(FORM_UID).publish({ documentId: ctx.params.documentId } as any);
    ctx.body = { data: document };
  },

  async remove(ctx: any) {
    await strapi.documents(FORM_UID).delete({ documentId: ctx.params.documentId } as any);
    ctx.body = { data: { documentId: ctx.params.documentId } };
  },

  async listSubmissions(ctx: any) {
    const documents = await strapi.documents(SUBMISSION_UID).findMany({
      sort: ['submittedAt:desc'],
      populate: ['form'],
    } as any);
    ctx.body = { data: documents };
  },
};
