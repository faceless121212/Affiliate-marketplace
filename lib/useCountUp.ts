'use client'

import { useEffect, useState } from 'react'
import { usePrefersReducedMotion } from './usePrefersReducedMotion'

/**
 * Animates a number counting up from 0 to `target` on mount, eased out, using
 * `requestAnimationFrame` — no animation library.
 *
 * Deliberately has NO run-once guard. React Strict Mode mounts effects twice in
 * development: a `startedRef` flag set on the first mount survives into the
 * second, where it short-circuits before starting the loop, leaving the value
 * pinned at 0. The cleanup already cancels any pending frame, so simply letting
 * the effect restart is both correct and idempotent. Jumps straight to `target`
 * (no animation at all) when the user has asked for reduced motion, or when
 * `requestAnimationFrame` is unavailable (SSR, the test runner).
 */
export function useCountUp(target: number, durationMs = 1400): number {
  const reducedMotion = usePrefersReducedMotion()
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (reducedMotion || typeof window === 'undefined' || typeof window.requestAnimationFrame !== 'function') {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- syncs to the external reduced-motion/SSR condition exactly once; there is no animation loop to subscribe to in this branch.
      setValue(target)
      return
    }
    let frame = 0
    const start = performance.now()
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / durationMs)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(target * eased))
      if (progress < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [reducedMotion, target, durationMs])

  return value
}
