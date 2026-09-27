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
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setRevealed(true)
          observer.disconnect()
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
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
