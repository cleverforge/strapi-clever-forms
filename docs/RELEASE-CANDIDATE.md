# Release Candidate Checklist

CleverForms for Strapi is released as a fully free MIT-licensed Core plugin. This checklist is the release gate for npm and Strapi Marketplace preparation.

## Automated gate

Run:

```bash
npm install
npm run validate:marketplace
```

This verifies TypeScript, unit tests, plugin builds, Strapi package structure, the npm tarball, runtime dependency audit, and installation from the packed artifact, and an admin-bundle size regression gate.

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
- Design System and styled-components remain host-provided peer dependencies rather than being bundled into the plugin
- Runtime dependency audit has no release-blocking findings
- Fresh packed-artifact installation passes
- Admin JavaScript stays below the automated release size limits
- Version and release notes match the npm package
- Marketplace screenshots and listing copy reflect only functionality actually shipped

## Commercial boundary

The Strapi package remains free Core. Generic extension APIs may remain for interoperability and future compatibility, but current Strapi functionality must not depend on a paid CleverForge service or external entitlement. Future commercial Strapi products should only be introduced if Strapi's rules at that time permit them.

## 1.0 release promotion

The current release-candidate line must pass the automated and real-Strapi gates before promotion. Do not publish or tag `1.0.0` merely because the source build succeeds. Promote the package only after the packed artifact installs cleanly, the fixture builds and boots, the runtime audit passes, and the release worktree is clean.
