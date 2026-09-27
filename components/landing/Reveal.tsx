'use client'

import { useEffect, useRef, useState } from 'react'

type Props = {
  children: React.ReactNode
  className?: string
  /** Stagger delay in ms, applied as `transition-delay` once revealed. */
  delayMs?: number
}

/**
 * Fades and lifts its children in as they cross into the viewport: pure CSS
 * transition plus `IntersectionObserver`, no animation library.
 *
 * Motion is gated two independent ways, both non-negotiable: the
 * `motion-reduce:` utilities below disable the transition and force the
 * final, visible state whenever the OS asks for reduced motion (a CSS media
 * query, so it holds even before this component's own JS has run); and any
 * environment without `IntersectionObserver` (old browsers, SSR) reveals
 * immediately rather than leaving content stuck invisible.
 */
export function Reveal({ children, className = '', delayMs = 0 }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') {
      setRevealed(true)
      return
    }
    let done = false
    const reveal = () => {
      if (done) return
      done = true
      setRevealed(true)
      observer.disconnect()
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }

    // Safety net. IntersectionObserver only fires when the intersection state
    // CHANGES, so an element that goes from below the viewport to above it in
    // a single jump — a trackpad fling, the End key, an anchor link — can
    // report ratio 0 both times and never reveal, leaving content permanently
    // invisible. A cheap rect check on scroll covers exactly that case.
    const onScroll = () => {
      const rect = el.getBoundingClientRect()
      if (rect.height === 0) return // not laid out yet (or a zero-height test stub)
      if (rect.top < window.innerHeight && rect.bottom > 0) reveal()
      else if (rect.bottom <= 0) reveal() // already scrolled past
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) reveal()
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' },
    )
    observer.observe(el)
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    // Also check once on mount, for a page that opens already scrolled past
    // this element: a restored scroll position, or a link to an anchor
    // further down. Without this such content waits for a scroll that may
    // never come.
    onScroll()

    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return (
    <div
      ref={ref}
      data-revealed={revealed}
      style={delayMs ? { transitionDelay: `${delayMs}ms` } : undefined}
      className={`opacity-0 translate-y-3 transition-[opacity,transform] duration-500 ease-out motion-reduce:opacity-100 motion-reduce:translate-y-0 motion-reduce:transition-none data-[revealed=true]:opacity-100 data-[revealed=true]:translate-y-0 ${className}`}
    >
      {children}
    </div>
  )
}
