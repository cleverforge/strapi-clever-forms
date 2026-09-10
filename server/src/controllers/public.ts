import { validateSubmission, CleverFormsValidationError } from '../utils/validation';

export default ({ strapi }: { strapi: any }) => ({
  async getBySlug(ctx: any) {
    const form = await strapi.plugin('clever-forms').service('form').findPublishedBySlug(ctx.params.slug);
    if (!form) return ctx.notFound('Form not found');
    if (form.requiresAuthentication && !ctx.state?.user) return ctx.unauthorized('Authentication required');
    ctx.body = { data: form };
  },

  async submit(ctx: any) {
    const form = await strapi.plugin('clever-forms').service('form').findPublishedBySlug(ctx.params.slug);
    if (!form) return ctx.notFound('Form not found');
    if (form.requiresAuthentication && !ctx.state?.user) return ctx.unauthorized('Authentication required');

    try {
      const cleanData = validateSubmission(form, ctx.request.body?.data ?? {});
      const submission = await strapi.documents('plugin::clever-forms.submission').create({
        data: {
          form: form.documentId,
          formVersion: form.version ?? 1,
          data: cleanData,
          metadata: { source: ctx.request.body?.metadata?.source ?? 'api' },
          submittedAt: new Date().toISOString(),
          status: 'received',
          userAgent: ctx.request.headers['user-agent'] ?? null,
        },
      });
      ctx.status = 201;
      ctx.body = { data: { documentId: submission.documentId, status: submission.status } };
    } catch (error) {
      if (error instanceof CleverFormsValidationError) return ctx.badRequest(error.message, { errors: error.details });
      throw error;
    }
  },
});
