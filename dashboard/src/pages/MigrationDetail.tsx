import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { migrationsApi } from '@/lib/api'
import { Play, CheckCircle2, XCircle, Clock, Cpu, MemoryStick, HardDrive } from 'lucide-react'

export function MigrationDetail() {
  const { migrationId } = useParams()
  const queryClient = useQueryClient()

  const { data: migration } = useQuery({
    queryKey: ['migration', migrationId],
    queryFn: () => migrationsApi.get(migrationId!).then(res => res.data),
    refetchInterval: (data) => {
      return data?.status === 'in_progress' ? 3000 : false
    },
  })

  const startMutation = useMutation({
    mutationFn: () => migrationsApi.start(migrationId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['migration', migrationId] })
    },
  })

  if (!migration) return <div>Loading...</div>

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{migration.name}</h1>
            <p className="text-gray-600 mt-1">{migration.id}</p>
          </div>
          <div className="flex items-center space-x-4">
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${
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
            {migration.status === 'ready' && (
              <button
                onClick={() => startMutation.mutate()}
                className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
              >
                <Play className="w-5 h-5 mr-2" />
                Start Migration
              </button>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm font-medium text-gray-900">
              {migration.progress_percent.toFixed(0)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-primary h-3 rounded-full transition-all duration-500"
              style={{ width: `${migration.progress_percent}%` }}
            ></div>
          </div>
          {migration.current_task && (
            <p className="mt-2 text-sm text-gray-600">
              Current: {migration.current_task}
            </p>
          )}
        </div>
      </div>

      {/* Hardware Recommendation */}
      {migration.hardware_recommendation && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Recommended Hardware Specifications
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start">
              <Cpu className="w-6 h-6 text-blue-600 mr-3 mt-1" />
              <div>
                <h3 className="font-medium text-gray-900">CPU</h3>
                <p className="text-gray-700">{migration.hardware_recommendation.cpu?.recommendation}</p>
                <p className="text-sm text-gray-500 mt-1">{migration.hardware_recommendation.cpu?.justification}</p>
              </div>
            </div>
            <div className="flex items-start">
              <MemoryStick className="w-6 h-6 text-green-600 mr-3 mt-1" />
              <div>
                <h3 className="font-medium text-gray-900">RAM</h3>
                <p className="text-gray-700">
                  {migration.hardware_recommendation.ram?.recommendation_gb} GB
                </p>
                <p className="text-sm text-gray-500 mt-1">{migration.hardware_recommendation.ram?.justification}</p>
              </div>
            </div>
            <div className="flex items-start">
              <HardDrive className="w-6 h-6 text-purple-600 mr-3 mt-1" />
              <div>
                <h3 className="font-medium text-gray-900">Storage</h3>
                <p className="text-gray-700">
                  {migration.hardware_recommendation.storage?.recommendation_gb} GB {migration.hardware_recommendation.storage?.type}
                </p>
                <p className="text-sm text-gray-500 mt-1">{migration.hardware_recommendation.storage?.justification}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tasks */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Migration Tasks</h2>
        <div className="space-y-3">
          {migration.tasks?.map((task: any, idx: number) => {
            const isCompleted = migration.completed_tasks?.some((t: any) => t.name === task.name)
            const isFailed = migration.failed_tasks?.some((t: any) => t.task?.name === task.name)
            const isCurrent = migration.current_task === task.name

            return (
              <div
                key={idx}
                className={`flex items-start p-4 rounded-lg border-2 ${
                  isCompleted
                    ? 'border-green-200 bg-green-50'
                    : isFailed
                    ? 'border-red-200 bg-red-50'
                    : isCurrent
                    ? 'border-blue-200 bg-blue-50'
                    : 'border-gray-200'
                }`}
              >
                <div className="mr-3 mt-1">
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  ) : isFailed ? (
                    <XCircle className="w-5 h-5 text-red-600" />
                  ) : isCurrent ? (
                    <Clock className="w-5 h-5 text-blue-600 animate-pulse" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{task.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{task.instructions}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    Estimated: {task.estimated_minutes} minutes
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Manual Steps */}
      {migration.manual_steps && migration.manual_steps.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-amber-900 mb-4">
            Manual Steps Required
          </h2>
          <div className="space-y-4">
            {migration.manual_steps.map((step: any, idx: number) => (
              <div key={idx}>
                <h3 className="font-medium text-amber-900">{step.title}</h3>
                <p className="text-amber-800 text-sm mt-1">{step.description}</p>
                {step.instructions && (
                  <ul className="mt-2 space-y-1">
                    {step.instructions.map((instruction: string, i: number) => (
                      <li key={i} className="text-sm text-amber-700 ml-4">
                        • {instruction}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

