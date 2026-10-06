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

export const status = { ok: '#15803d', warn: '#d97706', serious: '#ea580c', crit: '#dc2626' }

// Chart chrome
// Single-series and comparison charts use primary blue + slate; domain comparisons keep domainColor (validated)
export const chart = { grid: '#e2e8f0', axis: '#64748b', primary: '#2563eb', secondary: '#64748b', comparison: '#94a3b8', primaryDark: '#0f2747' }
export const axisTick = { fontSize: 11, fill: '#64748b' }
