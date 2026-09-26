import '@testing-library/jest-dom/vitest'
import React from 'react'
import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

/**
 * next/link and next/navigation both reach for the App Router context, which
 * does not exist under jsdom. Every component test that renders a link or
 * reads the pathname would otherwise fail on an invariant rather than on the
 * behaviour under test.
 */
vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    ...rest
  }: { href: string; children: React.ReactNode } & Record<string, unknown>) =>
    React.createElement('a', { href, ...rest }, children),
}))

vi.mock('next/navigation', () => ({
  usePathname: () => '/app',
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn(), prefetch: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}))

afterEach(() => {
  cleanup()
  window.localStorage.clear()
})
