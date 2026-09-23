import { validateSubmission, CleverFormsValidationError } from '../utils/validation';
import { safeSlug, truncateUserAgent } from '../utils/security';
import { CLEVER_FORMS_SCHEMA_VERSION } from '../../../shared/types';
import { cleverFormsLifecycle } from '../../../shared/lifecycle';

const SUBMISSION_UID = 'plugin::clever-forms.submission';

function serializePublicForm(form: any) {
  return {
    documentId: form.documentId,
    name: form.name,
    slug: form.slug,
    description: form.description ?? null,
    version: form.version ?? 1,
    schemaVersion: form.schemaVersion ?? CLEVER_FORMS_SCHEMA_VERSION,
    pages: form.pages ?? [],
    confirmation: form.confirmation ?? null,
    requiresAuthentication: Boolean(form.requiresAuthentication),
  };
}

export default ({ strapi }: { strapi: any }) => ({
  async getBySlug(ctx: any) {
    const slug = safeSlug(ctx.params.slug);
    if (!slug) return ctx.badRequest('Invalid form slug.');

    const form = await strapi.plugin('clever-forms').service('form').findPublishedBySlug(slug);
    if (!form) return ctx.notFound('Form not found');
    if (form.requiresAuthentication && !ctx.state?.user) return ctx.unauthorized('Authentication required');

    ctx.set('Cache-Control', 'no-store');
    ctx.body = { data: serializePublicForm(form) };
  },

  async submit(ctx: any) {
    const slug = safeSlug(ctx.params.slug);
    if (!slug) return ctx.badRequest('Invalid form slug.');

    const form = await strapi.plugin('clever-forms').service('form').findPublishedBySlug(slug);
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
          metadata: { source: 'api' },
          submittedAt,
          status: 'received',
          userAgent: truncateUserAgent(ctx.request.headers['user-agent']),
        },
      });

      await cleverFormsLifecycle.emit('submission.afterCreate', {
        form,
        submission: { ...envelope, documentId: submission.documentId },
      });

      ctx.set('Cache-Control', 'no-store');
      ctx.status = 201;
      ctx.body = { data: { documentId: submission.documentId, status: submission.status } };
    } catch (error) {
      if (error instanceof CleverFormsValidationError) return ctx.badRequest(error.message, { errors: error.details });
      throw error;
    }
  },
});

export { SUBMISSION_UID };
