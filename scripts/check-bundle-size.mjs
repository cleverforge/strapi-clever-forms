import { readdirSync, statSync } from 'node:fs'
import { join, resolve } from 'node:path'

const adminDir = resolve('dist/admin')
const files = readdirSync(adminDir).filter((name) => /\.(?:js|mjs)$/.test(name))
const maxChunkBytes = 750 * 1024
const maxTotalBytes = 1500 * 1024

let total = 0
const oversized = []

for (const file of files) {
  const bytes = statSync(join(adminDir, file)).size
  total += bytes
  if (bytes > maxChunkBytes) oversized.push({ file, bytes })
}

if (oversized.length || total > maxTotalBytes) {
  const details = oversized.map(({ file, bytes }) => `${file}: ${(bytes / 1024).toFixed(1)} KiB`).join(', ')
  throw new Error(
    `Admin bundle size gate failed. Total ${(total / 1024).toFixed(1)} KiB (limit ${maxTotalBytes / 1024} KiB).` +
    (details ? ` Oversized chunks: ${details}` : '')
  )
}

console.log(`Admin bundle size passed: ${(total / 1024).toFixed(1)} KiB across ${files.length} JS module(s)`)
