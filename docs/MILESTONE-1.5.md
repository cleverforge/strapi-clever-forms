# Milestone 1.5 — Integration and Release Validation

This milestone proves that the public CleverForms package can be consumed by a real Strapi 5 application before visual-builder work begins.

## Scope

- local installation into a clean Strapi 5 test app
- plugin enablement through `config/plugins.ts`
- SQLite-backed boot environment
- package structure verification
- plugin build and Strapi SDK verify commands
- Node.js 20 and 22 CI coverage
- test-app production build
- smoke-test script for `/admin` and CleverForms API routing

## Local validation

From the repository root:

```bash
npm install
npm run typecheck
npm test
npm run build
npm run verify
node scripts/verify-package.mjs
```

Then:

```bash
cd test-app
npm install
npm run build
npm run develop
```

In another terminal:

```bash
cd test-app
npm run test:smoke
```

## Release gate

Milestone 1.5 is considered complete when CI passes for Node 20 and Node 22 and the test application builds with the local CleverForms package enabled.

A public npm prerelease should only be published after these checks pass.
