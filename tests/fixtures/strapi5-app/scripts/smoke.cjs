const fs = require('node:fs');
const path = require('node:path');
const { createStrapi } = require('@strapi/strapi');

async function main() {
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_FILENAME = path.join(process.cwd(), '.tmp/smoke.db');

  const distDir = path.join(process.cwd(), 'dist');
  const databaseConfig = path.join(distDir, 'config', 'database.js');
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');

  if (!fs.existsSync(databaseConfig)) {
    throw new Error(
      'Strapi fixture was not compiled. Expected dist/config/database.js. Run npm run build before npm run smoke.'
    );
  }

  fs.mkdirSync(uploadsDir, { recursive: true });

  const app = createStrapi({ appDir: process.cwd(), distDir });
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

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
