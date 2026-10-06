// Seeded helpers: the simulation must look identical on every reload.

export function rng(seed: string) {
  let h = 1779033703 ^ seed.length
  for (let i = 0; i < seed.length; i++) { h = Math.imul(h ^ seed.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19) }
  let a = h >>> 0
  const next = () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296 }
  return {
    next,
    between: (lo: number, hi: number) => lo + next() * (hi - lo),
    int: (lo: number, hi: number) => Math.floor(lo + next() * (hi - lo + 1)),
    pick: <T,>(xs: readonly T[]) => xs[Math.floor(next() * xs.length)],
  }
}

export const round = (x: number, dp = 1) => { const f = 10 ** dp; return Math.round(x * f) / f }
export const clamp = (x: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, x))

/**
 * 12-month series that ENDS exactly at `current`, starts near `start`, with small seeded noise.
 * Keeps "trend matches current value" (spec 1 §28) true by construction.
 */
export function series(seed: string, start: number, current: number, opts: { noise?: number; dp?: number; min?: number; max?: number } = {}) {
  const r = rng(seed)
  const { noise = 0.03, dp = 1, min = -Infinity, max = Infinity } = opts
  const span = Math.abs(current - start) || Math.abs(current) * 0.05 || 1
  const out: number[] = []
  for (let i = 0; i < 12; i++) {
    const t = i / 11
    const base = start + (current - start) * (t * t * (3 - 2 * t)) // smooth step
    const jitter = i === 11 || i === 0 ? 0 : (r.next() - 0.5) * 2 * noise * span * 3
    out.push(round(clamp(base + jitter, min, max), dp))
  }
  out[11] = round(current, dp)
  return out
}

/** Linear 3-month forecast from the last quarter's slope. */
export function forecast(s: number[], dp = 1, min = -Infinity, max = Infinity) {
  const slope = (s[11] - s[8]) / 3
  return [1, 2, 3].map((k) => round(clamp(s[11] + slope * k * 0.8, min, max), dp))
}

export const pad = (n: number, w = 2) => String(n).padStart(w, '0')
