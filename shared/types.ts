export const CLEVER_FORMS_SCHEMA_VERSION = 1 as const;
export const CLEVER_FORMS_EXTENSION_API_VERSION = 1 as const;

export type CleverFormsSchemaVersion = typeof CLEVER_FORMS_SCHEMA_VERSION;
export type CleverFormsExtensionApiVersion = typeof CLEVER_FORMS_EXTENSION_API_VERSION;

export type CleverConditionOperator =
  | 'eq'
  | 'neq'
  | 'contains'
  | 'notContains'
  | 'startsWith'
  | 'endsWith'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'isEmpty'
  | 'isNotEmpty'
  | 'in'
  | 'notIn';

export type CleverCondition = {
  field: string;
  operator: CleverConditionOperator;
  value?: unknown;
};

export type CleverConditionGroup = {
  logic: 'and' | 'or';
  rules: Array<CleverCondition | CleverConditionGroup>;
};

export type CleverFieldOption = { label: string; value: string };

export type CleverField = {
  id: string;
  type: string;
  name: string;
  label: string;
  placeholder?: string;
  helpText?: string;
  required?: boolean;
  options?: CleverFieldOption[];
  conditions?: CleverConditionGroup | null;
  settings?: Record<string, unknown>;
};

export type CleverPage = {
  id: string;
  title: string;
  description?: string;
  fields: CleverField[];
};

export type CleverFormSchema = {
  schemaVersion: CleverFormsSchemaVersion;
  extensionApiVersion: CleverFormsExtensionApiVersion;
  name: string;
  slug: string;
  description?: string;
  status: 'draft' | 'published' | 'archived';
  version: number;
  requiresAuthentication?: boolean;
  pages: CleverPage[];
  confirmation?: Record<string, unknown>;
  settings?: Record<string, unknown>;
};

export type CleverSubmissionEnvelope = {
  formDocumentId: string;
  formVersion: number;
  formSchemaVersion: CleverFormsSchemaVersion;
  submittedAt: string;
  data: Record<string, unknown>;
};

export type CleverLifecycleEventName =
  | 'form.beforeCreate'
  | 'form.afterCreate'
  | 'form.beforeUpdate'
  | 'form.afterUpdate'
  | 'form.beforePublish'
  | 'form.afterPublish'
  | 'submission.beforeValidate'
  | 'submission.afterValidate'
  | 'submission.beforeCreate'
  | 'submission.afterCreate';

export type CleverLifecycleEvent<T = unknown> = {
  name: CleverLifecycleEventName;
  payload: T;
  timestamp: string;
};

export type CleverActionContext = {
  form: CleverFormSchema;
  submission?: CleverSubmissionEnvelope;
  strapi?: unknown;
};

export type CleverActionResult = {
  ok: boolean;
  message?: string;
  data?: unknown;
};

export interface CleverActionHandler {
  id: string;
  execute(context: CleverActionContext): Promise<CleverActionResult> | CleverActionResult;
}
