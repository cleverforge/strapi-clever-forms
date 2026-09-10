# Security Policy

## Reporting a vulnerability

Do not disclose exploitable security issues in a public GitHub issue.

Please report suspected vulnerabilities privately to CleverForge through the security contact published on https://cleverforge.ai/ or through GitHub private vulnerability reporting when enabled for this repository.

Include the affected version, reproduction conditions, impact, and any suggested remediation. Avoid including real user data, credentials, access tokens, or production secrets.

## Security model

CleverForms treats all form submissions as untrusted input. Server-side validation is authoritative. Browser validation is only a user-experience aid.

Core currently enforces configured required fields, email/number validation, configured choice allow-lists, and unknown-field stripping before persistence. Sensitive metadata fields are marked private in Strapi.

Future modules handling files, signatures, payments, AI providers, webhooks, or external credentials will require additional threat modeling and controls before production release.
