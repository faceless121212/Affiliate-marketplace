import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs'
import path from 'node:path'

/**
 * The landing page's headline result is 509 KB -> 212 KB of JS, won by keeping
 * the Solana wallet adapter off it. `scripts/measure-sli.mjs` cannot see a
 * regression that arrives through prefetch, so nothing in CI would notice a
 * wallet import creeping back in. This makes it mechanical.
 *
 * Two layers: no landing file may import wallet code directly, and nothing
 * reachable from `app/page.tsx` through project imports may either, which is
 * how a shared component (say EscrowMeter) would smuggle it in.
 */
const ROOT = path.resolve(import.meta.dirname, '../../..')
const FORBIDDEN = /(^@solana\/|^@\/lib\/wallet(\/|$)|\/lib\/wallet(\/|$))/
const IMPORT_RE = /(?:import|export)\s+(?:type\s+)?(?:[^'"]*?\sfrom\s+)?['"]([^'"]+)['"]|import\(\s*['"]([^'"]+)['"]\s*\)/g
const EXTS = ['.tsx', '.ts', '/index.tsx', '/index.ts']

function specifiersIn(file: string): string[] {
  const source = readFileSync(file, 'utf8')
  return Array.from(source.matchAll(IMPORT_RE), (m) => m[1] ?? m[2])
}

function resolveProjectImport(spec: string, from: string): string | null {
  const base = spec.startsWith('@/')
    ? path.join(ROOT, spec.slice(2))
    : spec.startsWith('.')
      ? path.resolve(path.dirname(from), spec)
      : null
  if (!base) return null
  for (const ext of ['', ...EXTS]) {
    const candidate = base + ext
    if (existsSync(candidate) && statSync(candidate).isFile()) return candidate
  }
  return null
}

function landingSources(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) return entry.name === '__tests__' ? [] : landingSources(full)
    return /\.(tsx?|jsx?)$/.test(entry.name) ? [full] : []
  })
}

describe('landing page ships no wallet code', () => {
  const entries = [path.join(ROOT, 'app/page.tsx'), ...landingSources(path.join(ROOT, 'components/landing'))]

  it('scans a non-trivial set of landing files', () => {
    expect(entries.length).toBeGreaterThan(10)
  })

  it('imports nothing from @solana or lib/wallet, directly, under components/landing or in app/page.tsx', () => {
    const offenders = entries.flatMap((file) =>
      specifiersIn(file)
        .filter((spec) => FORBIDDEN.test(spec))
        .map((spec) => `${path.relative(ROOT, file)} imports ${spec}`),
    )
    expect(offenders).toEqual([])
  })

  it('reaches no wallet code transitively from app/page.tsx', () => {
    const seen = new Set<string>()
    const offenders: string[] = []
    const queue = [path.join(ROOT, 'app/page.tsx')]
    while (queue.length) {
      const file = queue.pop() as string
      if (seen.has(file)) continue
      seen.add(file)
      for (const spec of specifiersIn(file)) {
        if (FORBIDDEN.test(spec)) {
          offenders.push(`${path.relative(ROOT, file)} imports ${spec}`)
          continue
        }
        const resolved = resolveProjectImport(spec, file)
        if (resolved) queue.push(resolved)
      }
    }
    expect(seen.size).toBeGreaterThan(entries.length - 1)
    expect(offenders).toEqual([])
  })
})
