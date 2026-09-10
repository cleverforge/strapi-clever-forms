const path = require('node:path');
const { createStrapi } = require('@strapi/strapi');

async function main() {
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_FILENAME = path.join(process.cwd(), '.tmp/smoke.db');

  const app = createStrapi({ appDir: process.cwd(), distDir: path.join(process.cwd(), 'dist') });
  await app.load();

  const plugin = app.plugin('clever-forms');
  if (!plugin) throw new Error('CleverForms plugin was not registered by Strapi 5');
  if (!plugin.contentTypes?.form) throw new Error('CleverForms form content type was not registered');
  if (!plugin.contentTypes?.submission) throw new Error('CleverForms submission content type was not registered');
  if (!plugin.controllers?.public) throw new Error('CleverForms public controller was not registered');
  if (!plugin.services?.form) throw new Error('CleverForms form service was not registered');

  console.log('Strapi 5 smoke test passed: CleverForms plugin and core APIs are registered.');
  await app.destroy();
}

main().catch(async (error) => {
  console.error(error);
  process.exitCode = 1;
});
