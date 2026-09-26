'use client'

import { useEffect, useState } from 'react'

const QUERY = '(prefers-reduced-motion: reduce)'

/**
 * True when the OS/browser asks for reduced motion. False during SSR and in
 * any environment (like the test runner) that does not implement
 * `matchMedia` — never throws, never blocks a render on it.
 */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return
    const mql = window.matchMedia(QUERY)
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reads the current media-query state exactly once per mount to sync with an external system (the OS preference); the change listener below is the ongoing subscription this rule usually asks for.
    setReduced(mql.matches)
    const onChange = () => setReduced(mql.matches)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  return reduced
}
