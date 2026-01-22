import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { useTasks } from '@/context/TasksContext'
import { AlertCircle, ListChevronsUpDown } from 'lucide-react'

export const TaskPriorityDistribution = () => {
  const { tasks } = useTasks()

  const tasksByPriority = tasks.reduce((acc: Record<string, number>, task) => {
    acc[task.priority] = (acc[task.priority] || 0) + 1
    return acc
  }, {})

  const priorityOrder = ['low', 'medium', 'high', 'urgent']
  const tasksByPriorityArray = priorityOrder
    .filter((priority) => tasksByPriority[priority] > 0)
    .map((priority) => ({
      priority,
      count: tasksByPriority[priority],
    }))

  const totalTasks = tasks.length

  const chartConfig = {
    count: { label: 'Tasks' },

    low: {
      label: 'Low',
      color: '#fed7aa', // orange-200 (very soft, background-like)
    },

    medium: {
      label: 'Medium',
      color: '#fdba74', // orange-300 (gentle attention)
    },

    high: {
      label: 'High',
      color: '#fb923c', // orange-400 (strong but not alarming)
    },

    urgent: {
      label: 'Urgent',
      color: '#f97316', // orange-500 (clear urgency)
    },
  } satisfies ChartConfig

  const getPriorityColor = (priority: string) => chartConfig[priority as keyof typeof chartConfig]?.color || '#06b6d4'

  const urgentCount = tasksByPriority['urgent'] || 0
  const highCount = tasksByPriority['high'] || 0
  const criticalTasks = urgentCount + highCount

  return (
    <div className="flex flex-col rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition-shadow duration-300 hover:shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
            <ListChevronsUpDown className="h-5 w-5 text-blue-500" />
          </div>
          <div>
            <h3 className="text-ui-md font-semibold text-neutral-900">Task Priority</h3>
            <p className="text-ui-xs text-neutral-500">Distribution by urgency</p>
          </div>
        </div>

        {/* {criticalTasks > 0 && (
          <div className="flex items-center justify-center gap-1 rounded-full bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700">
            <AlertCircle className="h-3.5 w-3.5" />
            {criticalTasks} Critical
          </div>
        )} */}
      </div>

      {/* Semicircle Gauge */}
      <ChartContainer config={chartConfig} className="h-60">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent hideLabel className="rounded-md p-2 shadow-lg" />} />
            <Pie
              data={tasksByPriorityArray}
              dataKey="count"
              nameKey="priority"
              cx="50%"
              cy="70%"
              startAngle={180}
              endAngle={0}
              innerRadius={70}
              outerRadius={110}
              labelLine={false}
              paddingAngle={2}
              label={({ payload, ...props }) => (
                <text
                  x={props.x}
                  y={props.y}
                  textAnchor={props.textAnchor}
                  dominantBaseline={props.dominantBaseline}
                  fill="white"
                  className="text-sm font-semibold"
                >
                  {payload.count}
                </text>
              )}
            >
              {tasksByPriorityArray.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getPriorityColor(entry.priority)} />
              ))}
            </Pie>
            {/* Center Label */}
            <text x="50%" y="70%" textAnchor="middle" dominantBaseline="middle">
              <tspan x="50%" dy="-0.5em" className="fill-neutral-900 text-3xl font-bold">
                {totalTasks}
              </tspan>
              <tspan x="50%" dy="1.5em" className="fill-neutral-500 text-xs">
                Total Tasks
              </tspan>
            </text>
            {/* Legend inside PieChart */}
            <ChartLegend
              content={<ChartLegendContent nameKey="priority" />}
              className="translate-y-0 flex-wrap gap-x-3 text-xs text-neutral-600 *:justify-center"
            />
          </PieChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  )
}
