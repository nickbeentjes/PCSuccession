import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { agentsApi } from '@/lib/api'
import { Monitor, Circle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export function Agents() {
  const { data: agents, isLoading } = useQuery({
    queryKey: ['agents'],
    queryFn: () => agentsApi.list().then(res => res.data),
  })

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Agents</h1>
          <p className="mt-2 text-gray-600">
            Manage and monitor your deployed agents
          </p>
        </div>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents?.map((agent: any) => (
          <Link
            key={agent.id}
            to={`/agents/${agent.id}`}
            className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Monitor className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {agent.computer_name}
                  </h3>
                  <p className="text-sm text-gray-500">{agent.user_name}</p>
                </div>
              </div>
              <Circle 
                className={`w-3 h-3 ${
                  agent.status === 'active' ? 'fill-green-500 text-green-500' : 'fill-gray-400 text-gray-400'
                }`}
              />
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">OS:</span>
                <span className="text-gray-900">{agent.os_version}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Status:</span>
                <span className={`font-medium ${
                  agent.status === 'active' ? 'text-green-600' : 'text-gray-600'
                }`}>
                  {agent.status}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Last Seen:</span>
                <span className="text-gray-900">
                  {agent.last_seen 
                    ? formatDistanceToNow(new Date(agent.last_seen), { addSuffix: true })
                    : 'Never'
                  }
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {(!agents || agents.length === 0) && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Monitor className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No agents yet</h3>
          <p className="text-gray-500">
            Deploy an agent to start monitoring and migrating PCs
          </p>
        </div>
      )}
    </div>
  )
}

