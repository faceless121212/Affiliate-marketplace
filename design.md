# Landing page redesign

**Status:** IMPLEMENTED and shipped to `main`. Everything below section 13 describes
what the page is now, not a proposal.
**Date:** 2026-09-29, status corrected 2026-10-03
**Scope:** `app/page.tsx` and `components/landing/` only. No app screens, no design tokens, no dark mode.

---

## 1. The problem, measured

The landing page reads as "text under text". That is not a copy problem and rewording will not fix it. The cause is structural and measurable:

```
$ grep -h 'mx-auto.*max-w-6xl.*px-4 py-16' components/landing/*.tsx | sort | uniq -c
   5 <div className="mx-auto max-w-6xl px-4 py-16">
   1 <div className="mx-auto grid max-w-6xl gap-8 px-4 py-16 lg:grid-cols-2">
   1 <div className="mx-auto max-w-2xl px-4 py-16 text-center">
   1 <section data-testid="hero" className="mx-auto max-w-6xl px-4 py-16 lg:py-20">
```

**Eight sections, one container.** Same max width, same padding, same vertical rhythm, same centred alignment, each separated by an identical `border-t border-line`. No section has a different shape from its neighbour, so the eye has nothing to catch on and the page reads as one undifferentiated column.

Three secondary contributors, all confirmed by measurement in the browser:

