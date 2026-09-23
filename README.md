# Clever Forms for Strapi

**Clever Forms** is a Strapi 5-native form builder and submission runtime by CleverForge. The Strapi Core is MIT licensed and designed to be genuinely useful without a commercial subscription.

> **Status:** pre-1.0 development. Current package version: `0.1.0-alpha.2`.

## Core foundation

- Strapi 5 plugin packaging and Document Service
- Form and Submission plugin content types
- multi-page JSON form schema
- public published-form retrieval by slug
- server-side allow-list validation
- required, email, number, checkbox, and configured-choice validation
- bounded submission payloads and prototype-key protection
- server-owned protected submission metadata
- explicit public-form serialization
- granular Strapi Admin RBAC actions
- admin plugin registration
- English and Spanish admin translations
- React renderer foundation
- tests, CI, package verification, and a real Strapi 5 fixture

## Installation

```bash
npm install @cleverforge/strapi-clever-forms
```

The package has not yet reached a stable public release.

Enable it in Strapi:

```ts
export default () => ({
  'clever-forms': {
    enabled: true,
  },
})
```

## Public API

Retrieve a published form:

```http
GET /api/clever-forms/forms/:slug
```

Submit a form:

```http
POST /api/clever-forms/forms/:slug/submissions
Content-Type: application/json

{
  "data": {
    "email": "person@example.com"
  }
}
```

Public input is validated again on the Strapi server. Unknown fields are rejected and client-supplied submission metadata is not trusted.

## React renderer

```tsx
import { CleverForm } from '@cleverforge/strapi-clever-forms/react'

export function ContactPage({ form }) {
  return <CleverForm form={form} />
}
```

## Release validation

```bash
npm install
npm run validate:release

cd tests/fixtures/strapi5-app
npm install
npm run build
npm run smoke
```

See `docs/STRAPI5-COMPLIANCE.md` and `docs/SECURITY.md`.

## Product boundary

This Strapi package is free Core. It does not require license keys, entitlements, paid plans, or external activation. Generic extension hooks remain available for open integrations and future compatibility.

CleverForge may offer commercial CleverForms products through ecosystems that permit paid extensions. Any future commercial Strapi distribution will be evaluated against Strapi's rules in effect at that time rather than being embedded or paywalled in today's Core.

## License

MIT. See `LICENSE`.
