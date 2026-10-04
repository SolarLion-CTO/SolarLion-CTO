import { domainOrder, domains } from '../data/domains'
import { useStore } from '../store'

export default function DomainSwitch() {
  const { domainId, setDomainId } = useStore()
  return (
    <div className="flex rounded-lg border border-slate-200 overflow-hidden text-sm font-semibold bg-white">
      {domainOrder.map((d) => (
        <button key={d} onClick={() => setDomainId(d)} className={`px-4 py-2 ${d === domainId ? 'bg-[#0b2a6b] text-white' : 'hover:bg-slate-50'}`}>
          {domains[d].name}
        </button>
      ))}
    </div>
  )
}
