import { TaskPriorityDistribution } from '@/components/charts/TaskPriorityDistribution'
import { ProjectsOverviewByStatus } from '../components/charts/ProjectsOverviewByStatus'
import { TasksOverviewByStatus } from '@/components/charts/TasksOverviewByStatus'
import { TotalProjectsCard } from '@/components/charts/TotalProjects'
import { TotalTasksCard } from '@/components/charts/TotalTasks'
import { TotalUsersCard } from '@/components/charts/TotalUsers'
import { UsersOverview } from '@/components/charts/UsersOverview'
import { ProjectProgressChart } from '@/components/charts/ProjectProgressChart'
import { RecentActivityFeed } from '@/components/charts/RecentActivityFeed'

export const DashboardPage = () => {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-ui-xl font-semibold text-neutral-900">Dashboard</h1>
          <p className="text-ui-sm text-neutral-500">Overview of your workspace</p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6">
        <TotalProjectsCard />
        <TotalTasksCard />
        <TotalUsersCard />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ProjectsOverviewByStatus />
        <TasksOverviewByStatus />
        <UsersOverview />
        <TaskPriorityDistribution />
        <ProjectProgressChart />
        <RecentActivityFeed />
      </div>
    </div>
  )
}
