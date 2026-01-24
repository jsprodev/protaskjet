import { useProjects } from '@/context/ProjectsContext'
import { FolderKanban } from 'lucide-react'
import { MetricCard } from '@/components/ui/metric-card'

export const TotalProjectsCard = () => {
  const { projects } = useProjects()

  const total = projects.length
  const completed = projects.filter((p) => p.status === 'completed').length
  const active = projects.filter((p) => p.status !== 'completed').length
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0

  return (
    <MetricCard
      icon={<FolderKanban className="size-5" />}
      label="Total Projects"
      value={total}
      footer={
        <div className="mt-3 space-y-3">
          {/* Progress bar */}
          <div className="h-3 w-full overflow-hidden rounded-full bg-neutral-100">
            <div
              className="h-full rounded-full bg-green-500 transition-all duration-500 ease-out"
              style={{ width: `${completionRate}%` }}
            />
          </div>

          {/* Breakdown */}
          <div className="text-ui-xs flex justify-between font-medium text-neutral-500 tabular-nums">
            <span>
              {completed} completed ({completionRate}%)
            </span>
            <span>{active} Remaining</span>
          </div>
        </div>
      }
    />
  )
}
