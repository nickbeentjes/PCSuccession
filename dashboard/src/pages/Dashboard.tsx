import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { agentsApi, migrationsApi } from '@/lib/api'
import { Monitor, GitCompare, Activity, Clock } from 'lucide-react'

export function Dashboard() {
  const { data: agents } = useQuery({
    queryKey: ['agents'],
    queryFn: () => agentsApi.list().then(res => res.data),
  })

  const { data: migrations } = useQuery({
    queryKey: ['migrations'],
    queryFn: () => migrationsApi.list().then(res => res.data),
  })

  const activeAgents = agents?.filter((a: any) => a.status === 'active').length || 0
  const activeMigrations = migrations?.filter((m: any) => m.status === 'in_progress').length || 0
  const completedMigrations = migrations?.filter((m: any) => m.status === 'completed').length || 0

  const stats = [
    {
      name: 'Active Agents',
      value: activeAgents,
      icon: Monitor,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
    },
    {
      name: 'Active Migrations',
      value: activeMigrations,
      icon: Activity,
      color: 'text-green-600',
      bg: 'bg-green-100',
    },
    {
      name: 'Completed Migrations',
      value: completedMigrations,
      icon: GitCompare,
      color: 'text-purple-600',
      bg: 'bg-purple-100',
    },
    {
      name: 'Pending Migrations',
      value: migrations?.filter((m: any) => m.status === 'planning' || m.status === 'ready').length || 0,
      icon: Clock,
      color: 'text-orange-600',
      bg: 'bg-orange-100',
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Overview of your PC migration operations
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="bg-white rounded-lg shadow p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`${stat.bg} p-3 rounded-lg`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Agents */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Agents</h2>
          </div>
          <div className="p-6">
            {agents?.slice(0, 5).map((agent: any) => (
              <Link
                key={agent.id}
                to={`/agents/${agent.id}`}
                className="flex items-center justify-between py-3 hover:bg-gray-50 rounded-lg px-3 -mx-3"
              >
                <div>
                  <p className="font-medium text-gray-900">{agent.computer_name}</p>
                  <p className="text-sm text-gray-500">{agent.user_name}</p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  agent.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {agent.status}
                </span>
              </Link>
            ))}
            {(!agents || agents.length === 0) && (
              <p className="text-gray-500 text-center py-4">No agents yet</p>
            )}
          </div>
        </div>

        {/* Recent Migrations */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Migrations</h2>
          </div>
          <div className="p-6">
            {migrations?.slice(0, 5).map((migration: any) => (
              <Link
                key={migration.id}
                to={`/migrations/${migration.id}`}
                className="flex items-center justify-between py-3 hover:bg-gray-50 rounded-lg px-3 -mx-3"
              >
                <div>
                  <p className="font-medium text-gray-900">{migration.name}</p>
                  <p className="text-sm text-gray-500">
                    {migration.progress_percent.toFixed(0)}% complete
                  </p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  migration.status === 'completed' 
                    ? 'bg-green-100 text-green-800' 
                    : migration.status === 'in_progress'
                    ? 'bg-blue-100 text-blue-800'
                    : migration.status === 'failed'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {migration.status}
                </span>
              </Link>
            ))}
            {(!migrations || migrations.length === 0) && (
              <p className="text-gray-500 text-center py-4">No migrations yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}


