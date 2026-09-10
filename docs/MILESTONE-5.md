# Milestone 5 — CleverForms Pro Foundation

Milestone 5 establishes the public integration contracts that a separately distributed commercial `@cleverforge/strapi-clever-forms-pro` package will consume.

## Public Core responsibilities

The public MIT-licensed Core owns only the contracts and fail-closed compatibility helpers required for optional commercial modules to interoperate safely:

- Pro contract versioning
- license status and entitlement types
- license provider and cache/store interfaces
- secure configuration provider interface
- compatibility checking across schema, extension API, and Pro contract versions
- entitlement checks
- Save & Continue draft-store abstraction
- private-file storage abstraction
- signature-provider abstraction
- PDF-provider abstraction
- premium-field registration contract
- premium action registration contract
- provider registries

Core does not contain a CleverForge license-server implementation, subscription secrets, proprietary premium fields, hosted service credentials, payment code, Salesforce integration logic, or other commercial source code.

## Private repository boundary

The intended private repository is:

```text
cleverforge/strapi-clever-forms-pro
```

The intended private package is:

```text
@cleverforge/strapi-clever-forms-pro
```

That package should depend on the public Core API:

```ts
import {
  CLEVER_FORMS_EXTENSION_API_VERSION,
  CLEVER_FORMS_PRO_CONTRACT_VERSION,
  CLEVER_FORMS_SCHEMA_VERSION,
  checkProCompatibility,
  cleverFormsProProviders,
  requireEntitlement,
} from '@cleverforge/strapi-clever-forms/core';
```

## License architecture

The private package should receive a customer license key through secure server configuration and exchange it with CleverForge licensing infrastructure. The public `CleverLicenseProvider` contract intentionally does not define the vendor endpoint, authentication scheme, signing keys, or proprietary response implementation.

Recommended license state behavior:

- `active`: premium features enabled
- `trial`: enabled within trial entitlements
- `grace`: temporarily enabled from a previously valid cached license
- `expired`: disabled
- `suspended`: disabled
- `invalid`: disabled
- `unknown`: disabled unless an explicitly supported offline grace snapshot remains valid

Entitlement checks fail closed.

## Initial entitlement namespace

Recommended entitlement identifiers:

```text
forms.pro
forms.save_continue
forms.private_uploads
forms.signatures
forms.pdf
forms.advanced_logic
forms.workflow
clever.connect
clever.ai
clever.communications
clever.analytics
clever.payments
```

## Save & Continue

Core exposes a `CleverDraftStore` interface but no implementation. The private package should implement cryptographically random user-facing tokens, store only token hashes, enforce expiration, validate the referenced form/version, and avoid placing sensitive draft payloads in browser-readable tokens.

## Private uploads

Core exposes `CleverPrivateFileProvider`. The commercial implementation may support local private storage, S3-compatible storage, or other providers. Files should not be made public merely because Strapi's public upload provider is enabled.

## Signatures

Core exposes a provider-neutral `CleverSignatureProvider` contract. Commercial implementations can support native signature capture and/or external electronic-signature providers while recording evidence and status separately from the public Core.

## PDFs

Core exposes `CleverPdfProvider`. Commercial implementations can render branded submission documents without coupling Core to a specific PDF engine or hosted service.

## Secure configuration

Premium credentials must use the `CleverSecureConfigProvider` abstraction and remain server-side. The public Core must not receive Salesforce secrets, AI provider keys, signing secrets, payment secrets, or CleverForge licensing secrets.

## Compatibility gate

The Pro package must validate these three versions during startup:

1. CleverForms schema version
2. CleverForms extension API version
3. CleverForms Pro contract version

Unsupported combinations should disable the commercial extension with a clear administrator-facing error rather than continuing with undefined behavior.

## What remains after the private repository is created

The private package can then implement:

- CleverForge license API client
- license cache/grace behavior
- Strapi secure configuration implementation
- Pro admin settings panel
- license activation UI
- premium field registrations
- Save & Continue persistence and endpoints
- private file upload/download runtime
- signature runtime
- PDF generation runtime
- Pro workflow actions
- private CI and packaging

None of those proprietary implementations should be committed to the public Core repository.
