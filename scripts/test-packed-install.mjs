import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

const root = resolve(process.cwd())
const work = mkdtempSync(join(tmpdir(), 'cleverforms-packed-'))

try {
  const packed = execFileSync('npm', ['pack', '--json'], { cwd: root, encoding: 'utf8' })
  const packInfo = JSON.parse(packed)[0]
  const tarball = join(root, packInfo.filename)

  writeFileSync(join(work, 'package.json'), JSON.stringify({
    name: 'cleverforms-packed-consumer',
    version: '0.0.0',
    private: true,
    dependencies: {
      '@cleverforge/strapi-clever-forms': `file:${tarball}`,
      '@strapi/strapi': '5.55.0',
      'better-sqlite3': '^11.0.0',
      react: '^18.3.1',
      'react-dom': '^18.3.1',
      'react-router-dom': '^6.30.0',
      'styled-components': '^6.1.0'
    }
  }, null, 2))

  execFileSync('npm', ['install', '--ignore-scripts'], { cwd: work, stdio: 'inherit' })
  const installed = JSON.parse(readFileSync(join(work, 'node_modules/@cleverforge/strapi-clever-forms/package.json'), 'utf8'))

  if (installed.version !== packInfo.version) {
    throw new Error(`Packed install version mismatch: expected ${packInfo.version}, got ${installed.version}`)
  }

  for (const entry of ['strapi-admin', 'strapi-server', 'react', 'core']) {
    const key = `./${entry}`
    if (!installed.exports?.[key]) throw new Error(`Missing packed export: ${key}`)
  }

  console.log(`Packed artifact install passed: ${installed.name}@${installed.version}`)
} finally {
  rmSync(work, { recursive: true, force: true })
}
