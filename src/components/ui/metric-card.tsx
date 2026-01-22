type MetricCardProps = {
  icon: React.ReactNode
  label: string
  value: number | string
  footer?: React.ReactNode
}

export const MetricCard = ({ icon, label, value, footer }: MetricCardProps) => {
  return (
    <div className="group flex flex-col rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-md">
      {/* Top row: Icon + Label / Value */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-100">{icon}</div>
          <p className="text-ui-lg font-semibold text-neutral-900">{label}</p>
        </div>
        <h3 className="text-ui-2xl font-semibold text-neutral-900 tabular-nums">{value}</h3>
      </div>

      {/* Footer */}
      {footer && <div className="mt-4 text-xs text-neutral-500">{footer}</div>}
    </div>
  )
}
