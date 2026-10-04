import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

export function Card({ title, action, children, className = '' }: { title?: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`bg-white rounded-xl border border-slate-200 shadow-sm p-5 ${className}`}>
      {title && (
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold tracking-wide text-slate-800 uppercase">{title}</h3>
          {action}
        </div>
      )}
      {children}
    </section>
  )
}

export function PageHeader({ title, subtitle, owner }: { title: string; subtitle: string; owner?: string }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-extrabold text-[#0b2a6b] uppercase tracking-tight">{title}</h1>
        <p className="text-slate-500 text-sm mt-1">{subtitle}</p>
      </div>
      {owner && (
        <span className="text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 rounded-full px-3 py-1">
          Workstream lead: {owner}
        </span>
      )}
    </div>
  )
}

export function Kpi({ icon: Icon, label, value, delta, tone }: { icon: LucideIcon; label: string; value: string; delta: string; tone: string }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col items-center text-center">
      <div className={`w-11 h-11 rounded-full flex items-center justify-center text-white mb-2 ${tone}`}>
        <Icon size={22} />
      </div>
      <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">{label}</div>
      <div className="text-2xl font-extrabold text-slate-900 mt-1">{value}</div>
      <div className="text-xs text-emerald-600 font-semibold mt-1">{delta}</div>
    </div>
  )
}

const toneMap: Record<string, string> = {
  Low: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Medium: 'bg-amber-50 text-amber-700 border-amber-200',
  High: 'bg-orange-50 text-orange-700 border-orange-200',
  Critical: 'bg-red-50 text-red-700 border-red-200',
  'On Track': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'At Risk': 'bg-amber-50 text-amber-700 border-amber-200',
  Delayed: 'bg-red-50 text-red-700 border-red-200',
  Compliant: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Partial: 'bg-amber-50 text-amber-700 border-amber-200',
  Gap: 'bg-red-50 text-red-700 border-red-200',
  Active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Idle: 'bg-slate-50 text-slate-600 border-slate-200',
  Training: 'bg-blue-50 text-blue-700 border-blue-200',
  Error: 'bg-red-50 text-red-700 border-red-200',
  Passed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Conditional: 'bg-amber-50 text-amber-700 border-amber-200',
  Approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Rejected: 'bg-red-50 text-red-700 border-red-200',
  Escalated: 'bg-amber-50 text-amber-700 border-amber-200',
  Warning: 'bg-amber-50 text-amber-700 border-amber-200',
  Info: 'bg-blue-50 text-blue-700 border-blue-200',
}

export function Badge({ children }: { children: string }) {
  return (
    <span className={`inline-block text-[11px] font-semibold border rounded-md px-2 py-0.5 whitespace-nowrap ${toneMap[children] ?? 'bg-slate-50 text-slate-600 border-slate-200'}`}>
      {children}
    </span>
  )
}

export function Bar({ value, color = 'bg-blue-600' }: { value: number; color?: string }) {
  return (
    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(value, 100)}%` }} />
    </div>
  )
}

export function Ring({ value, size = 44, color = '#1d4ed8' }: { value: number; size?: number; color?: string }) {
  const r = (size - 6) / 2
  const c = 2 * Math.PI * r
  return (
    <svg width={size} height={size} className="block">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e2e8f0" strokeWidth={5} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={5} strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)} transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text x="50%" y="54%" textAnchor="middle" dominantBaseline="middle" fontSize={size / 4} fontWeight={700} fill="#0f172a">
        {value}%
      </text>
    </svg>
  )
}

export const money = (m: number) => `$${m.toFixed(1)}M`
