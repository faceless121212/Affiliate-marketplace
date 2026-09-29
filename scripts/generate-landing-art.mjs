// Generates the landing page's two atmospheric assets via fal.ai.
// Reads FAL_KEY from the environment; never hardcode a key here.
//
// Run:  FAL_KEY=... node scripts/generate-landing-art.mjs
//   or: put FAL_KEY in .env.local (gitignored) and use `npm run art`
//
// WHY ONLY TWO ASSETS
//
// This project already tried generating its icon set (see scripts/generate-icons.mjs
// and the docblock in components/ui/LandingIcon.tsx): roughly 30 generations across
// four styles produced 16-50KB files with inconsistent stroke weight that turned to
// mush at 20px. The hand-authored glyphs that replaced them are ~200 bytes each,
// inline, and perfectly consistent. That result stands.
//
// The rule this script works to: generate ATMOSPHERE, never INFORMATION. Anything
// carrying meaning a reader must decode stays hand-made. What generation is good at
// is material, light and texture, which is exactly what the page lacks.
//
// Flux, not Recraft: Recraft's vector styles are built for flat illustration, which
// is the thing we are deliberately not making. Flux renders light and material.

import { mkdir, writeFile } from 'node:fs/promises'

const KEY = process.env.FAL_KEY
if (!KEY) {
  console.error(
    'FAL_KEY is not set.\n' +
      'Put it in .env.local (already gitignored) as FAL_KEY=... or pass it inline:\n' +
      '  FAL_KEY=... node scripts/generate-landing-art.mjs',
  )
  process.exit(1)
}

// One shared negative clause. Every one of these is a way the image could stop being
// atmosphere and start being a claim, a cliche, or a thing a reader tries to read.
const NEVER =
  'No text, no letters, no numbers, no logos, no watermark. No people, no faces, no hands. ' +
  'No objects, no products, no devices, no screens. No charts, no graphs, no arrows, no icons. ' +
  'No coins, no currency symbols, no padlocks, no shields, no chains, no blockchain imagery, ' +
  'no circuit boards, no network node diagrams, no glowing grids, no futuristic HUD. ' +
  'Not an illustration, not a diagram, not clip art, not stock art.'

const JOBS = [
  {
    name: 'hero-light',
    // The page's one signature visual. It currently is a blurred CSS radial that reads
    // as a rendering artifact rather than a decision. It sits behind the hero's right
    // column, bleeding off the right edge, under `overflow-hidden`. It is decorative
    // only and must never carry information: text lives in the left column, clear of it.
    prompt:
      'An abstract field of soft volumetric light falling through frosted glass onto a ' +
      'white surface. A single broad sweep of acid lime-yellow light bends across the ' +
      'upper right, dissolving into clean white at the edges. Smooth continuous gradients, ' +
      'gentle caustic edges where the light refracts, deep matte black in one small ' +
      'corner for weight. Photographic, physically lit, shallow depth. Calm and expensive, ' +
      'not energetic. Mostly empty white space. ' +
      NEVER,
    width: 1536,
    height: 1536,
    file: 'public/art/hero-light.webp',
  },
  {
    name: 'grain',
    // Tiles across the tinted section bands. The bands are currently flat 5-7% washes;
    // this gives them material quality. It must be nearly invisible on its own: it is
    // applied at low opacity and multiplied over the existing tint, so any structure
    // the eye can lock onto will read as dirt rather than paper.
    prompt:
      'An extreme close-up of uncoated white paper fibre. Fine, even, isotropic grain ' +
      'with no direction and no repeating pattern. Flat even lighting, no vignette, ' +
      'no highlight, no shadow, no focal point. Almost pure white, the texture visible ' +
      'only as the faintest tonal variation. Seamless, uniform across the whole frame. ' +
      NEVER,
    width: 512,
    height: 512,
    file: 'public/art/grain.webp',
  },
]

async function generate({ name, prompt, width, height, file }) {
  process.stdout.write(`  ${name} ... `)
  const res = await fetch('https://fal.run/fal-ai/flux/dev', {
    method: 'POST',
    headers: { Authorization: `Key ${KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt,
      image_size: { width, height },
      num_inference_steps: 40,
      guidance_scale: 3.5,
      num_images: 1,
      enable_safety_checker: true,
      output_format: 'webp',
    }),
  })

  if (!res.ok) throw new Error(`${name}: HTTP ${res.status} ${await res.text()}`)

  const { images } = await res.json()
  const url = images?.[0]?.url
  if (!url) throw new Error(`${name}: no image in response`)

  const bytes = Buffer.from(await (await fetch(url)).arrayBuffer())
  await writeFile(file, bytes)

  const kb = bytes.length / 1024
  console.log(`${file}  ${kb.toFixed(0)} KB`)

  // The landing page measures 252KB of JS against a 300KB budget. Images are not JS,
  // but they are still page weight a visitor pays for, so an oversized asset is a
  // finding rather than a detail.
  if (kb > 200) {
    console.log(`    WARNING: ${kb.toFixed(0)}KB is heavy for a decorative asset.`)
    console.log('    Consider re-running at a smaller size, or compressing before use.')
  }
  return { name, file, kb }
}

await mkdir('public/art', { recursive: true })
console.log('Generating landing art via fal.ai (flux/dev)\n')

const results = []
for (const job of JOBS) {
  // Sequential on purpose: a failure should stop before spending the next generation.
  results.push(await generate(job))
}

console.log('\nDone. Review both images before wiring them in:')
for (const r of results) console.log(`  ${r.file}  ${r.kb.toFixed(0)} KB`)
console.log(
  '\nIf the hero image reads as an object, a diagram, or anything a viewer tries to\n' +
    'decode rather than feel, it is wrong for this page. Re-run rather than ship it:\n' +
    'a landing page for a trust product cannot afford art that looks generated.',
)
