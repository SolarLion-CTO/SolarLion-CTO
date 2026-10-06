// Colour tokens for charts (Recharts needs hex values, not CSS classes).
// Keep in sync with the @theme block in src/index.css.
import type { DomainId } from './data/domains'

export const domainColor: Record<DomainId, string> = {
  banking: '#2a78d6',
  manufacturing: '#1baf7a',
  retail: '#eb6834',
}

// Fixed categorical order for non-domain series — never cycled
export const series = ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300', '#4a3aa7', '#e34948']

// Progress / magnitude scale (single blue hue, light → dark)
export const seq = { s100: '#cde2fb', s250: '#86b6ef', s400: '#3987e5', s550: '#1c5cab' }

export const status = { ok: '#0ca30c', warn: '#fab219', serious: '#ec835a', crit: '#d03b3b' }

// Chart chrome
export const chart = { grid: '#e3e6eb', axis: '#64748b', muted: '#cbd5e1', primary: '#2a78d6', primaryDark: '#0b2a6b' }
export const axisTick = { fontSize: 11, fill: '#64748b' }
