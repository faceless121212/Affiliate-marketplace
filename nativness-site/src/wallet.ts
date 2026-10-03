// Minimal connector for injected Solana wallets. The address is an identity here: nothing is signed or sent.
type PublicKey = { toString(): string }
type Injected = {
  connect: () => Promise<unknown>
  disconnect?: () => Promise<unknown>
  publicKey?: PublicKey | null
}

export type WalletOption = { name: string; provider: Injected }

export function detectWallets(): WalletOption[] {
  const w = window as unknown as Record<string, any>
  const found: WalletOption[] = []
  if (w.phantom?.solana?.isPhantom) found.push({ name: 'Phantom', provider: w.phantom.solana })
  if (w.solflare?.isSolflare) found.push({ name: 'Solflare', provider: w.solflare })
  const backpack = w.backpack?.solana ?? (w.backpack?.isBackpack ? w.backpack : null)
  if (backpack) found.push({ name: 'Backpack', provider: backpack })
  return found
}

export async function connectWallet(option: WalletOption): Promise<string> {
  const res = (await option.provider.connect()) as { publicKey?: PublicKey } | undefined
  const key = res?.publicKey ?? option.provider.publicKey
  if (!key) throw new Error('The wallet did not return an address.')
  return key.toString()
}

export const shortAddress = (a: string) => (a.length > 10 ? `${a.slice(0, 4)}…${a.slice(-4)}` : a)
