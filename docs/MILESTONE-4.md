# Milestone 4 — Stable Core API and Workflow Engine

Milestone 4 establishes the public contracts that future CleverForge commercial modules can depend on without importing internal plugin implementation details.

## Versioned contracts

Core exports:

```ts
import {
  CLEVER_FORMS_SCHEMA_VERSION,
  CLEVER_FORMS_EXTENSION_API_VERSION,
} from '@cleverforge/strapi-clever-forms/core'
```

Current versions:

- form schema: `1`
- extension API: `1`

Breaking schema or extension changes require a major compatibility decision and migration path rather than silent mutation.

## Stable form schema

The public `CleverFormSchema` contains:

- schema version
- extension API version
- form version
- identity and slug
- draft/published/archived status
- authentication requirement
- pages
- fields
- options
- conditional logic
- confirmation configuration
- provider-neutral settings

## Conditional logic

Core supports nested AND/OR groups and these operators:

- `eq`
- `neq`
- `contains`
- `notContains`
- `startsWith`
- `endsWith`
- `gt`
- `gte`
- `lt`
- `lte`
- `isEmpty`
- `isNotEmpty`
- `in`
- `notIn`

The evaluator is provider-neutral and can be used by admin preview, React rendering, validation, and commercial workflow packages.

## Import and compatibility

`parseCleverFormSchema()` validates schema version 1.

`normalizeLegacyForm()` upgrades pre-versioned Core form JSON into the version 1 envelope where possible.

Unknown future schema versions fail explicitly instead of being interpreted as current data.

## Submission envelope

Submission workflows use a stable envelope containing:

- form document ID
- form version
- form schema version
- submitted timestamp
- submission data

This allows historic submissions to remain associated with the schema version under which they were collected.

## Lifecycle events

The public lifecycle registry supports these initial events:

- `form.beforeCreate`
- `form.afterCreate`
- `form.beforeUpdate`
- `form.afterUpdate`
- `form.beforePublish`
- `form.afterPublish`
- `submission.beforeValidate`
- `submission.afterValidate`
- `submission.beforeCreate`
- `submission.afterCreate`

Commercial modules should subscribe through the registry rather than patch Core controllers.

## Action registry

Provider-specific workflows register action handlers by ID. Examples could include:

- `clever-connect.salesforce.upsert`
- `clever-communications.email.send`
- `clever-ai.submission.classify`
- `clever-payments.stripe.create-payment`

Core only owns the registry and execution contract. Credentials and proprietary implementation remain outside this repository.

## Stability rules

1. Public types under `@cleverforge/strapi-clever-forms/core` are compatibility-sensitive.
2. Internal admin and server files are not public extension contracts unless documented here.
3. New optional properties may be added in backwards-compatible releases.
4. Renaming/removing public fields requires a migration strategy.
5. New schema versions require explicit parsers/migrations.
6. Commercial modules must declare the extension API version they support.
7. Core must never silently send submission data to third-party services.

## Milestone result

After Milestone 4, paid packages can target a documented Core API instead of depending on unstable implementation files.
