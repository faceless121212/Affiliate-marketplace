// Wallet discovery and connection with no SDK dependency.
// Solana wallets are found through the Wallet Standard, Ethereum wallets (MetaMask and others)
// through EIP-6963, with the older injected globals as a fallback for both.
// Connecting only reads a public address. Nothing is signed or sent.

export type Chain = 'Solana' | 'Ethereum'

export type WalletOption = {
  id: string
  name: string
  chain: Chain
  icon?: string
  connect: (silent?: boolean) => Promise<string>
  disconnect: () => Promise<void>
}

type Any = Record<string, any>

function standardWallet(w: Any): WalletOption | null {
  const connect = w.features?.['standard:connect']?.connect
  if (typeof connect !== 'function') return null
  const chains: string[] = w.chains ?? []
  const chain: Chain = chains.some(c => c.startsWith('solana:')) || !chains.some(c => c.startsWith('eip155:')) ? 'Solana' : 'Ethereum'
  return {
    id: `std:${w.name}`, name: w.name, chain, icon: w.icon,
    connect: async silent => {
      const res = await connect(silent ? { silent: true } : undefined)
      const account = res?.accounts?.[0] ?? w.accounts?.[0]
      if (!account?.address) throw new Error('The wallet did not return an address.')
      return account.address
    },
    disconnect: async () => { await w.features?.['standard:disconnect']?.disconnect?.() },
  }
}

function evmWallet(name: string, provider: Any, icon?: string, key = name): WalletOption {
  return {
    id: `evm:${key}`, name, chain: 'Ethereum', icon,
    connect: async silent => {
      const accounts: string[] = await provider.request({ method: silent ? 'eth_accounts' : 'eth_requestAccounts' })
      if (!accounts?.[0]) throw new Error('The wallet did not return an address.')
      return accounts[0]
    },
    disconnect: async () => {
      await provider.request({ method: 'wallet_revokePermissions', params: [{ eth_accounts: {} }] }).catch(() => {})
    },
  }
}

function legacySolana(name: string, provider: Any): WalletOption {
  return {
    id: `sol:${name}`, name, chain: 'Solana',
    connect: async silent => {
      const res = await provider.connect(silent ? { onlyIfTrusted: true } : undefined)
      const key = res?.publicKey ?? provider.publicKey
      if (!key) throw new Error('The wallet did not return an address.')
      return key.toString()
    },
    disconnect: async () => { await provider.disconnect?.() },
  }
}

const found = new Map<string, WalletOption>()
const listeners = new Set<() => void>()
let started = false

function add(option: WalletOption | null) {
  if (!option) return
  const key = `${option.chain}:${option.name.toLowerCase()}`
  if (found.has(key)) return
  found.set(key, option)
  listeners.forEach(fn => fn())
}

function scanLegacy() {
  const w = window as unknown as Any
  if (w.phantom?.solana?.isPhantom) add(legacySolana('Phantom', w.phantom.solana))
  if (w.solflare?.isSolflare) add(legacySolana('Solflare', w.solflare))
  const backpack = w.backpack?.solana ?? (w.backpack?.isBackpack ? w.backpack : null)
  if (backpack) add(legacySolana('Backpack', backpack))
  const eth = w.ethereum
  if (eth?.request && ![...found.values()].some(o => o.chain === 'Ethereum')) {
    add(evmWallet(eth.isMetaMask ? 'MetaMask' : eth.isCoinbaseWallet ? 'Coinbase Wallet' : 'Browser wallet', eth))
  }
}

function start() {
  if (started) return
  started = true
  const api = Object.freeze({ register: (...wallets: Any[]) => { wallets.forEach(w => add(standardWallet(w))); return () => {} } })
  window.addEventListener('wallet-standard:register-wallet', e => {
    const callback = (e as CustomEvent).detail
    if (typeof callback === 'function') callback(api)
  })
  try { window.dispatchEvent(new CustomEvent('wallet-standard:app-ready', { detail: api })) } catch { /* a wallet threw during registration */ }
  window.addEventListener('eip6963:announceProvider', e => {
    const d = (e as CustomEvent).detail
    if (d?.provider?.request && d.info?.name) add(evmWallet(d.info.name, d.provider, d.info.icon, d.info.rdns ?? d.info.name))
  })
  window.dispatchEvent(new Event('eip6963:requestProvider'))
}

export function detectWallets(): WalletOption[] {
  start()
  scanLegacy()
  return [...found.values()].sort((a, b) => a.name.localeCompare(b.name) || a.chain.localeCompare(b.chain))
}

export function onWalletsChanged(fn: () => void): () => void {
  listeners.add(fn)
  return () => { listeners.delete(fn) }
}

const KEY = 'nativness.wallet'
export const rememberWallet = (id: string | null) => {
  try { id ? localStorage.setItem(KEY, id) : localStorage.removeItem(KEY) } catch { /* storage unavailable */ }
}
export const rememberedWallet = () => { try { return localStorage.getItem(KEY) } catch { return null } }

export const shortAddress = (a: string) => (a.length > 10 ? `${a.slice(0, 4)}…${a.slice(-4)}` : a)
