import { z } from 'zod';
import { CLEVER_FORMS_EXTENSION_API_VERSION, CLEVER_FORMS_SCHEMA_VERSION, type CleverFormSchema } from './types';

const conditionSchema: z.ZodType<any> = z.lazy(() => z.union([
  z.object({ field: z.string().min(1), operator: z.string().min(1), value: z.unknown().optional() }),
  z.object({ logic: z.enum(['and', 'or']), rules: z.array(conditionSchema) }),
]));

const optionSchema = z.object({ label: z.string(), value: z.string() });
const fieldSchema = z.object({
  id: z.string().min(1),
  type: z.string().min(1),
  name: z.string().min(1),
  label: z.string(),
  placeholder: z.string().optional(),
  helpText: z.string().optional(),
  required: z.boolean().optional(),
  options: z.array(optionSchema).optional(),
  conditions: conditionSchema.nullable().optional(),
  settings: z.record(z.unknown()).optional(),
});

const pageSchema = z.object({
  id: z.string().min(1),
  title: z.string(),
  description: z.string().optional(),
  fields: z.array(fieldSchema),
});

export const cleverFormSchema = z.object({
  schemaVersion: z.literal(CLEVER_FORMS_SCHEMA_VERSION).default(CLEVER_FORMS_SCHEMA_VERSION),
  extensionApiVersion: z.literal(CLEVER_FORMS_EXTENSION_API_VERSION).default(CLEVER_FORMS_EXTENSION_API_VERSION),
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  version: z.number().int().positive().default(1),
  requiresAuthentication: z.boolean().optional(),
  pages: z.array(pageSchema).min(1),
  confirmation: z.record(z.unknown()).optional(),
  settings: z.record(z.unknown()).optional(),
});

export function parseCleverFormSchema(input: unknown): CleverFormSchema {
  return cleverFormSchema.parse(input) as CleverFormSchema;
}

export function normalizeLegacyForm(input: any): CleverFormSchema {
  return parseCleverFormSchema({
    ...input,
    schemaVersion: input?.schemaVersion ?? CLEVER_FORMS_SCHEMA_VERSION,
    extensionApiVersion: input?.extensionApiVersion ?? CLEVER_FORMS_EXTENSION_API_VERSION,
    version: input?.version ?? 1,
  });
}

export function assertCompatibleSchemaVersion(version: number) {
  if (version !== CLEVER_FORMS_SCHEMA_VERSION) {
    throw new Error(`Unsupported CleverForms schema version ${version}. Supported version: ${CLEVER_FORMS_SCHEMA_VERSION}.`);
  }
}

export function assertCompatibleExtensionApiVersion(version: number) {
  if (version !== CLEVER_FORMS_EXTENSION_API_VERSION) {
    throw new Error(`Unsupported CleverForms extension API version ${version}. Supported version: ${CLEVER_FORMS_EXTENSION_API_VERSION}.`);
  }
}
