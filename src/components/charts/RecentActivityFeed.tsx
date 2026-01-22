import { useTasks } from '@/context/TasksContext'
import { useProjects } from '@/context/ProjectsContext'
import { useUsers } from '@/context/UsersContext'
import { Activity, FolderKanban, ListTodo, Users } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

type ActivityItem = {
  id: string
  type: 'task' | 'project' | 'user'
  title: string
  description: string
  timestamp: string
  icon: React.ReactNode
  iconBg: string
}

export const RecentActivityFeed = () => {
  const { tasks } = useTasks()
  const { projects } = useProjects()
  const { users } = useUsers()

  const activities: ActivityItem[] = []

  // Add all tasks
  tasks.forEach((task) => {
    const isCompleted = task.status === 'done'
    const wasUpdated = new Date(task.updated_at).getTime() > new Date(task.created_at).getTime()

    let description = ''
    if (isCompleted) {
      description = 'Task completed'
    } else if (wasUpdated) {
      description = `Task Updated: ${task.status.replace('-', ' ')} • ${task.priority} priority`
    } else {
      description = `Task Created: ${task.status.replace('-', ' ')} • ${task.priority} priority`
    }

    activities.push({
      id: `task-${task.id}`,
      type: 'task',
      title: task.title,
      description,
      timestamp: task.updated_at || task.created_at,
      icon: <ListTodo className="h-4 w-4 text-blue-600" />,
      iconBg: 'bg-blue-100',
    })
  })

  // Add all projects
  projects.forEach((project) => {
    activities.push({
      id: `project-${project.id}`,
      type: 'project',
      title: project.name,
      description: `Project: ${project.status.replace('-', ' ')}`,
      timestamp: project.updated_at || project.created_at,
      icon: <FolderKanban className="h-4 w-4 text-purple-600" />,
      iconBg: 'bg-purple-100',
    })
  })

  // Add all users
  users.forEach((user) => {
    activities.push({
      id: `user-${user.id}`,
      type: 'user',
      title: user.name,
      description: `User joined as ${user.role}`,
      timestamp: user.created_at,
      icon: <Users className="h-4 w-4 text-cyan-600" />,
      iconBg: 'bg-cyan-100',
    })
  })

  // Sort by most recent and take top 10
  const recentActivities = activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  // .slice(0, 10)

  return (
    <div className="flex flex-col rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition-all duration-300 hover:border-neutral-300 hover:shadow-md">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
          <Activity className="h-5 w-5 text-blue-500" />
        </div>
        <div>
          <h3 className="text-ui-md font-semibold text-neutral-900">Recent Activity</h3>
          <p className="text-ui-xs text-neutral-500">Latest updates across the system</p>
        </div>
      </div>

      <div className="flex max-h-80 flex-1 flex-col space-y-3 overflow-auto pr-3">
        {recentActivities.length > 0 ? (
          recentActivities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center gap-3 rounded-lg border border-neutral-100 bg-neutral-50 p-2 transition-colors hover:bg-neutral-100"
            >
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${activity.iconBg}`}>
                {activity.icon}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-ui-sm truncate font-normal text-neutral-900">{activity.title}</p>
                <p className="text-ui-xs text-neutral-500">{activity.description}</p>
              </div>
              <span className="shrink-0 text-xs text-neutral-400">
                {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
              </span>
            </div>
          ))
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center py-8 text-center">
            <p className="text-ui-sm mt-3 font-medium text-neutral-900">No recent activity</p>
            <p className="text-ui-xs text-neutral-500">Activity will appear here</p>
          </div>
        )}
      </div>
    </div>
  )
}
