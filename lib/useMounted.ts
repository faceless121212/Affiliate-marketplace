'use client'

import { useEffect, useState } from 'react'

/** True only after the first client render. Guards localStorage reads against SSR mismatch. */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- canonical SSR mounted-guard: this fires exactly once after the first client render, it does not cascade.
    setMounted(true)
  }, [])
  return mounted
}
