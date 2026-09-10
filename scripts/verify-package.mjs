import { existsSync, readFileSync } from 'node:fs'

const required = [
  'package.json',
  'README.md',
  'LICENSE',
  'SECURITY.md',
  'CONTRIBUTING.md',
  'server/src/index.ts',
  'admin/src/index.ts',
]

for (const file of required) {
  if (!existsSync(file)) {
    console.error(`Missing required file: ${file}`)
    process.exit(1)
  }
}

const pkg = JSON.parse(readFileSync('package.json', 'utf8'))
if (pkg.name !== '@cleverforge/strapi-clever-forms') {
  console.error('Unexpected package name')
  process.exit(1)
}
if (pkg.license !== 'MIT') {
  console.error('Marketplace package must use MIT')
  process.exit(1)
}
if (!pkg.exports?.['./strapi-admin'] || !pkg.exports?.['./strapi-server']) {
  console.error('Missing Strapi plugin exports')
  process.exit(1)
}

console.log('Package structure verification passed')
