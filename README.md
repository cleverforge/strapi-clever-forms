# Strapi CleverForms

**Strapi CleverForms** is the Strapi-native member of the CleverForms product family by CleverForge. The public Core provides form definitions, submission storage, server-side validation, a content API, localization, and a lightweight React renderer.

> Status: pre-1.0 development. Current package version: `0.1.0-alpha.1`.

## Installation

```bash
npm install @cleverforge/strapi-clever-forms
```

Enable the plugin in your Strapi project configuration:

```ts
export default () => ({
  'clever-forms': {
    enabled: true,
  },
});
```

## Milestone 1 capabilities

- Strapi 5 plugin package structure
- plugin-owned `form` and `submission` content types
- multi-page form schema stored as structured JSON
- standard field types and configured choice lists
- draft/published/archived form lifecycle
- public form retrieval by slug
- public submission endpoint
- server-side required, email, number, and choice allow-list validation
- unknown submission-field stripping
- protected submission metadata fields
- Strapi admin menu registration
- English and Spanish admin translations
- React form renderer foundation
- validation tests
- GitHub Actions CI on Node 20 and 22

## API

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

The server validates submissions against the stored form definition. Client-side validation is never treated as a security boundary.

## React renderer

```tsx
import { CleverForm } from '@cleverforge/strapi-clever-forms/react';

export function ContactForm({ form }) {
  return <CleverForm form={form} />;
}
```

The renderer intentionally remains lightweight so applications can apply their own design system.

## Architecture

```text
Strapi
  |
  +-- CleverForms Core (MIT)
  |    +-- Form definitions
  |    +-- Submissions
  |    +-- Validation
  |    +-- Content API
  |    +-- Admin integration
  |    +-- React runtime
  |
  +-- Separate CleverForge commercial products
       +-- Forms Pro
       +-- Clever Connect
       +-- Clever AI
       +-- Clever Communications
       +-- Clever Analytics
       +-- Clever Payments
```

Commercial modules and hosted services are separate works and are not licensed by this repository merely because they interoperate with Core.

## Security

CleverForms treats all browser input as untrusted. Core validates accepted fields on the server, verifies configured choices, and strips unknown keys. Sensitive commercial capabilities such as private uploads, signed downloads, electronic signatures, rate limiting, bot protection, and credential-isolated integrations belong to later modules.

Report vulnerabilities privately as described in [SECURITY.md](SECURITY.md).

## Development

```bash
npm install
npm run typecheck
npm test
npm run build
npm run verify
```

The plugin uses the official Strapi Plugin SDK build and verification workflow.

## Roadmap

### Milestone 1 — Core Foundation

- [x] plugin package scaffold
- [x] Forms content type
- [x] Submissions content type
- [x] multi-page schema foundation
- [x] core field types
- [x] public form endpoint
- [x] submission endpoint
- [x] server-side validation
- [x] admin registration
- [x] English/Spanish translations
- [x] React renderer foundation
- [x] tests and CI
- [ ] full Strapi integration fixture application
- [ ] Marketplace publication

### Milestone 2 — Visual Builder

- [ ] form list/dashboard
- [ ] visual page builder
- [ ] field palette
- [ ] drag/reorder experience
- [ ] field editor
- [ ] preview
- [ ] basic conditional logic UI
- [ ] submission manager

### Later commercial modules

- Forms Pro: Save & Continue, signatures, PDFs, private uploads, workflows
- Clever Connect: Salesforce and other CRM/API connectors
- Clever AI: provider-neutral AI assistance
- Communications, Analytics, and Payments

## License

Strapi CleverForms Core is licensed under the MIT License. See [LICENSE](LICENSE).

MIT applies only to the source in this repository. CleverForge names, logos, marks, and separately distributed commercial products are not granted under the MIT license except as the license itself requires for included copyright notices.

## CleverForms family

- WordPress: `cleverforge/clever-forms-core`
- Payload CMS: `cleverforge/payload-clever-forms`
- Strapi: `cleverforge/strapi-clever-forms`

Built by [CleverForge](https://cleverforge.ai/).
