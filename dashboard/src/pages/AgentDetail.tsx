import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { agentsApi } from '@/lib/api'
import { Monitor, HardDrive, Cpu, MemoryStick, Package } from 'lucide-react'

export function AgentDetail() {
  const { agentId } = useParams()

  const { data: agent } = useQuery({
    queryKey: ['agent', agentId],
    queryFn: () => agentsApi.get(agentId!).then(res => res.data),
  })

  const { data: inventory } = useQuery({
    queryKey: ['agent-inventory', agentId],
    queryFn: () => agentsApi.getInventory(agentId!).then(res => res.data),
    enabled: !!agentId,
  })

  if (!agent) return <div>Loading...</div>

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="bg-blue-100 p-4 rounded-lg">
            <Monitor className="w-8 h-8 text-blue-600" />
          </div>
          <div className="ml-6">
            <h1 className="text-2xl font-bold text-gray-900">{agent.computer_name}</h1>
            <p className="text-gray-600">{agent.user_name} • {agent.os_version}</p>
          </div>
        </div>
      </div>

      {inventory && (
        <>
          {/* System Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">System Information</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="flex items-center">
                <Cpu className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Processor</p>
                  <p className="font-medium text-gray-900">
                    {inventory.system_info?.processor_name || 'Unknown'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {inventory.system_info?.processor_count} cores
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <MemoryStick className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Memory</p>
                  <p className="font-medium text-gray-900">
                    {((inventory.system_info?.total_memory_mb || 0) / 1024).toFixed(0)} GB
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <HardDrive className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Storage Used</p>
                  <p className="font-medium text-gray-900">
                    {((inventory.stats?.total_data_size_mb || 0) / 1024).toFixed(1)} GB
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <Package className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Applications</p>
                  <p className="font-medium text-gray-900">
                    {inventory.stats?.total_applications || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Applications */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Installed Applications</h2>
            </div>
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-sm font-medium text-gray-500 border-b">
                      <th className="pb-3">Name</th>
                      <th className="pb-3">Version</th>
                      <th className="pb-3">Publisher</th>
                      <th className="pb-3">Install Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventory.installed_applications?.slice(0, 20).map((app: any, idx: number) => (
                      <tr key={idx} className="border-b last:border-0">
                        <td className="py-3 text-gray-900">{app.name}</td>
                        <td className="py-3 text-gray-600">{app.version}</td>
                        <td className="py-3 text-gray-600">{app.publisher}</td>
                        <td className="py-3 text-gray-600">{app.install_date || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

