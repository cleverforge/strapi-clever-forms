# Strapi 5 compliance and milestone status

This repository is a native Strapi 5 implementation of CleverForms. It is not a direct runtime port of the WordPress or Payload plugins.

## Milestone 1 — Core foundation

Implemented:

- official Strapi Plugin SDK package entry points (`strapi-admin` and `strapi-server`)
- plugin-owned `form` and `submission` collection types
- Strapi 5 Document Service API for document reads and writes
- Strapi 5 Draft & Publish as the publication source of truth
- separate `lifecycle` field only for active/archive business state
- content-api routes for public form retrieval and submission
- server-side field validation and choice allow-list validation
- protected/private submission metadata fields
- Strapi Admin plugin/menu registration
- Strapi Design System v2-compatible dependency baseline
- English and Spanish admin translations
- React runtime export
- unit tests and CI

## Milestone 1.5 — Integration and release validation

Implemented:

- `strapi-plugin verify`
- npm package dry-run validation
- release validation command
- real Strapi 5 fixture application using SQLite
- fixture installs CleverForms using the package's local `file:` dependency
- fixture production admin build
- Strapi boot smoke test
- smoke assertions for plugin, content types, controller, and service registration
- Node 20 and Node 22 core CI matrix
- Node 22 Strapi fixture CI

## Strapi-native decisions

### Document Service

Strapi 5's Document Service API is used instead of Strapi v4 Entity Service patterns. Public form lookup asks Strapi specifically for the published document version.

### Draft & Publish

CleverForms does not duplicate Strapi publication state. `publishedAt`/Document Service publication status is authoritative. The plugin's `lifecycle` attribute means only `active` or `archived`.

### Plugin routes

Public endpoints are registered as `content-api` plugin routes. They do not expose submission-listing or administrative APIs publicly.

### Admin UI

The admin entry point uses Strapi 5 admin types and `@strapi/icons`. Visual-builder work must use Strapi Design System v2 components.

### Commercial boundary

Marketplace Core remains free and MIT licensed. Paid CleverForge products must be separate packages/services and must not disable or paywall features inside the Marketplace-listed Core while current Strapi Marketplace rules prohibit that behavior.

## Release gate

A release candidate is acceptable only when all of these pass:

```bash
npm run validate:release
cd tests/fixtures/strapi5-app
npm install
npm run build
npm run smoke
```

Marketplace submission additionally requires publication to a public npm registry and the current Strapi Marketplace business/security review.
