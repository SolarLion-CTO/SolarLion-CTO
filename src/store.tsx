import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'
import { domains, flagship } from './data/domains'
import type { Decision, DomainId, DomainPack } from './data/domains'

export type Verdict = 'Approved' | 'Rejected' | 'Modified' | 'Escalated'

export interface AuditEntry {
  decisionId: string
  title: string
  domain: string
  verdict: Verdict
  reason: string
  by: string
  challenged: boolean
  confidence: number
  at: string
}

interface Store {
  domainId: DomainId
  domain: DomainPack
  setDomainId: (id: DomainId) => void
  decisions: Decision[] // flagship + current domain decisions
  audit: AuditEntry[]
  record: (entry: Omit<AuditEntry, 'at' | 'domain'>) => void
  verdictFor: (decisionId: string) => AuditEntry | undefined
  realisedCr: number // value added by approvals this session (current domain + flagship)
}

const Ctx = createContext<Store | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [domainId, setDomainId] = useState<DomainId>('banking')
  const [audit, setAudit] = useState<AuditEntry[]>([])
  const domain = domains[domainId]
  const decisions = [flagship, ...domain.decisions]

  const record = (entry: Omit<AuditEntry, 'at' | 'domain'>) =>
    setAudit((prev) => [{ ...entry, domain: entry.decisionId === flagship.id ? 'Cross-domain' : domain.name, at: new Date().toLocaleTimeString() }, ...prev])

  const verdictFor = (id: string) => audit.find((a) => a.decisionId === id)

  const realisedCr = decisions
    .filter((d) => verdictFor(d.id)?.verdict === 'Approved')
    .reduce((s, d) => s + d.valueCr, 0)

  return (
    <Ctx.Provider value={{ domainId, domain, setDomainId, decisions, audit, record, verdictFor, realisedCr }}>
      {children}
    </Ctx.Provider>
  )
}

export function useStore() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useStore must be used inside StoreProvider')
  return ctx
}
