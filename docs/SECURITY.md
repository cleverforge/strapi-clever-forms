# Security and product boundary

CleverForms for Strapi is the free, MIT-licensed Core product.

## Security baseline

The Core release gate requires:

- zero known runtime dependency vulnerabilities at the configured npm audit threshold
- Strapi 5 typecheck, unit tests, Plugin SDK build, package verification, and pack dry run
- a real Strapi 5 fixture build and boot smoke test
- server-side allow-list validation for submitted fields and configured choices
- bounded JSON submission size, field count, nesting, string length, and array length
- rejection of prototype-pollution property names
- server-owned submission metadata
- explicit public-form serialization
- private submission metadata attributes
- granular Strapi Admin RBAC permissions

Development/fixture dependency advisories inherited from Strapi are tracked separately from the CleverForms runtime gate. Do not run `npm audit fix --force` when it proposes a Strapi 4 downgrade or another breaking dependency change.

## Strapi commercial boundary

The Strapi package must remain fully useful without a subscription, license key, entitlement check, remote paywall, or disabled premium capability.

CleverForge's broader product roadmap may include commercial products on platforms and distribution channels that permit them. Generic extension hooks may remain in Core because they are useful to free/open integrations too. The Strapi package must not ship active licensing, entitlement, plan-gating, or paid-module runtime code unless future Strapi rules explicitly permit that distribution model and the implementation is reviewed again before release.

This boundary deliberately preserves future architectural flexibility without advertising unavailable paid functionality as part of the current Strapi package.
