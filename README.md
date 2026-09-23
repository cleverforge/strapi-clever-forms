# Clever Forms for Strapi

**CleverForms** is a free, MIT-licensed Strapi 5 form builder and submission runtime by CleverForge.

> **Status:** release candidate. Current package version: `1.0.0-rc.1`.

## What Core includes

- visual multi-page form builder
- text, textarea, email, number, telephone, select, radio, checkbox, multi-select, date, time, heading, paragraph, and hidden fields
- required fields and server-side validation
- conditional field visibility
- form duplication, import, and export
- Strapi Draft & Publish integration
- active/archive lifecycle
- published-form retrieval by slug
- secure public submission endpoint
- bounded payload validation and prototype-key protection
- protected server-owned submission metadata
- submission review and workflow statuses
- granular Strapi Admin RBAC actions
- English and Spanish admin translations
- React renderer
- generic lifecycle/action extension APIs
- release validation and a real Strapi 5 integration fixture

## Installation

```bash
npm install @cleverforge/strapi-clever-forms
```

Enable the plugin in `config/plugins.ts`:

```ts
export default () => ({
  'clever-forms': {
    enabled: true,
  },
})
```

Rebuild and start Strapi:

```bash
npm run build
npm run develop
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

Public input is validated again on the Strapi server. Unknown fields are rejected and client-supplied protected submission metadata is not trusted.

## React renderer

```tsx
import { CleverForm } from '@cleverforge/strapi-clever-forms/react'

export function ContactPage({ form }) {
  return <CleverForm form={form} />
}
```

The package also exposes `@cleverforge/strapi-clever-forms/core` for provider-neutral schema, condition, lifecycle, and action utilities.

## Release validation

```bash
npm install
npm run validate:marketplace
```

Then validate against the real Strapi 5 fixture:

```bash
cd tests/fixtures/strapi5-app
npm install
rm -rf dist .tmp
npm run build
npm run smoke
```

See `docs/RELEASE-CANDIDATE.md`, `docs/STRAPI5-COMPLIANCE.md`, `docs/SECURITY.md`, and `docs/TEMPLATES.md`.

## Product boundary

The Strapi package is free Core. It does not require license keys, entitlements, paid plans, or external activation. Generic extension hooks are retained for interoperability and future compatibility.

CleverForge may offer commercial CleverForms products in ecosystems that permit paid extensions. Any future commercial Strapi distribution will be evaluated against Strapi's rules in effect at that time rather than embedded or paywalled in this Core package.

## License

MIT. See `LICENSE`.
