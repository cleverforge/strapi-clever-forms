import type {
  CleverActionHandler,
  CleverFormsExtensionApiVersion,
  CleverFormsSchemaVersion,
} from './types';

export const CLEVER_FORMS_PRO_CONTRACT_VERSION = 1 as const;

export type CleverFormsProContractVersion = typeof CLEVER_FORMS_PRO_CONTRACT_VERSION;

export type CleverLicenseStatus =
  | 'active'
  | 'trial'
  | 'grace'
  | 'expired'
  | 'suspended'
  | 'invalid'
  | 'unknown';

export type CleverLicensePlan = 'pro' | 'business' | 'agency' | string;

export type CleverEntitlement = {
  key: string;
  enabled: boolean;
  limit?: number | null;
  metadata?: Record<string, unknown>;
};

export type CleverLicenseSnapshot = {
  status: CleverLicenseStatus;
  plan?: CleverLicensePlan;
  licenseId?: string;
  organizationId?: string;
  instanceId?: string;
  expiresAt?: string | null;
  checkedAt: string;
  offlineUntil?: string | null;
  entitlements: CleverEntitlement[];
};

export interface CleverLicenseProvider {
  validate(input: {
    licenseKey: string;
    instanceId: string;
    packageVersion: string;
    coreVersion: string;
  }): Promise<CleverLicenseSnapshot>;
}

export interface CleverLicenseStore {
  read(): Promise<CleverLicenseSnapshot | null>;
  write(snapshot: CleverLicenseSnapshot): Promise<void>;
  clear(): Promise<void>;
}

export interface CleverSecureConfigProvider {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  delete(key: string): Promise<void>;
  has(key: string): Promise<boolean>;
}

export type CleverFeatureRequirement = {
  entitlement: string;
  minimumPlan?: string;
};

export type CleverCompatibilityInput = {
  coreSchemaVersion: number;
  extensionApiVersion: number;
  proContractVersion: number;
  supportedSchemaVersions: readonly number[];
  supportedExtensionApiVersions: readonly number[];
  supportedProContractVersions: readonly number[];
};

export type CleverCompatibilityResult = {
  compatible: boolean;
  errors: string[];
};

export function checkProCompatibility(input: CleverCompatibilityInput): CleverCompatibilityResult {
  const errors: string[] = [];

  if (!input.supportedSchemaVersions.includes(input.coreSchemaVersion)) {
    errors.push(`Unsupported CleverForms schema version: ${input.coreSchemaVersion}`);
  }

  if (!input.supportedExtensionApiVersions.includes(input.extensionApiVersion)) {
    errors.push(`Unsupported CleverForms extension API version: ${input.extensionApiVersion}`);
  }

  if (!input.supportedProContractVersions.includes(input.proContractVersion)) {
    errors.push(`Unsupported CleverForms Pro contract version: ${input.proContractVersion}`);
  }

  return { compatible: errors.length === 0, errors };
}

export function hasEntitlement(snapshot: CleverLicenseSnapshot | null, key: string): boolean {
  if (!snapshot || !['active', 'trial', 'grace'].includes(snapshot.status)) return false;
  return snapshot.entitlements.some((item) => item.key === key && item.enabled);
}

export type CleverDraftTokenRecord = {
  id: string;
  formDocumentId: string;
  formVersion: number;
  tokenHash: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown>;
};

export interface CleverDraftStore {
  create(input: {
    formDocumentId: string;
    formVersion: number;
    tokenHash: string;
    expiresAt: string;
    data: Record<string, unknown>;
    metadata?: Record<string, unknown>;
  }): Promise<CleverDraftTokenRecord>;
  readByTokenHash(tokenHash: string): Promise<{ record: CleverDraftTokenRecord; data: Record<string, unknown> } | null>;
  update(tokenHash: string, data: Record<string, unknown>): Promise<void>;
  delete(tokenHash: string): Promise<void>;
}

export type CleverPrivateFileDescriptor = {
  id: string;
  storageKey: string;
  filename: string;
  mimeType: string;
  size: number;
  checksum?: string;
  createdAt: string;
};

export interface CleverPrivateFileProvider {
  put(input: {
    filename: string;
    mimeType: string;
    size: number;
    bytes: Uint8Array;
    metadata?: Record<string, string>;
  }): Promise<CleverPrivateFileDescriptor>;
  get(storageKey: string): Promise<Uint8Array>;
  delete(storageKey: string): Promise<void>;
  createDownloadToken?(storageKey: string, expiresInSeconds: number): Promise<string>;
}

export type CleverSignatureRequest = {
  formDocumentId: string;
  submissionDocumentId?: string;
  signerName?: string;
  signerEmail?: string;
  document?: Uint8Array;
  metadata?: Record<string, unknown>;
};

export type CleverSignatureResult = {
  provider: string;
  externalId?: string;
  status: 'created' | 'pending' | 'signed' | 'declined' | 'expired' | 'failed';
  signedAt?: string;
  evidence?: Record<string, unknown>;
};

export interface CleverSignatureProvider {
  id: string;
  create(request: CleverSignatureRequest): Promise<CleverSignatureResult>;
  getStatus?(externalId: string): Promise<CleverSignatureResult>;
}

export type CleverPdfRenderRequest = {
  templateId?: string;
  form: Record<string, unknown>;
  submission: Record<string, unknown>;
  locale?: string;
  branding?: Record<string, unknown>;
};

export type CleverPdfRenderResult = {
  bytes: Uint8Array;
  filename: string;
  mimeType: 'application/pdf';
  metadata?: Record<string, unknown>;
};

export interface CleverPdfProvider {
  id: string;
  render(request: CleverPdfRenderRequest): Promise<CleverPdfRenderResult>;
}

export type CleverPremiumFieldRegistration = {
  type: string;
  label: string;
  entitlement: string;
  schemaVersion: CleverFormsSchemaVersion;
  extensionApiVersion: CleverFormsExtensionApiVersion;
  defaults?: Record<string, unknown>;
};

export type CleverProActionRegistration = {
  entitlement: string;
  handler: CleverActionHandler;
};
