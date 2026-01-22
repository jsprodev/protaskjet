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
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
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
