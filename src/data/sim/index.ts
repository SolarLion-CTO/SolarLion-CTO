// CTO360 simulation entry point. SIMULATED ENTERPRISE DATA — no live vendor integrations are active.
import type { DomainData, DomainId } from './model'
import { build } from './build'
import { banking } from './domains/banking'

// Manufacturing and Retail configs are added in M3 (same builder, different data).
export const sim: Partial<Record<DomainId, DomainData>> = {
  banking: build('banking', banking),
}
export * from './model'
export { FUNCTIONS, FN, HEAT_COLS } from './functions'
export { SOURCES, domainHealth, exec360, functionHealth, sourceHealth } from './scores'
