# Release Candidate Checklist

CleverForms for Strapi is released as a fully free MIT-licensed Core plugin. This checklist is the release gate for npm and Strapi Marketplace preparation.

## Automated gate

Run:

```bash
npm install
npm run validate:marketplace
```

This verifies TypeScript, unit tests, plugin builds, Strapi package structure, the npm tarball, runtime dependency audit, and installation from the packed artifact.

## Real Strapi 5 gate

```bash
cd tests/fixtures/strapi5-app
npm install
rm -rf dist .tmp
npm run build
npm run smoke
```

The smoke test must report that CleverForms and its Core APIs are registered.

## Manual release review

- Public GitHub repository and public npm package
- MIT license
- No license keys, entitlements, paywalls, or premium runtime code in the Strapi package
- README installation and public API instructions are current
- Strapi is a peer dependency
- Admin UI uses Strapi Design System v2
- Runtime dependency audit has no release-blocking findings
- Fresh packed-artifact installation passes
- Version and release notes match the npm package
- Marketplace screenshots and listing copy reflect only functionality actually shipped

## Commercial boundary

The Strapi package remains free Core. Generic extension APIs may remain for interoperability and future compatibility, but current Strapi functionality must not depend on a paid CleverForge service or external entitlement. Future commercial Strapi products should only be introduced if Strapi's rules at that time permit them.
