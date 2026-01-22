import { Pie, PieChart, ResponsiveContainer, Cell } from 'recharts'
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { useProjects } from '@/context/ProjectsContext'
import { FolderKanban } from 'lucide-react'

export const ProjectsOverviewByStatus = () => {
  const { projects } = useProjects()

  const projectsByStatus = projects.reduce((acc: Record<string, number>, project) => {
    acc[project.status] = (acc[project.status] || 0) + 1
    return acc
  }, {})

  const projectsByStatusArray = Object.entries(projectsByStatus).map(([status, count]) => ({
    status,
    count,
  }))

  const totalProjects = projects.length

  const chartConfig = {
    count: {
      label: 'Count',
    },
    active: {
      label: 'Active',
      color: 'var(--status-active)',
    },
    'on-hold': {
      label: 'On Hold',
      color: 'var(--status-on-hold)',
    },
    completed: {
      label: 'Completed',
      color: 'var(--status-completed)',
    },
    archived: {
      label: 'Archived',
      color: 'var(--status-archived)',
    },
  } satisfies ChartConfig

  const getStatusColor = (status: string): string => {
    return chartConfig[status as keyof typeof chartConfig]?.color || '#06b6d4'
  }

  return (
    <div className="flex flex-col rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition-all duration-300 hover:border-neutral-300 hover:shadow-md">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
          <FolderKanban className="h-5 w-5 text-blue-500" />
        </div>
        <div>
          <h3 className="text-ui-md font-semibold text-neutral-900">Projects by Status</h3>
          <p className="text-ui-xs text-neutral-500">Distribution across all projects</p>
        </div>
      </div>

      <ChartContainer config={chartConfig} className="h-70">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent hideLabel className="rounded-md p-2" />} />
            <Pie
              data={projectsByStatusArray}
              dataKey="count"
              nameKey="status"
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={110}
              labelLine={false}
              label={({ payload, ...props }) => {
                return (
                  <text
                    cx={props.cx}
                    cy={props.cy}
                    x={props.x}
                    y={props.y}
                    textAnchor={props.textAnchor}
                    dominantBaseline={props.dominantBaseline}
                    fill="white"
                    className="text-sm font-semibold"
                  >
                    {payload.count}
                  </text>
                )
              }}
            >
              {projectsByStatusArray.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getStatusColor(entry.status)} />
              ))}
            </Pie>
            {/* Center Label */}
            <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle">
              <tspan x="50%" dy="-0.5em" className="fill-neutral-900 text-3xl font-bold">
                {totalProjects}
              </tspan>
              <tspan x="50%" dy="1.5em" className="fill-neutral-500 text-xs">
                Total Projects
              </tspan>
            </text>
            <ChartLegend
              content={<ChartLegendContent nameKey="status" />}
              className="translate-y-0 flex-wrap gap-x-3 text-xs text-neutral-600 *:justify-center"
            />
          </PieChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  )
}
