// Generates the Nativness icon set via fal.ai (Recraft v3 -> SVG).
// Reads FAL_KEY from the environment; never hardcode a key here.
// Run: FAL_KEY=... node scripts/generate-icons.mjs
import { writeFile } from 'node:fs/promises'

const KEY = process.env.FAL_KEY
if (!KEY) {
  console.error('FAL_KEY is not set. Put it in .env.local (gitignored) or pass it inline.')
  process.exit(1)
}

// One shared style clause so the set reads as a family, not seven unrelated drawings.
const STYLE =
  'Single-colour flat line icon, uniform 8% stroke weight, rounded caps, geometric and ' +
  'minimal, centred with generous margin, transparent background, no text, no letters, ' +
  'no gradient, no shadow, no drop shadow, no 3D, no perspective.'

const JOBS = [
  { name: 'mark', prompt: `A closed padlock whose body is a solid rectangle and whose shackle is a thick semicircle, with a single horizontal slot across the body suggesting a ledger line. ${STYLE}` },
  { name: 'ecommerce', prompt: `A simple open shipping carton seen from the front, flaps folded outward. ${STYLE}` },
  { name: 'igaming', prompt: `A single playing-card suit spade inside a rounded square frame. ${STYLE}` },
  { name: 'dating', prompt: `Two overlapping speech bubbles, the smaller one containing a small heart. ${STYLE}` },
  { name: 'saas', prompt: `Three stacked horizontal server layers with a small dot on the left of each layer. ${STYLE}` },
  { name: 'finance', prompt: `A bar chart of three ascending vertical bars with a short arrow above the tallest. ${STYLE}` },
  { name: 'other', prompt: `Four small squares arranged in a two-by-two grid with equal gaps. ${STYLE}` },
]

async function one({ name, prompt }) {
  const res = await fetch('https://fal.run/fal-ai/recraft/v3/text-to-image', {
    method: 'POST',
    headers: { Authorization: `Key ${KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt,
      image_size: { width: 1024, height: 1024 },
      style: 'vector_illustration',
    }),
  })
  if (!res.ok) throw new Error(`${name}: HTTP ${res.status} ${await res.text()}`)
  const { images } = await res.json()
  const url = images?.[0]?.url
  if (!url) throw new Error(`${name}: no image in response`)
  const svg = await (await fetch(url)).text()
  const path = `public/icons/${name}.svg`
  await writeFile(path, svg)
  console.log(`  ${path}  ${(svg.length / 1024).toFixed(1)} KB`)
}

for (const job of JOBS) {
  try { await one(job) } catch (e) { console.error(`  FAILED ${job.name}: ${e.message}`) }
}
