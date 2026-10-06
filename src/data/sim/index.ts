// CTO360 simulation entry point. SIMULATED ENTERPRISE DATA — no live vendor integrations are active.
import type { DomainData, DomainId } from './model'
import { build } from './build'
import { banking } from './domains/banking'
import { manufacturing } from './domains/manufacturing'
import { retail } from './domains/retail'

export const sim: Record<DomainId, DomainData> = {
  banking: build('banking', banking),
  manufacturing: build('manufacturing', manufacturing),
  retail: build('retail', retail),
}
export * from './model'
export { FUNCTIONS, FN, HEAT_COLS } from './functions'
export { SOURCES, domainHealth, exec360, functionHealth, sourceHealth } from './scores'
