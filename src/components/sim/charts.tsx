import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { FORECAST_MONTHS, MONTHS } from '../../data/sim/model'
import { axisTick, chart } from '../../theme'
import { useRange } from './range'

/** 12-month trend (sliced by the time range) + dashed 3-month forecast + target line. Single axis, single hue. */
export function TrendChart({ series, forecast, target, name, height = 200, unit = '', score = false }: { series: number[]; forecast?: number[]; target?: number; name: string; height?: number; unit?: string; score?: boolean }) {
  const range = useRange()
  const start = 12 - range.points
  const data = [
    ...series.slice(start).map((v, i) => ({ m: MONTHS[start + i], actual: v, fc: start + i === 11 ? v : undefined })),
    ...(forecast ?? []).map((v, i) => ({ m: FORECAST_MONTHS[i] + '*', actual: undefined, fc: v })),
  ]
  return (
    <div style={{ height }} role="img" aria-label={`${name}: ${series[11]}${unit} now${target !== undefined ? `, target ${target}${unit}` : ''}`}>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ left: -12, right: 12, top: 6 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} vertical={false} />
          <XAxis dataKey="m" tick={axisTick} interval="preserveStartEnd" />
          <YAxis tick={axisTick} domain={score ? [(lo: number) => Math.max(0, Math.floor((Math.min(lo, target ?? lo) - 10) / 10) * 10), 100] : ['auto', 'auto']} width={58} tickFormatter={(v: number) => String(Math.round(v * 100) / 100)} />
          <Tooltip formatter={(v) => `${v}${unit}`} />
          {target !== undefined && <ReferenceLine y={target} stroke={chart.comparison} strokeDasharray="4 4" label={{ value: `Target ${target}`, fontSize: 11, fill: chart.axis, position: 'insideTopRight' }} />}
          <Line isAnimationActive={false} dataKey="actual" name={name} stroke={chart.primary} strokeWidth={2} dot={{ r: 3 }} connectNulls={false} />
          <Line isAnimationActive={false} dataKey="fc" name="Forecast" stroke={chart.primary} strokeWidth={2} strokeDasharray="5 4" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
