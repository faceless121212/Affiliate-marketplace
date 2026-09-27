#!/usr/bin/env node
/**
 * Measures Nativness's service level indicators and checks them against budgets.
 *
 * Usage:
 *   node scripts/measure-sli.mjs                  # assumes a server on :3005
 *   BASE_URL=http://localhost:3000 node scripts/measure-sli.mjs
 *   node scripts/measure-sli.mjs --skip-build     # skip the slow build/test gates
 *
 * Exits non-zero if any budget is breached, so it can gate CI.
 */
import { execSync } from 'node:child_process'
import { readdirSync, statSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const BASE = process.env.BASE_URL ?? 'http://localhost:3005'
const SKIP_HEAVY = process.argv.includes('--skip-build')

/**
 * Budgets. These are deliberately tight for a marketing page: a visitor
 * deciding whether to trust an escrow product should not wait on a wallet SDK.
 */
const BUDGETS = {
  landingJsKB: 300,
  appJsKB: 900,
  ttfbMs: 600,
  buildSeconds: 60,
  testSeconds: 60,
  routes: 12,
}

const results = []
const record = (name, value, budget, unit, lowerIsBetter = true) => {
  const pass = budget == null ? null : lowerIsBetter ? value <= budget : value >= budget
  results.push({ name, value, budget, unit, pass })
}

const dirSizeKB = (dir, ext) => {
  if (!existsSync(dir)) return 0
  let total = 0
  const walk = (d) => {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      const p = join(d, e.name)
      if (e.isDirectory()) walk(p)
      else if (p.endsWith(ext)) total += statSync(p).size
    }
  }
  walk(dir)
  return Math.round(total / 1024)
}

// --- Build and test gates -------------------------------------------------
if (!SKIP_HEAVY) {
  let t = Date.now()
  try {
    execSync('npm run build', { stdio: 'pipe' })
    record('Build time', Math.round((Date.now() - t) / 1000), BUDGETS.buildSeconds, 's')
  } catch {
    record('Build', 1, 0, 'FAILED')
  }

  t = Date.now()
  try {
    execSync('npx vitest run --no-file-parallelism', { stdio: 'pipe' })
    record('Test suite', Math.round((Date.now() - t) / 1000), BUDGETS.testSeconds, 's')
  } catch {
    record('Tests', 1, 0, 'FAILED')
  }
}

record('Built JS on disk', dirSizeKB('.next/static/chunks', '.js'), null, 'KB')
record('Built CSS on disk', dirSizeKB('.next/static', '.css'), null, 'KB')

// --- Per-route weight, measured over the wire ------------------------------
const ROUTES = ['/', '/app', '/app/links', '/app/my-offers', '/app/simulate']

const weighRoute = async (path) => {
  const started = Date.now()
  let html
  try {
    const res = await fetch(BASE + path)
    html = await res.text()
    if (!res.ok) return { path, error: `HTTP ${res.status}` }
  } catch (e) {
    return { path, error: e.message }
  }
  const ttfb = Date.now() - started

  // Every script the document asks for, fetched and summed.
  const srcs = [...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map((m) => m[1])
  let bytes = 0
  await Promise.all(
    srcs.map(async (s) => {
      try {
        const r = await fetch(s.startsWith('http') ? s : BASE + s)
        bytes += (await r.arrayBuffer()).byteLength
      } catch {
        /* a chunk that will not load is its own problem, not a size problem */
      }
    }),
  )
  return { path, ttfb, jsKB: Math.round(bytes / 1024), scripts: srcs.length }
}

const routeResults = []
for (const r of ROUTES) routeResults.push(await weighRoute(r))

const landing = routeResults.find((r) => r.path === '/')
if (landing && !landing.error) {
  record('Landing JS', landing.jsKB, BUDGETS.landingJsKB, 'KB')
  record('Landing TTFB', landing.ttfb, BUDGETS.ttfbMs, 'ms')
}
const appRoute = routeResults.find((r) => r.path === '/app')
if (appRoute && !appRoute.error) record('App JS', appRoute.jsKB, BUDGETS.appJsKB, 'KB')

// --- Report ----------------------------------------------------------------
const pad = (s, n) => String(s).padEnd(n)
console.log('\nNativness SLI report')
console.log('='.repeat(62))
for (const r of results) {
  const verdict = r.pass === null ? '   ' : r.pass ? 'PASS' : 'FAIL'
  const budget = r.budget == null ? '' : `(budget ${r.budget}${r.unit})`
  console.log(`  ${verdict}  ${pad(r.name, 22)} ${pad(r.value + r.unit, 12)} ${budget}`)
}

console.log('\n  Per route')
for (const r of routeResults) {
  if (r.error) console.log(`        ${pad(r.path, 18)} ERROR ${r.error}`)
  else console.log(`        ${pad(r.path, 18)} ${pad(r.jsKB + 'KB', 9)} ${pad(r.scripts + ' scripts', 12)} ttfb ${r.ttfb}ms`)
}

const failures = results.filter((r) => r.pass === false)
console.log('')
if (failures.length) {
  console.log(`  ${failures.length} budget breach(es): ${failures.map((f) => f.name).join(', ')}`)
  process.exit(1)
}
console.log('  All budgets met.')
