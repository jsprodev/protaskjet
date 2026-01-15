import { Bar, BarChart, Cell, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'
import { useProjects } from '@/context/ProjectsContext'

export const ProjectsOverviewByStatus = () => {
  const { projects } = useProjects()

  const projectsByStatus = projects.reduce((acc: any, project: any) => {
    acc[project.status] = (acc[project.status] || 0) + 1
    return acc
  }, {})

  const projectsByStatusArray = Object.entries(projectsByStatus).map(([status, count]) => ({
    status,
    count,
  }))

  const chartConfig = {
    count: { label: 'Count' },
    active: { label: 'Active', color: 'var(--status-active)' },
    'on-hold': { label: 'On Hold', color: 'var(--status-on-hold)' },
    completed: { label: 'Completed', color: 'var(--status-completed)' },
    archived: { label: 'Archived', color: 'var(--status-archived)' },
  } satisfies ChartConfig

  const getStatusColor = (status: string): string => {
    return chartConfig[status as keyof typeof chartConfig]?.color || 'var(--status-active)'
  }
  return (
    <div className="flex flex-wrap rounded-2xl bg-white p-4 shadow-xl shadow-slate-900/10">
      <h3 className="w-full text-base font-semibold text-slate-600">Projects Overview</h3>
      {/* <p className="mt-1 w-full text-xs text-slate-600">Distribution by status</p> */}

      <ChartContainer config={chartConfig} className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={projectsByStatusArray}
            layout="vertical"
            margin={{ top: 0, right: 30, left: 0, bottom: 0 }}
            accessibilityLayer
            barSize={40}
          >
            {/* <CartesianGrid strokeDasharray="2 2" stroke="rgba(0,0,0,0.1)" vertical={false} /> */}

            <XAxis
              type="number"
              stroke="rgba(0,0,0,0.1)"
              style={{ fontSize: '12px' }}
              allowDecimals={false}
              tick={{ fill: '#64748b' }}
            />

            <YAxis
              dataKey="status"
              type="category"
              tickLine={false}
              axisLine={false}
              width={90}
              tick={{ fontSize: '12px', fill: '#64748b', fontWeight: 500 }}
              tickFormatter={(value) => chartConfig[value as keyof typeof chartConfig]?.label || value}
            />

            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  hideLabel
                  className="rounded-md border border-slate-200 bg-white p-2 shadow-lg"
                  formatter={(value, name, item) => {
                    return (
                      <div className="flex items-center gap-3">
                        <div
                          className="h-3 w-3 flex-shrink-0 rounded-full"
                          style={{ backgroundColor: getStatusColor(item.payload.status) }}
                        />
                        <div className="flex items-center gap-3">
                          <span className="font-medium text-slate-900 capitalize">{item.payload.status}</span>
                          <span className="font-bold text-slate-900">{value}</span>
                        </div>
                      </div>
                    )
                  }}
                />
              }
            />

            <Bar dataKey="count" fill="#3b82f6" radius={[0, 8, 8, 0]} animationDuration={800}>
              {projectsByStatusArray.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getStatusColor(entry.status)} opacity={0.85} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>

      {/* Stats Footer */}
      {/* <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-4">
        <div className="text-xs text-slate-500">
          Total Projects:{' '}
          <span className="font-semibold text-slate-900">
            {projectsByStatusArray.reduce((sum, item) => sum + item.count, 0)}
          </span>
        </div>
      </div> */}
    </div>
  )
}
