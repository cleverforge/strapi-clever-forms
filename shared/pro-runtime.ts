import {
  hasEntitlement,
  type CleverLicenseSnapshot,
  type CleverPdfProvider,
  type CleverPrivateFileProvider,
  type CleverSecureConfigProvider,
  type CleverSignatureProvider,
} from './pro-contracts';

export class CleverEntitlementError extends Error {
  readonly entitlement: string;
  constructor(entitlement: string) {
    super(`CleverForms entitlement required: ${entitlement}`);
    this.name = 'CleverEntitlementError';
    this.entitlement = entitlement;
  }
}

export function requireEntitlement(snapshot: CleverLicenseSnapshot | null, entitlement: string): void {
  if (!hasEntitlement(snapshot, entitlement)) throw new CleverEntitlementError(entitlement);
}

export class CleverProProviderRegistry {
  private secureConfig: CleverSecureConfigProvider | null = null;
  private privateFiles: CleverPrivateFileProvider | null = null;
  private signatures = new Map<string, CleverSignatureProvider>();
  private pdf = new Map<string, CleverPdfProvider>();

  registerSecureConfig(provider: CleverSecureConfigProvider) { this.secureConfig = provider; }
  getSecureConfig() { return this.secureConfig; }

  registerPrivateFiles(provider: CleverPrivateFileProvider) { this.privateFiles = provider; }
  getPrivateFiles() { return this.privateFiles; }

  registerSignature(provider: CleverSignatureProvider) {
    if (!provider?.id) throw new Error('Signature provider id is required.');
    this.signatures.set(provider.id, provider);
  }

  getSignature(id: string) { return this.signatures.get(id) || null; }
  getSignatureProviders() { return [...this.signatures.values()]; }

  registerPdf(provider: CleverPdfProvider) {
    if (!provider?.id) throw new Error('PDF provider id is required.');
    this.pdf.set(provider.id, provider);
  }

  getPdf(id: string) { return this.pdf.get(id) || null; }
  getPdfProviders() { return [...this.pdf.values()]; }
}

export const cleverFormsProProviders = new CleverProProviderRegistry();
