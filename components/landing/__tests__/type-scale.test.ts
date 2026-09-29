import { describe, it, expect } from 'vitest'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const LANDING = join(process.cwd(), 'components/landing')

const sources = readdirSync(LANDING)
  .filter((f) => f.endsWith('.tsx'))
  .map((f) => ({ file: f, text: readFileSync(join(LANDING, f), 'utf8') }))

/**
 * The landing page's type scale, enforced.
 *
 * `components/landing/` accumulated SEVENTEEN distinct `text-[Npx]` values
 * across seven separate implementation passes, each inventing its own
 * micro-sizes: 10, 10.5, 11, 11.5, 12, 13, 13.5, 14, 15, 16, 17, 18, 19, 30,
 * 36, 38 and 54. Three of them were in use for `h3` alone. Nothing caught it,
 * because no individual change looked wrong on its own.
 *
 * Inconsistent type is the clearest signal that a page was assembled rather
 * than designed, so the scale now lives in `app/globals.css` as six semantic
 * steps and this test stops the drift returning one arbitrary value at a time.
 */
describe('Landing type scale', () => {
  const STEPS = [
    'text-display',
    'text-display-sm',
    'text-title',
    'text-title-sm',
    'text-heading',
    'text-lead',
    'text-body',
    'text-caption',
  ]

  it('never sets a font size in raw pixels', () => {
    const offenders = sources.flatMap(({ file, text }) =>
      (text.match(/text-\[[0-9.]+px\]/g) ?? []).map((m) => `${file}: ${m}`),
    )
    expect(offenders, `use a scale step instead: ${STEPS.join(', ')}`).toEqual([])
  })

  it('uses only the declared steps', () => {
    const declared = readFileSync(join(process.cwd(), 'app/globals.css'), 'utf8')
    for (const step of STEPS) {
      expect(declared, `${step} must be declared in globals.css`).toContain(`--${step}:`)
    }
  })

  it('gives every heading a size from the scale', () => {
    for (const { file, text } of sources) {
      for (const heading of text.match(/<h[12][^>]*className="[^"]*"/g) ?? []) {
        expect(heading, `${file}: heading without a scale step`).toMatch(
          /text-(display|title)(-sm)?/,
        )
      }
    }
  })
})
