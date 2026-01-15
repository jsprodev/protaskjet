import { Pie, PieChart, ResponsiveContainer, Cell } from 'recharts'
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { useTasks } from '@/context/TasksContext'

export const TasksOverviewByStatus = () => {
  const { tasks } = useTasks()

  const tasksByStatus = tasks.reduce((acc: any, task: any) => {
    acc[task.status] = (acc[task.status] || 0) + 1
    return acc
  }, {})

  const tasksByStatusArray = Object.entries(tasksByStatus).map(([status, count]) => ({
    status,
    count,
  }))

  const chartConfig = {
    count: {
      label: 'Count',
    },
    todo: {
      label: 'To Do',
      color: 'var(--status-todo)',
    },
    'in-progress': {
      label: 'In Progress',
      color: 'var(--status-in-progress)',
    },
    review: {
      label: 'Review',
      color: 'var(--status-review)',
    },
    done: {
      label: 'Done',
      color: 'var(--status-done)',
    },
    blocked: {
      label: 'Blocked',
      color: 'var(--status-blocked)',
    },
  } satisfies ChartConfig

  const getStatusColor = (status: string): string => {
    return chartConfig[status as keyof typeof chartConfig]?.color || '#06b6d4'
  }

  return (
    <div className="flex flex-col rounded-2xl bg-white p-4 shadow-xl shadow-slate-900/10">
      <div className="mb-6">
        <h3 className="text-md text-center text-slate-600">Tasks Overview</h3>
      </div>

      <ChartContainer config={chartConfig} className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent hideLabel className="rounded-md p-2" />} />
            <Pie
              data={tasksByStatusArray}
              dataKey="count"
              nameKey="status"
              outerRadius={100}
              labelLine={false}
              opacity={0.8}
              // label
              label={({ payload, ...props }) => {
                return (
                  <text
                    cx={props.cx}
                    cy={props.cy}
                    x={props.x}
                    y={props.y}
                    textAnchor={props.textAnchor}
                    dominantBaseline={props.dominantBaseline}
                    fill="hsla(var(--foreground))"
                  >
                    {payload.count}
                  </text>
                )
              }}
            >
              {tasksByStatusArray.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getStatusColor(entry.status)} />
              ))}
            </Pie>
            <ChartLegend
              content={<ChartLegendContent nameKey="status" />}
              className="translate-y-0 flex-wrap gap-x-3 text-[12px] text-slate-600 *:justify-center"
            />
          </PieChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  )
}
