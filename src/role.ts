export type Role = 'affiliate' | 'provider'

const KEY = 'nativness.role'
export const rememberedRole = (): Role | null => { try { return localStorage.getItem(KEY) as Role | null } catch { return null } }
export const rememberRole = (r: Role) => { try { localStorage.setItem(KEY, r) } catch { /* storage unavailable */ } }
