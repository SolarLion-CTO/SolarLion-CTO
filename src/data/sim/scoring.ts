// One scoring rule for every metric: distance from target in the "bad" direction, against a Green / Amber band.
import type { Rag } from './model'

export function metricScore(m: { better: 'up' | 'down'; band?: [number, number] }, current: number, target: number): { score: number; status: Rag; band: [number, number] } {
  const band: [number, number] = m.band ?? (target ? [Math.abs(target) * 0.02, Math.abs(target) * 0.1] : [1, 3])
  const [g, a] = band
  const dev = m.better === 'up' ? target - current : current - target
  const status: Rag = dev <= g ? 'Green' : dev <= a ? 'Amber' : 'Red'
  const score = dev <= 0 ? 100 : dev <= g ? 100 - (15 * dev) / (g || 1) : dev <= a ? 85 - (25 * (dev - g)) / (a - g || 1) : Math.max(15, 60 - 45 * Math.min(1, (dev - a) / (a || 1)))
  return { score: Math.round(score), status, band }
}
export const ragOf = (score: number): Rag => (score >= 80 ? 'Green' : score >= 60 ? 'Amber' : 'Red')
