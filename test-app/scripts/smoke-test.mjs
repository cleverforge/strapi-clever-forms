const base = process.env.STRAPI_URL || 'http://127.0.0.1:1337'

async function check(path, options = {}) {
  const response = await fetch(`${base}${path}`, options)
  return { status: response.status, text: await response.text() }
}

const root = await check('/admin')
if (![200, 301, 302].includes(root.status)) {
  console.error('Admin route failed', root)
  process.exit(1)
}

const pluginRoute = await check('/api/clever-forms/forms/non-existent')
if (![404, 400].includes(pluginRoute.status)) {
  console.error('CleverForms route did not respond through Strapi', pluginRoute)
  process.exit(1)
}

console.log('CleverForms smoke test passed')