| Finding | Measured |
|---|---|
| H3 is the same size as body text | Both 15px. Only `font-weight` separates a heading from a paragraph. |
| No elevation anywhere | Every card is a 1px `border-line` (#F0F0F0) on `surface` (#FAFAFA) — a 1.02:1 edge. Cards do not read as objects. |
| The product is described, never shown | `EscrowMeter`, `OfferCard` and the simulate flow all exist in the codebase. The landing page spends eight text sections narrating a mechanic the app can simply perform. |

## 2. Research

Four reference pages inspected live at 1440×900 (Stripe, Linear, Squads, Mercury), cross-checked against current pattern literature.

| Pattern | Stripe | Linear | Squads | Mercury | Nativness today |
|---|---|---|---|---|---|
| Asymmetric hero (text left, visual right) | yes | yes | yes | — | no, centred `max-w-2xl` |
| Signature full-bleed visual | gradient ribbon | product shot | dark grid + device | photography | none |
| Bento grid, unequal cell sizes | yes | yes | yes | yes | no, equal 3-col rows |
| Real product UI as the artwork | yes | yes | yes | yes | no, prose only |
| Asymmetric type split (large heading left, small body right) | — | yes | yes | — | no |
| Sections of varying width and rhythm | yes | yes | yes | yes | no, 8 identical |

**The conclusion specific to this product:** every reference site shows its product working. Nativness is the only one that only talks about it — while owning a mechanic that is inherently visual (a balance that visibly drains) and already built.

## 3. Decisions locked

Chosen by the owner before design began:

1. **Scope: layout restructure plus a live demo.** No change to the colour system, no new visual identity, no dark mode.
2. **Canvas: light, with depth added.** Stay on white; stop it being flat via elevation, full-bleed tinted bands and one signature glow.
3. **Hero visual: a live escrow demo** built from real seed data, not a static screenshot and not an abstract diagram.

**Non-goals.** Dark mode. New brand identity. Changes to any `/app` screen. New colour tokens. Scroll-driven storytelling or parallax. Any claim, figure or logo the page cannot source.

## 4. Governing rule

> **No two adjacent sections share a shape.**

"Shape" means the pair of *layout archetype* and *container treatment*. Vertical rhythm is one lever for varying shape, not the definition of it: sections 2 and 3 both sit at 92px padding, but one is a full-bleed tinted rail and the other a contained bento grid, so they read as different objects. Sections 2 and 3 in today's page are the same archetype in the same container at the same rhythm, which is the actual defect.

This is the rule the implementation is checked against, and it is what a test should assert.

## 5. Architecture

Eight sections become six. Two of today's sections duplicate each other (`WhyNativness` "See the money before you commit" vs `WhatYouGet` "See offer balances") and one (`WhyEscrow`, 194px) is a stub carrying two lines.

| # | Section | Archetype | Container | Rhythm | Source |
|---|---|---|---|---|---|
| 1 | Hero | Asymmetric split 1.05fr / 0.95fr, demo right | `max-w-6xl` | `py-22` (88px) | rewrite `Hero.tsx` |
| 2 | How payouts happen | Full-bleed tinted band, horizontal rail | full-bleed, inner `max-w-6xl` | `py-23` (92px) | rewrite `HowItWorks.tsx` |
| 3 | One wallet, both sides | Bento grid, unequal cells | `max-w-6xl` | `py-23` (92px) | **merge** `WhyNativness` + `WhatYouGet` |
| 4 | Nobody has fixed affiliate trust | Type split, 0.82fr / 1.18fr | `max-w-6xl`, tinted full-bleed | `py-22` (88px) | restructure `Problem.tsx` |
| 5 | Market | Thin stat band, horizontal | `max-w-6xl`, tinted full-bleed | `py-10` (40px) | rewrite `Market.tsx` |
| 6 | Get started | Centred — the only centred section | `max-w-2xl` | `py-23` (92px) | keep `GetStarted.tsx` |

Measured heights in the approved template: 534 / 416 / 631 / 486 / **130** / 441 px. Total **2,811px**, against 3,332px today — shorter while showing more. The 130px band beside a 631px bento is the rhythm the current page lacks.

### 5.1 Hero

Left column (1.05fr): h1 at 54px desktop / 38px mobile, a two-sentence lead capped at `30em`, then the primary lime CTA with the ghost "Browse offers" beside it, then a trust row of three figures above a hairline rule.

Right column (0.95fr): `<LiveEscrowDemo />`, see §6.

A radial lime glow sits behind the right column, bleeding off the right edge, `overflow:hidden` on the section. This is the page's one signature visual. It is decoration and must never carry information.

The trust row states only facts the page can source: total escrow locked across seed offers (computed, as the current counter already is), the seed offer count, and "Instant — payout on confirm" (a product property, not a metric).

### 5.2 How payouts happen

Full-bleed `bg-surface`, breaking the `max-w-6xl` rule that every other section obeys. Three steps sit on a horizontal rail: a 2px line behind numbered 40px discs, lime for steps 01 and 02, outlined for 03. Each disc carries a 7px ring in the band's own background colour so the rail appears to pass behind it.

On mobile the rail is hidden and the steps stack.

### 5.3 Bento

Four-column grid, `auto-rows` 174px.

- One **2×2** cell, on `canvas` not `surface` and carrying more elevation, holding a miniature of the Browse grid: three compact offer rows with avatar, name, escrow figure and a small fill bar. This is the "real product UI as artwork" pattern, using real seed data.
- Two **1×1** cells.
- One **2×1** wide cell.

Cells use the existing hand-authored `LandingIcon` glyphs. The template's emoji are placeholders and must not ship.

On `<900px` the grid becomes two columns and the big cell spans both.

### 5.4 Problem

Heading pinned left at 0.82fr, 38px, with a one-line subhead. The three sourced facts stack on the right at 1.18fr, each with its source line. Full-bleed `bg-depleted/5` band.

Every fact keeps its attribution. The existing `landing.test.tsx` assertion that each claim names a source carries over unchanged.

### 5.5 Market

A thin horizontal band at `py-10` (40px), deliberately a quarter the height of its neighbours. Two figures inline with their captions and sources, plus the "Channel figures, not a forecast" note pushed right.

### 5.6 Get started

Unchanged in content. It becomes the only centred section on the page, which is what gives centring meaning. The persona picker keeps the "Browse offers" / "List an offer" labels and the 1:1 label-to-destination property already asserted in tests.

## 6. `LiveEscrowDemo`

A new client component, `components/landing/LiveEscrowDemo.tsx`.

**Behaviour.** Renders one real seed offer. On a timer, escrow decrements by the offer's commission; the fill bar animates down; "Covers N conversions" recounts; a payout event appears for ~2s. When the remainder can no longer cover one commission, it resets to the starting value.

**Construction.** Reuses `EscrowMeter` and the existing `Money` component rather than reimplementing them, so the demo and the app cannot drift apart. It reads `SEED_OFFERS` from `@/lib/store` — the same data `/app` serves.

**Honesty.** The panel is labelled "Live demo marketplace" in its header and "Real data from the demo marketplace. Escrow is simulated in Phase 1." in its footer. It must never imply on-chain settlement, real advertisers or real payouts. This carries the Phase 1 disclosure constraint that already governs the page.

**Reduced motion.** Under `prefers-reduced-motion: reduce` the timer does not start and the card renders at its initial value. No animation, no event ticker.

**Accessibility.** The payout event is not announced; it is decorative repetition of information already visible in the figure. The escrow figure is real text, not an image.

## 7. Type scale

A direct cause of the flat feel: H3 currently equals body text.

| Role | Today | New |
|---|---|---|
| h1 | 32 / 42px | 38 / 54px |
| h2 | 24px | 36px |
| h3 | **15px** | **18px** |
| body | 15px | 15–16px |
| caption | 11–12px | 11–12px |

The critique also found 11 distinct font sizes on the page. The redesign should land on six.

## 8. Depth

Three additions, all on the existing light canvas:

- **Elevation.** Two shadow levels for cards, replacing border-only definition. The bento's big cell and the hero demo take the heavier one.
- **Full-bleed tinted bands.** Sections 2, 4 and 5 break the container. This alone destroys the "same box eight times" reading.
- **The hero glow.** One radial lime wash, decorative only.

No new colour tokens. Shadows are defined once and reused.

## 9. Performance — a prerequisite, not a follow-up

The landing page shipped **509 KB of JS against a 300 KB budget** at the start of this work (`scripts/measure-sli.mjs`, `BUDGETS.landingJsKB`), because `WalletProviders` is mounted in the root layout and pulls the Solana wallet adapter onto a purely static marketing page. The redesign brought it to **252 KB**, verified by running `BASE_URL=<server> node scripts/measure-sli.mjs` against a fresh production build.

> **Measuring this correctly matters.** `scripts/measure-sli.mjs` defaults to `localhost:3005` and silently reports whatever is serving there, so a run against a stale server, a dev server, or a different build yields a plausible-looking number that does not reproduce. Figures of 212-226 KB were recorded during this work that way. Always pass `BASE_URL` explicitly and build first.

`LiveEscrowDemo` adds client JS. Therefore **lazy-loading `WalletProviders` is task 1 of the implementation, before any redesign work.** It is expected to free 500–700 KB, several times what the demo costs. If it does not, the demo is reconsidered before it is built.

The `perf-sli` agent measures the page before and after. The landing JS budget must not be worse at the end than at the start.

## 10. Testing

`app/__tests__/landing.test.tsx` holds 18 tests. Most assert properties rather than markup and should survive. Specifically:

**Must keep passing unchanged** — the honesty and sourcing guarantees, which the redesign must not weaken:

- every problem claim names a source
- every market figure names a source
- no numeric claim about Nativness itself
- no testimonial-style attributed quote, ever
- no em dash outside the cited range
- one label per destination, 1:1 in both directions
- the announcement bar discloses simulated escrow

**Will need re-anchoring** — these reference sections that are merging or moving:

- "renders the Why Nativness section between the hero and the problem cards" — `WhyNativness` merges into the bento; re-anchor to assert its four claims still appear on the page
- "states one login for both sides in the hero" — that line moves into the bento header
- the three-steps-in-order test — content unchanged, container changes

**New tests required:**

- the governing rule: no two adjacent `<main>` sections share a container shape
- `LiveEscrowDemo` does not start its timer under reduced motion
- `LiveEscrowDemo` never renders an escrow remainder below zero, and resets rather than going negative
- the demo carries its Phase 1 disclosure

`components/landing/__tests__/reveal.test.tsx` and `header.test.tsx` are unaffected.

## 11. Accessibility

The current page passes contrast on every rendered text node. That must hold. Specifically:

- Lime `#C3FF00` stays fill-only; it is ~1.2:1 as text on white.
- The hero glow must not reduce any text's contrast below 4.5:1. Text sits in the left column, clear of it; verify after implementation.
- New tinted bands must be re-measured; today's `muted` on white is 5.74:1 and must not regress against a tint.
- The bento's big cell sits on `canvas` while its siblings sit on `surface`; check both.
- Heading order stays h1 → h2 → h3 with no skips.
- All decorative SVG stays `aria-hidden`, as all 19 currently are.

## 12. Risks

| Risk | Mitigation |
|---|---|
| The demo pushes JS further over budget | `WalletProviders` fix lands first and is measured; demo is reconsidered if it does not free enough |
| The bento becomes a grid of empty boxes | The 2×2 cell carries real product UI; the small cells carry one line each, not paragraphs |
| The glow reads as a gradient cliché | One wash, low opacity, decorative only, no second gradient anywhere |
| Merging two sections loses a claim | All four `WhyNativness` claims are asserted by a test that survives the merge |
| Section 5 at 130px reads as unfinished | It is the deliberate breather; it is what makes the rhythm legible |

## 13. Out of scope, deliberately

- The **"Verified" badge**, which is a hardcoded seed boolean, always `false` for user-created offers and never defined in the UI. It is an unearned trust claim on a product arguing trust claims are worthless. It belongs to Phase 2b and is the owner's call, not this redesign's.
- Any `/app` screen.
- The Phase 2a data layer.

---

## 14. What shipped, and what a later design pass must not quietly break

Added 2026-10-03, so a session picking this doc up cold does not mistake a
finished page for a plan.

**Four design decisions are enforced by tests, not by convention.** Changing any
of them is legitimate; changing them *by accident* is what these stop.

| Enforced by | What it holds |
|---|---|
| `components/landing/__tests__/section-shapes.test.tsx` | Six sections, declared `data-shape` values in the exact order `split, rail, bento, typesplit, band, centred`, no two neighbours alike, exactly one centred. This is section 4's governing rule made mechanical. |
| `components/landing/__tests__/type-scale.test.ts` | No raw `text-[Npx]` anywhere under `components/landing/`. The scale is six semantic steps in `globals.css`. It had drifted to seventeen distinct sizes before this. |
| `components/landing/__tests__/no-wallet-code.test.ts` | No `@solana` or `lib/wallet` import reachable from `app/page.tsx` or `components/landing/`. This is what holds landing JS at 252KB against a 300KB budget. |
| `app/__tests__/landing.test.tsx` | The honesty guarantees: every competitor and market figure names its source, no numeric claim about Nativness's own marketplace, never a testimonial-style attributed quote, no em dash, and one label per destination 1:1. |

**Generation lost to hand-authoring three times on this page.** Recorded so it is
not attempted a fourth time without a reason:

1. *Icons* — roughly 30 fal.ai generations across four styles returned 16-50KB
   files with inconsistent stroke weight that turned to mush at 20px. Replaced by
   hand-authored glyphs at ~200 bytes each (`components/ui/LandingIcon.tsx`).
2. *Hero artwork* — three generations. The first returned a photographed room
   corner with a horizon and a hard edge. The second, after tightening the
   prompt, a flat uniform wash with no transparent edge to bleed off. The third
   converged on a green blur on black, which is a radial gradient rendered as a
   13KB raster with no alpha. Replaced by a four-layer CSS gradient mesh in
   `Hero.tsx`.
3. *Offer avatar marks* — traced from generated raster art, 182KB for eight
   shapes, including a 21KB circle and a 46KB triangle, every one a solid
   silhouette that became a coloured dot at 20px. Replaced by hand-authored
   geometry at 1.1KB total (`components/ui/avatarMarks.generated.ts`, whose
   `.generated` suffix is now historical — do not re-trace them).

The pattern each time: generation is good at content and bad at precisely
controlled decorative form, and every visual on this page is the latter at small
sizes. A paper-grain texture was also generated and discarded for directional
streaking; it is an `feTurbulence` filter in `globals.css` instead.

**The wallet connect work was reverted** (`dc8be00`). An allow-list of three
wallets narrowed sign-in so that anyone using another Solana-capable wallet could
not sign in at all. `autoConnect` is therefore on again, and that is the
behaviour that drew MetaMask's phishing warning on the deployed site. The site is
on a `*.vercel.app` subdomain, a host with 2,096 subdomains on MetaMask's public
blocklist, which a fresh subdomain requesting wallet access inherits. Known,
deliberately not acted on.

**Still open, and the owner's call:** the `Verified` badge is a hardcoded seed
boolean, always `false` for anything a user creates, and is never defined in the
UI. It is the one unearned trust claim on a product arguing trust claims are
worthless. Section 13 leaves it out of scope; Phase 2b is scoped to fix it.
