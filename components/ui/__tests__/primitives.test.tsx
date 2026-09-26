import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Money } from '@/components/ui/Money'
import { Address } from '@/components/ui/Address'

describe('Money', () => {
  it('renders in mono with tabular numerals so columns align', () => {
    render(<Money value={340} />)
    const el = screen.getByText('$340.00')
    expect(el).toHaveClass('font-mono')
    expect(el).toHaveClass('tnum')
  })
})

describe('Address', () => {
  it('shows the shortened form but exposes the full address', () => {
    const full = '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU'
    render(<Address value={full} />)
    const el = screen.getByText('7xKX…gAsU')
    expect(el).toHaveClass('font-mono')
    expect(el).toHaveAttribute('title', full)
  })
})
