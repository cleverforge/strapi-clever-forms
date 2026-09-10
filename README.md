# Clever Forms for Strapi

**Clever Forms** is a Strapi-native form builder and form runtime by CleverForge. The public Core is MIT licensed and designed to remain useful without requiring a commercial subscription.

> **Status:** pre-1.0 development. Current package version: `0.1.0-alpha.1`.

## Current Core foundation

- Strapi 5 plugin packaging
- Form and Submission plugin content types
- multi-page JSON form schema
- public form retrieval by slug
- server-side submission validation
- required, email, number, and configured-choice validation
- unknown-field stripping
- protected submission metadata handling
- admin plugin registration
- English and Spanish admin translations
- React renderer foundation
- tests and CI
- local Strapi 5 integration test app

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

## API foundation

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

All public input is validated again on the Strapi server.

## React renderer

```tsx
import { CleverForm } from '@cleverforge/strapi-clever-forms/react'

export function ContactPage({ form }) {
  return <CleverForm form={form} />
}
```

## Integration validation

This repository includes a clean Strapi 5 application under `test-app/` that consumes CleverForms using a local `file:..` dependency.

Run the release gate:

```bash
npm install
npm run typecheck
npm test
npm run build
npm run verify
node scripts/verify-package.mjs

cd test-app
npm install
npm run build
```

See `docs/MILESTONE-1.5.md` for the full boot and smoke-test flow.

## Product architecture

The public Core remains separate from commercial CleverForge products such as Forms Pro, Clever Connect, Clever AI, Communications, Analytics, and Payments.

## License

MIT. See `LICENSE`.
