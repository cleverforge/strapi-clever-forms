import { describe, expect, it } from 'vitest';
import {
  CLEVER_FORMS_EXTENSION_API_VERSION,
  CLEVER_FORMS_PRO_CONTRACT_VERSION,
  CLEVER_FORMS_SCHEMA_VERSION,
  CleverEntitlementError,
  checkProCompatibility,
  hasEntitlement,
  requireEntitlement,
} from '../shared';

describe('CleverForms Pro contracts', () => {
  it('accepts matching core and pro versions', () => {
    const result = checkProCompatibility({
      coreSchemaVersion: CLEVER_FORMS_SCHEMA_VERSION,
      extensionApiVersion: CLEVER_FORMS_EXTENSION_API_VERSION,
      proContractVersion: CLEVER_FORMS_PRO_CONTRACT_VERSION,
      supportedSchemaVersions: [1],
      supportedExtensionApiVersions: [1],
      supportedProContractVersions: [1],
    });
    expect(result.compatible).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('rejects unsupported versions', () => {
    const result = checkProCompatibility({
      coreSchemaVersion: 2,
      extensionApiVersion: 3,
      proContractVersion: 4,
      supportedSchemaVersions: [1],
      supportedExtensionApiVersions: [1],
      supportedProContractVersions: [1],
    });
    expect(result.compatible).toBe(false);
    expect(result.errors).toHaveLength(3);
  });

  it('requires active entitlement', () => {
    const snapshot = {
      status: 'active' as const,
      checkedAt: new Date().toISOString(),
      entitlements: [{ key: 'forms.pro', enabled: true }],
    };
    expect(hasEntitlement(snapshot, 'forms.pro')).toBe(true);
    expect(() => requireEntitlement(snapshot, 'forms.pro')).not.toThrow();
    expect(() => requireEntitlement(snapshot, 'clever.connect')).toThrow(CleverEntitlementError);
  });

  it('fails closed for expired licenses', () => {
    const snapshot = {
      status: 'expired' as const,
      checkedAt: new Date().toISOString(),
      entitlements: [{ key: 'forms.pro', enabled: true }],
    };
    expect(hasEntitlement(snapshot, 'forms.pro')).toBe(false);
  });
});
