// CTO360 analytics library (M7). Real techniques, computed in the browser on the synthetic data.
// Kept dependency-free and deterministic (seeded) so every reload shows the same results.
import { rng } from './rng'

const r2 = (n: number) => Math.round(n * 100) / 100

// ── Forecasting ───────────────────────────────────────────────────────
/** Holt's linear (double exponential) smoothing → `horizon` future points. */
export function holt(xs: number[], horizon = 3, alpha = 0.5, beta = 0.3) {
  let level = xs[0], trend = xs.length > 1 ? xs[1] - xs[0] : 0
  for (let i = 1; i < xs.length; i++) {
    const prev = level
    level = alpha * xs[i] + (1 - alpha) * (level + trend)
    trend = beta * (level - prev) + (1 - beta) * trend
  }
  return Array.from({ length: horizon }, (_, k) => r2(level + (k + 1) * trend))
}

/** Holt-Winters additive (level + trend + seasonality of length `season`). Needs ≥ 2 seasons of data. */
export function holtWinters(xs: number[], season: number, horizon: number, alpha = 0.4, beta = 0.1, gamma = 0.3) {
  if (xs.length < season * 2) return holt(xs, horizon)
  const avg = (a: number[]) => a.reduce((s, x) => s + x, 0) / a.length
  let level = avg(xs.slice(0, season))
  let trend = (avg(xs.slice(season, season * 2)) - level) / season
  const seas = xs.slice(0, season).map((x) => x - level)
  for (let i = season; i < xs.length; i++) {
    const s = seas[i % season], prev = level
    level = alpha * (xs[i] - s) + (1 - alpha) * (level + trend)
    trend = beta * (level - prev) + (1 - beta) * trend
    seas[i % season] = gamma * (xs[i] - level) + (1 - gamma) * s
  }
  return Array.from({ length: horizon }, (_, k) => r2(level + (k + 1) * trend + seas[(xs.length + k) % season]))
}

// ── Anomaly detection ─────────────────────────────────────────────────
/** EWMA control chart: flags points more than k standard deviations from the smoothed mean. */
export function ewmaAnomalies(xs: number[], lambda = 0.3, k = 3) {
  let mean = xs[0]
  const resid: number[] = []
  const out: { index: number; value: number; expected: number; z: number }[] = []
  xs.forEach((x, i) => {
    if (i > 3) {
      const sd = Math.sqrt(resid.reduce((s, e) => s + e * e, 0) / resid.length) || 1
      const z = (x - mean) / sd
      if (Math.abs(z) > k) out.push({ index: i, value: x, expected: r2(mean), z: r2(z) })
    }
    resid.push(x - mean)
    mean = lambda * x + (1 - lambda) * mean
  })
  return out
}

// ── Simulation & finance ──────────────────────────────────────────────
/** Monte Carlo: run `n` seeded trials of `trial(r)` and return the P10 / P50 / P90 and mean. */
export function monteCarlo(seed: string, n: number, trial: (r: ReturnType<typeof rng>) => number) {
  const r = rng(seed)
  const xs = Array.from({ length: n }, () => trial(r)).sort((a, b) => a - b)
  const q = (p: number) => xs[Math.min(n - 1, Math.floor(p * n))]
  return { p10: r2(q(0.1)), p50: r2(q(0.5)), p90: r2(q(0.9)), mean: r2(xs.reduce((s, x) => s + x, 0) / n), samples: xs }
}
/** Triangular distribution sample (min, most likely, max) — standard for benefit estimates. */
export function triangular(r: ReturnType<typeof rng>, lo: number, mode: number, hi: number) {
  const u = r.next(), c = (mode - lo) / (hi - lo || 1)
  return u < c ? lo + Math.sqrt(u * (hi - lo) * (mode - lo)) : hi - Math.sqrt((1 - u) * (hi - lo) * (hi - mode))
}
/** Net present value of period cash flows (index 0 = today, usually the investment as a negative). */
export function npv(rate: number, flows: number[]) { return r2(flows.reduce((s, f, t) => s + f / (1 + rate) ** t, 0)) }
/** Internal rate of return by bisection (per period). null if no sign change. */
export function irr(flows: number[]) {
  let lo = -0.99, hi = 5
  const f = (r: number) => flows.reduce((s, x, t) => s + x / (1 + r) ** t, 0)
  if (f(lo) * f(hi) > 0) return null
  for (let i = 0; i < 100; i++) { const mid = (lo + hi) / 2; if (f(lo) * f(mid) <= 0) hi = mid; else lo = mid }
  return r2(((lo + hi) / 2) * 100)
}
/** Payback period in periods (fractional) from cumulative cash flow; null if never repaid. */
export function payback(flows: number[]) {
  let cum = 0
  for (let t = 0; t < flows.length; t++) {
    const prev = cum; cum += flows[t]
    if (cum >= 0 && t > 0) return r2(t - 1 + -prev / (flows[t] || 1))
  }
  return null
}
/** Adoption S-curve (logistic) value at time t. */
export const sCurve = (t: number, ceiling: number, midpoint: number, steepness = 0.6) => r2(ceiling / (1 + Math.exp(-steepness * (t - midpoint))))

