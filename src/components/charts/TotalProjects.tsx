import { useProjects } from '@/context/ProjectsContext'
import { FolderKanban } from 'lucide-react'
import { MetricCard } from '@/components/ui/metric-card'

export const TotalProjectsCard = () => {
  const { projects } = useProjects()

  const stats = {
    active: projects.filter((p) => p.status === 'active').length,
    completed: projects.filter((p) => p.status === 'completed').length,
    onHold: projects.filter((p) => p.status === 'on-hold').length,
    archived: projects.filter((p) => p.status === 'archived').length,
  }

  return (
    <MetricCard
      icon={<FolderKanban className="size-6 text-neutral-600" />}
      label="Total Projects"
      value={projects.length}
      footer={
        <div className="mt-2 grid grid-cols-2 gap-2">
          <StatusCard label="Active" value={stats.active} color="active" />
          <StatusCard label="Completed" value={stats.completed} color="completed" />
          <StatusCard label="On hold" value={stats.onHold} color="on-hold" />
          <StatusCard label="Archived" value={stats.archived} color="archived" />
        </div>
      }
    />
  )
}

/* ------------------------------------------------ */
/* Status card: 2 per row, Apple-linear minimal    */
/* ------------------------------------------------ */
const StatusCard = ({
  label,
  value,
  color,
}: {
  label: string
  value: number
  color: 'active' | 'completed' | 'on-hold' | 'archived'
}) => {
  return (
    <div className="flex items-center justify-between rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-1.5 transition-colors hover:bg-neutral-100">
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: `var(--status-${color})` }} />
        <span className="text-xs font-medium text-neutral-600">{label}</span>
      </div>

      <span className="text-sm font-semibold text-neutral-900 tabular-nums">{value}</span>
    </div>
  )
}
