import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { migrationsApi, agentsApi } from '@/lib/api'
import { GitCompare, Plus } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export function Migrations() {
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const queryClient = useQueryClient()

  const { data: migrations, isLoading } = useQuery({
    queryKey: ['migrations'],
    queryFn: () => migrationsApi.list().then(res => res.data),
  })

  const { data: agents } = useQuery({
    queryKey: ['agents'],
    queryFn: () => agentsApi.list().then(res => res.data),
  })

  const createMutation = useMutation({
    mutationFn: (data: any) => migrationsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['migrations'] })
      setShowCreateDialog(false)
    },
  })

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Migrations</h1>
          <p className="mt-2 text-gray-600">
            Plan and execute PC migrations
          </p>
        </div>
        <button
          onClick={() => setShowCreateDialog(true)}
          className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
        >
          <Plus className="w-5 h-5 mr-2" />
          New Migration
        </button>
      </div>

      {/* Migrations List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr className="text-left text-sm font-medium text-gray-500">
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Progress</th>
              <th className="px-6 py-3">Created</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {migrations?.map((migration: any) => (
              <tr key={migration.id} className="border-t border-gray-200 hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium text-gray-900">{migration.name}</p>
                    <p className="text-sm text-gray-500">{migration.id}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
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
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${migration.progress_percent}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600">
                      {migration.progress_percent.toFixed(0)}%
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-600">
                  {formatDistanceToNow(new Date(migration.created_at), { addSuffix: true })}
                </td>
                <td className="px-6 py-4">
                  <Link
                    to={`/migrations/${migration.id}`}
                    className="text-primary hover:text-primary/80 font-medium"
                  >
                    View Details
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {(!migrations || migrations.length === 0) && (
          <div className="p-12 text-center">
            <GitCompare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No migrations yet</h3>
            <p className="text-gray-500">
              Create your first migration to get started
            </p>
          </div>
        )}
      </div>

      {/* Create Dialog (simplified - would use a proper modal component) */}
      {showCreateDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Create Migration</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.currentTarget)
                createMutation.mutate({
                  name: formData.get('name'),
                  source_agent_id: formData.get('source_agent_id'),
                })
              }}
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Migration Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="My PC Migration"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Source Agent
                  </label>
                  <select
                    name="source_agent_id"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Select an agent...</option>
                    {agents?.map((agent: any) => (
                      <option key={agent.id} value={agent.id}>
                        {agent.computer_name} - {agent.user_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateDialog(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

