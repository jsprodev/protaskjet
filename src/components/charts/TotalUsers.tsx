import { useUsers } from '@/context/UsersContext'
import { Users } from 'lucide-react'
import { MetricCard } from '@/components/ui/metric-card'

export const TotalUsersCard = () => {
  const { users } = useUsers()

  // Count users by role
  const usersByRole = users.reduce((acc: Record<string, number>, user) => {
    acc[user.role] = (acc[user.role] || 0) + 1
    return acc
  }, {})

  return (
    <MetricCard
      icon={<Users className="size-5" />}
      label="Total Users"
      value={users.length}
      footer={
        Object.keys(usersByRole).length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {Object.entries(usersByRole).map(([role, count]) => (
              <div
                key={role}
                className="flex items-center justify-between gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-medium text-neutral-700"
              >
                <span className="capitalize">{role}</span>
                <span className="font-semibold tabular-nums">{count}</span>
              </div>
            ))}
          </div>
        )
      }
    />
  )
}
