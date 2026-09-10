# Milestone 3 — Production UX and Extension Architecture

Milestone 3 prepares CleverForms Core for real-world use and for separately distributed commercial modules.

## Implemented in Core

- extension registry for custom fields
- extension registry for settings panels
- extension registry for form actions
- JSON form export/import utilities
- server-side form search and pagination
- server-side submission search and pagination
- form duplication endpoint
- submission detail endpoint
- strict separation between Core and commercial modules

## Extension API

Commercial or third-party modules may register capabilities without modifying the public Core repository.

```ts
import { cleverFormsExtensions } from '@cleverforge/strapi-clever-forms/strapi-admin'

cleverFormsExtensions.registerField({
  type: 'signature',
  label: 'Signature',
  group: 'Pro',
})

cleverFormsExtensions.registerSettingsPanel({
  id: 'salesforce',
  title: 'Salesforce',
  component: SalesforceSettings,
})

cleverFormsExtensions.registerFormAction({
  id: 'send-to-salesforce',
  label: 'Send to Salesforce',
  run: async ({ form, client }) => {
    // commercial module implementation
  },
})
```

## Commercial boundary

The registry is intentionally provider-neutral. Core exposes integration points, but the implementation of paid functionality belongs in separate packages such as:

- CleverForms Pro
- Clever Connect
- Clever AI
- Clever Communications
- Clever Analytics
- Clever Payments

## Remaining browser QA

The following require running Strapi Admin in a browser and are intentionally left as QA rather than source-code blockers:

- visual spacing and responsive behavior
- keyboard traversal
- focus management
- confirmation dialogs
- drag-and-drop ergonomics
- imported form workflow
- large submission dataset behavior

## Next milestone

Milestone 4 should focus on advanced workflow foundations that still belong in Core: conditional-rule engine normalization, form versioning, webhook extension contracts, event hooks, import/export schema validation, and a stable extension API before the first public beta.
