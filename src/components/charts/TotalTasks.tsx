import { useTasks } from '@/context/TasksContext'
import { ListTodo } from 'lucide-react'
import { MetricCard } from '@/components/ui/metric-card'

export const TotalTasksCard = () => {
  const { tasks } = useTasks()

  const total = tasks.length
  const completed = tasks.filter((t) => t.status === 'done').length
  const pending = total - completed
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0

  return (
    <MetricCard
      icon={<ListTodo className="size-6 text-neutral-600" />}
      label="Total Tasks"
      value={total}
      footer={
        <div className="mt-3 space-y-3">
          {/* Progress bar */}
          <div className="h-3 w-full overflow-hidden rounded-full bg-neutral-100">
            <div
              className="h-full rounded-full bg-[var(--status-completed)] transition-all duration-500 ease-out"
              style={{ width: `${completionRate}%` }}
            />
          </div>

          {/* Breakdown */}
          <div className="text-ui-xs flex justify-between text-neutral-500 tabular-nums">
            <span>
              {completed} done ({completionRate}%)
            </span>
            <span>{pending} remaining</span>
          </div>
        </div>
      }
    />
  )
}
