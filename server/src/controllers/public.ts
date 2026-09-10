import { CleverFormsValidationError, validateSubmission } from '../utils/validation';

const FORM_UID = 'plugin::clever-forms.form';
const SUBMISSION_UID = 'plugin::clever-forms.submission';

export default ({ strapi }: { strapi: any }) => ({
  async getBySlug(ctx: any) {
    const form = await strapi.plugin('clever-forms').service('form').findPublishedBySlug(ctx.params.slug);

    if (!form) return ctx.notFound('Form not found');
    if (form.requiresAuthentication && !ctx.state?.user) return ctx.unauthorized('Authentication required');

    const { submissions: _submissions, ...publicForm } = form;
    ctx.body = { data: publicForm };
  },

  async submit(ctx: any) {
    const form = await strapi.plugin('clever-forms').service('form').findPublishedBySlug(ctx.params.slug);

    if (!form) return ctx.notFound('Form not found');
    if (form.requiresAuthentication && !ctx.state?.user) return ctx.unauthorized('Authentication required');

    try {
      const cleanData = validateSubmission(form, ctx.request.body?.data ?? {});
      const submission = await strapi.documents(SUBMISSION_UID).create({
        data: {
          form: form.documentId,
          formVersion: form.schemaVersion ?? 1,
          data: cleanData,
          metadata: { source: ctx.request.body?.metadata?.source ?? 'api' },
          submittedAt: new Date().toISOString(),
          status: 'received',
          userAgent: ctx.request.headers['user-agent'] ?? null
        }
      });

      ctx.status = 201;
      ctx.body = { data: { documentId: submission.documentId, status: submission.status } };
    } catch (error) {
      if (error instanceof CleverFormsValidationError) {
        return ctx.badRequest(error.message, { errors: error.details });
      }
      throw error;
    }
  }
});

export { FORM_UID, SUBMISSION_UID };
