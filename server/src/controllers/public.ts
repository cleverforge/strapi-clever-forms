import { validateSubmission, CleverFormsValidationError } from '../utils/validation';
import { CLEVER_FORMS_SCHEMA_VERSION } from '../../../shared/types';
import { cleverFormsLifecycle } from '../../../shared/lifecycle';

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
      await cleverFormsLifecycle.emit('submission.beforeValidate', { form, data: ctx.request.body?.data ?? {} });
      const cleanData = validateSubmission(form, ctx.request.body?.data ?? {});
      await cleverFormsLifecycle.emit('submission.afterValidate', { form, data: cleanData });

      const submittedAt = new Date().toISOString();
      const envelope = {
        formDocumentId: form.documentId,
        formVersion: form.version ?? 1,
        formSchemaVersion: form.schemaVersion ?? CLEVER_FORMS_SCHEMA_VERSION,
        submittedAt,
        data: cleanData,
      };

      await cleverFormsLifecycle.emit('submission.beforeCreate', { form, submission: envelope });
      const submission = await strapi.documents(SUBMISSION_UID).create({
        data: {
          form: form.documentId,
          formVersion: envelope.formVersion,
          formSchemaVersion: envelope.formSchemaVersion,
          data: cleanData,
          metadata: { source: ctx.request.body?.metadata?.source ?? 'api' },
          submittedAt,
          status: 'received',
          userAgent: ctx.request.headers['user-agent'] ?? null,
        },
      });

      await cleverFormsLifecycle.emit('submission.afterCreate', {
        form,
        submission: { ...envelope, documentId: submission.documentId },
      });

      ctx.status = 201;
      ctx.body = { data: { documentId: submission.documentId, status: submission.status } };
    } catch (error) {
      if (error instanceof CleverFormsValidationError) return ctx.badRequest(error.message, { errors: error.details });
      throw error;
    }
  },
});

export { SUBMISSION_UID };
