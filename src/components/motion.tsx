// Motion helpers for the Technology Control Plane. Animations run on load and on user actions only (never on the
// 1-second simulation tick), and are skipped when the user prefers reduced motion (MotionConfig reducedMotion="user").
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { AnimatePresence, animate, motion, useReducedMotion } from 'motion/react'

/** Number that counts up to its value (and re-animates when the value changes, e.g. on a scope switch). */
export function CountUp({ value, decimals = 0, format }: { value: number; decimals?: number; format?: (v: number) => string }) {
  const reduce = useReducedMotion()
  const [shown, setShown] = useState(reduce ? value : 0)
  const from = useRef(reduce ? value : 0)
  useEffect(() => {
    if (reduce) { setShown(value); from.current = value; return }
    const c = animate(from.current, value, { duration: 0.9, ease: [0.16, 1, 0.3, 1], onUpdate: (v) => setShown(v) })
    from.current = value
    return () => c.stop()
  }, [value, reduce])
  const v = Number(shown.toFixed(decimals))
  return <span className="tabular-nums">{format ? format(v) : v.toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}</span>
}

/** Fades and lifts a block in once, when it first scrolls into view. */
export function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div className={className} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }} transition={{ duration: 0.45, delay, ease: 'easeOut' }}>
      {children}
    </motion.div>
  )
}

/** Height-animated open/close for drill-down panels. */
export function Collapse({ open, children }: { open: boolean; children: ReactNode }) {
  const [settled, setSettled] = useState(false)   // overflow visible once open, so hover previews are not clipped
  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div key="c" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: 'easeOut' }}
          onAnimationStart={() => setSettled(false)} onAnimationComplete={() => setSettled(open)} style={{ overflow: settled ? 'visible' : 'hidden' }}>
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/** Cross-fades its content whenever `k` changes (scope switch, next impact chain). */
export function Swap({ k, children, className }: { k: string | number; children: ReactNode; className?: string }) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div key={k} className={className} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.25 }}>
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

export { motion }