// ── Model risk ────────────────────────────────────────────────────────
/** Population Stability Index between two binned distributions (proportions). > 0.25 = significant drift. */
export function psi(expected: number[], actual: number[]) {
  const e = 1e-4
  return r2(expected.reduce((s, x, i) => { const a = Math.max(e, actual[i]), b = Math.max(e, x); return s + (a - b) * Math.log(a / b) }, 0))
}
export const psiBand = (v: number) => (v > 0.25 ? 'Significant drift' : v > 0.1 ? 'Moderate drift' : 'Stable')

// ── Operations ────────────────────────────────────────────────────────
/** Pareto: sort descending and add cumulative %. */
export function pareto<T extends { count: number }>(items: T[]) {
  const total = items.reduce((s, x) => s + x.count, 0) || 1
  let cum = 0
  return [...items].sort((a, b) => b.count - a.count).map((x) => { cum += x.count; return { ...x, pct: r2((x.count / total) * 100), cumPct: r2((cum / total) * 100) } })
}
/** M/M/1 queue: response time grows as 1 / (1 − utilisation). */
export const queueLatency = (util: number, serviceMs: number) => (util >= 0.99 ? Infinity : Math.round(serviceMs / (1 - util)))
/** SRE error budget for a period (minutes). */
export function errorBudget(slo: number, availability: number, periodDays = 30) {
  const total = periodDays * 24 * 60
  const budget = total * (1 - slo / 100), burned = total * (1 - availability / 100)
  return { budgetMin: Math.round(budget), burnedMin: Math.round(burned), remainingPct: Math.round(Math.max(0, 1 - burned / (budget || 1)) * 100), burnRate: r2(burned / (budget || 1)) }
}

// ── Transformation tracking (current → target) ────────────────────────
export const PROGRAMME_START = '2025-11-01'
const DAY = 86_400_000
/** Share of the gap from baseline to target that has been closed (0–100), respecting direction. */
export function progress(baseline: number, current: number, target: number) {
  const gap = target - baseline
  if (gap === 0) return 100
  return Math.round(Math.max(0, Math.min(1, (current - baseline) / gap)) * 100)
}
/** Share of time used between programme start and the target date. */
export function elapsed(targetDate: string, now: number) {
  const s = Date.parse(PROGRAMME_START), t = Date.parse(targetDate)
  return Math.round(Math.max(0, Math.min(1, (now - s) / (t - s))) * 100)
}
export type Glide = 'Ahead' | 'On track' | 'Behind'
export const glide = (prog: number, time: number): Glide => (prog >= time + 10 ? 'Ahead' : prog >= time - 10 ? 'On track' : 'Behind')
/** Estimated date the target is reached, from the last-quarter monthly trend. null if flat or moving away. */
export function eta(series: number[], target: number, now: number) {
  const n = series.length, cur = series[n - 1]
  const slope = (cur - series[Math.max(0, n - 4)]) / Math.min(3, n - 1)
  if ((target - cur) === 0) return new Date(now).toISOString().slice(0, 10)
  if (slope === 0 || Math.sign(slope) !== Math.sign(target - cur)) return null
  const months = (target - cur) / slope
  return new Date(now + months * 30.4 * DAY).toISOString().slice(0, 10)
}
/** Planned straight-line glide path from baseline (programme start) to target at the target date, sampled at each month. */
export function glidePath(baseline: number, target: number, targetDate: string, monthsIso: string[]) {
  const s = Date.parse(PROGRAMME_START), t = Date.parse(targetDate)
  return monthsIso.map((m) => r2(baseline + (target - baseline) * Math.max(0, Math.min(1, (Date.parse(m) - s) / (t - s)))))
}
