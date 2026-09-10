# Milestone 2 — Visual Form Builder

Milestone 2 adds the first usable Strapi Admin authoring experience for CleverForms.

## Implemented

- Forms dashboard
- Create form flow
- Edit existing form flow
- Draft save
- Publish action
- Multi-page forms
- Add-page controls
- Field palette
- Field reordering controls
- Field property editor
- Required-field configuration
- Placeholder and help-text configuration
- Select/radio/multiselect option editing
- Preview mode
- Submission listing
- Provider-neutral Settings surface
- Authenticated admin CRUD routes
- Strapi 5 Document Service persistence

## Field palette

Core currently exposes:

- text
- textarea
- email
- number
- telephone
- select
- radio
- checkbox
- multiselect
- date
- time
- heading
- paragraph
- hidden

Each field receives a stable internal ID and machine-readable field name. Choice fields persist an explicit label/value allow-list that the public runtime validates again on the server.

## Builder architecture

The admin application talks only to authenticated plugin admin routes. Public websites continue to use the separate Content API routes. This prevents form-authoring operations from being mixed with public submission traffic.

```text
Strapi Admin
   |
   +-- /clever-forms/forms
   +-- /clever-forms/submissions
   |
   v
CleverForms admin controller
   |
   v
Strapi 5 Document Service

Public website
   |
   +-- /api/clever-forms/forms/:slug
   +-- /api/clever-forms/forms/:slug/submissions
```

## Commercial extension boundary

Core keeps the settings and field model extensible, but proprietary functionality is not embedded behind disabled buttons. Future commercial packages should register their own capabilities through explicit extension points.

Planned commercial surfaces include:

- Forms Pro: advanced conditional logic, branching, Save & Continue, uploads, signatures, PDF generation, approvals
- Clever Connect: Salesforce and other integrations
- Clever AI: AI-assisted authoring and submission processing
- Communications: email and SMS workflows
- Analytics: conversion, abandonment and field analytics
- Payments: payment provider workflows

## Manual QA still required

The code can be authored and reviewed remotely, but the following should be validated in a browser before a stable release:

1. Strapi Admin renders the CleverForms menu.
2. Create Form opens correctly.
3. Fields can be added and reordered.
4. Field settings persist after save/reload.
5. Multiple pages persist.
6. Preview reflects the form definition.
7. Draft save persists through Strapi.
8. Publish creates a publicly retrievable form.
9. A public submission appears in the Submissions screen.
10. Responsive layout and accessibility are checked at common viewport sizes.

## Next development milestone

Milestone 3 should focus on production builder quality rather than commercial features: reusable admin components, proper Strapi Design System controls, accessible drag-and-drop, destructive-action confirmation, form duplication, search/filtering, pagination, submission detail view, JSON import/export, and extension registration APIs.
