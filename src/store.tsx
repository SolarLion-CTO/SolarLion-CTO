import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'
import { domains } from './data/domains'
import type { DomainId, DomainPack } from './data/domains'

export type Verdict = 'Approved' | 'Rejected' | 'Escalated'

export interface AuditEntry {
  decisionId: string
  title: string
  verdict: Verdict
  reason: string
  by: string
  at: string
}

interface Store {
  domainId: DomainId
  domain: DomainPack
  setDomainId: (id: DomainId) => void
  audit: AuditEntry[]
  record: (entry: Omit<AuditEntry, 'at'>) => void
  verdictFor: (decisionId: string) => AuditEntry | undefined
}

const Ctx = createContext<Store | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [domainId, setDomainId] = useState<DomainId>('banking')
  const [audit, setAudit] = useState<AuditEntry[]>([])

  const record = (entry: Omit<AuditEntry, 'at'>) =>
    setAudit((prev) => [{ ...entry, at: new Date().toLocaleTimeString() }, ...prev])

  const verdictFor = (decisionId: string) => audit.find((a) => a.decisionId === decisionId)

  return (
    <Ctx.Provider value={{ domainId, domain: domains[domainId], setDomainId, audit, record, verdictFor }}>
      {children}
    </Ctx.Provider>
  )
}

export function useStore() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useStore must be used inside StoreProvider')
  return ctx
}
