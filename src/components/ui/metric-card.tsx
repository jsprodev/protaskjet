type MetricCardProps = {
  icon: React.ReactNode
  label: string
  value: number | string
  footer?: React.ReactNode
}

export const MetricCard = ({ icon, label, value, footer }: MetricCardProps) => {
  return (
    <div className="group flex flex-col rounded-2xl border border-neutral-200 bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-[box-shadow,border-color] duration-200 hover:border-neutral-300 hover:shadow-[0_6px_24px_rgba(0,0,0,0.08)]">
      {/* Top row: Icon + Label / Value */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">{icon}</div>
          <p className="text-ui-md font-semibold text-neutral-900">{label}</p>
        </div>
        <h3 className="text-ui-xl font-semibold text-neutral-900 tabular-nums">{value}</h3>
      </div>

      {/* Footer */}
      {footer && <div className="mt-4 text-xs text-neutral-500">{footer}</div>}
    </div>
  )
}
