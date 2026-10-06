// Engineering delivery metrics per domain (DORA-style). Update figures here. Illustrative demo data.
import type { DomainId } from './domains'

export interface Eng { deploysPerWeek: number; leadTimeDays: number; teams: { team: string; capacity: number; wip: number; onTime: number }[]; trend: { month: string; deploys: number; changeFail: number }[] }
export const engineering: Record<DomainId, Eng> = {
  banking: {
    deploysPerWeek: 9, leadTimeDays: 6.5,
    teams: [{ team: 'Core & payments', capacity: 96, wip: 14, onTime: 71 }, { team: 'Digital channels', capacity: 84, wip: 9, onTime: 86 }, { team: 'Data & AI platform', capacity: 91, wip: 11, onTime: 78 }, { team: 'Compliance tech', capacity: 88, wip: 7, onTime: 74 }],
    trend: [{ month: 'May', deploys: 31, changeFail: 12 }, { month: 'Jun', deploys: 34, changeFail: 11 }, { month: 'Jul', deploys: 36, changeFail: 10 }, { month: 'Aug', deploys: 33, changeFail: 13 }, { month: 'Sep', deploys: 38, changeFail: 9 }],
  },
  manufacturing: {
    deploysPerWeek: 3, leadTimeDays: 14,
    teams: [{ team: 'SAP & ERP', capacity: 98, wip: 12, onTime: 62 }, { team: 'Plant systems (MES)', capacity: 93, wip: 10, onTime: 70 }, { team: 'Data & AI platform', capacity: 86, wip: 8, onTime: 81 }],
    trend: [{ month: 'May', deploys: 10, changeFail: 15 }, { month: 'Jun', deploys: 11, changeFail: 14 }, { month: 'Jul', deploys: 12, changeFail: 12 }, { month: 'Aug', deploys: 11, changeFail: 16 }, { month: 'Sep', deploys: 13, changeFail: 11 }],
  },
  retail: {
    deploysPerWeek: 21, leadTimeDays: 2.5,
    teams: [{ team: 'E-commerce', capacity: 95, wip: 16, onTime: 80 }, { team: 'Stores & POS', capacity: 82, wip: 8, onTime: 77 }, { team: 'Fulfilment', capacity: 90, wip: 9, onTime: 72 }],
    trend: [{ month: 'May', deploys: 80, changeFail: 8 }, { month: 'Jun', deploys: 84, changeFail: 7 }, { month: 'Jul', deploys: 88, changeFail: 7 }, { month: 'Aug', deploys: 90, changeFail: 8 }, { month: 'Sep', deploys: 96, changeFail: 9 }],
  },
}
