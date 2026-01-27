import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'
import { useUsers } from '@/context/UsersContext'
import { useTasks } from '@/context/TasksContext'
import { Users } from 'lucide-react'

export const UsersOverview = () => {
  const { users } = useUsers()
  const { tasks } = useTasks()

  // Calculate tasks assigned to each user
  const userTaskCounts = users
    .map((user) => {
      const assignedTasks = tasks.filter((task) => {
        if (!task.assigned_to) return false
        return task.assigned_to === user.id
      })

      return {
        name: user.name.split(' ')[0], // First name only for better display
        tasks: assignedTasks.length,
        role: user.role,
      }
    })
    .sort((a, b) => b.tasks - a.tasks) // Sort by most tasks

  const chartConfig = {
    tasks: {
      label: 'Tasks',
      color: 'var(--status-todo)',
    },
  } satisfies ChartConfig

  return (
    <div className="flex flex-col rounded-2xl border border-neutral-200 bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-[box-shadow,border-color] duration-200 hover:border-neutral-300 hover:shadow-[0_6px_24px_rgba(0,0,0,0.08)]">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
          <Users className="h-5 w-5 text-blue-500" />
        </div>
        <div>
          <h3 className="text-ui-md font-semibold text-neutral-900">Users Overview</h3>
          <p className="text-ui-xs text-neutral-500">Tasks assigned to each user</p>
        </div>
      </div>

      <ChartContainer config={chartConfig} className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={userTaskCounts} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={{ stroke: '#e5e7eb' }} />
            <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={{ stroke: '#e5e7eb' }} allowDecimals={false} />
            <ChartTooltip
              content={<ChartTooltipContent className="rounded-md p-2" />}
              cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
            />
            <Bar dataKey="tasks" fill="oklch(62.3% 0.214 259.815)" radius={[12, 12, 0, 0]} opacity={1} />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  )
}
