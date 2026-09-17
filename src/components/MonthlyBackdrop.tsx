import { useMemo } from 'react'
import { getMonthlyBackground } from '../lib/monthlyBackground'

export function MonthlyBackdrop() {
  const src = useMemo(() => getMonthlyBackground(new Date()), [])

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-canvas" aria-hidden="true">
      <img src={src} className="h-full w-full object-cover opacity-[0.14]" alt="" />
      <div className="absolute inset-0 bg-canvas/60" />
    </div>
  )
}
