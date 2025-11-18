import { LayoutDashboard, FolderKanban, CheckSquare, Users, Settings2 } from 'lucide-react'

export const menuItems = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  {
    title: 'Projects',
    url: '/projects',
    icon: FolderKanban,
    createUrl: '/projects/new', // ← Add this
  },
  {
    title: 'Tasks',
    url: '/tasks',
    icon: CheckSquare,
    createUrl: '/tasks/new',
  },
  {
    title: 'Users',
    url: '/users',
    icon: Users,
    createUrl: '/users/new',
  },
  { title: 'Settings', url: '/settings', icon: Settings2 },
]

export const quickCreateMenu = [
  { title: 'Project', url: '/projects/new', icon: FolderKanban },
  { title: 'Task', url: '/tasks/new', icon: CheckSquare },
  { title: 'User', url: '/users/new', icon: Users },
]
