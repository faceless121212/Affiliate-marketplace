import { shortAddress } from '@/lib/format'

export function Address({ value, className = '' }: { value: string; className?: string }) {
  return (
    <span className={`font-mono ${className}`} title={value}>
      {shortAddress(value)}
    </span>
  )
}
