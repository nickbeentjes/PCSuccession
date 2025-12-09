export interface Agent {
  id: string
  agent_id: string
  computer_name: string
  user_name: string
  os_version: string
  status: 'active' | 'inactive' | 'migrating' | 'error'
  last_seen: string
  created_at: string
  company_id: string
}

export interface Inventory {
  id: string
  timestamp: string
  system_info: SystemInfo
  installed_applications: Application[]
  registry_settings: any[]
  certificates: Certificate[]
  vpn_connections: VpnConnection[]
  user_data_locations: FileLocation[]
  application_usage: ApplicationUsage[]
  file_access: any[]
  system_performance: SystemPerformance
  stats: {
    total_applications: number
    total_data_size_mb: number
  }
}

export interface SystemInfo {
  computer_name: string
  user_name: string
  os_version: string
  processor_name: string
  processor_count: number
  total_memory_mb: number
  manufacturer: string
  model: string
}

export interface Application {
  name: string
  version: string
  publisher: string
  install_date: string
  install_location: string
}

export interface Certificate {
  subject: string
  issuer: string
  thumbprint: string
  not_before: string
  not_after: string
  has_private_key: boolean
}

export interface VpnConnection {
  name: string
  type: string
  server_address: string
}

export interface FileLocation {
  path: string
  type: string
  size_mb: number
  file_count: number
}

export interface ApplicationUsage {
  application_name: string
  executable_path: string
  first_seen: string
  last_seen: string
  total_minutes_used: number
  launch_count: number
}

export interface SystemPerformance {
  cpu_usage_percent: number
  memory_usage_percent: number
  disk_usage_percent: number
}

export interface Migration {
  id: string
  name: string
  source_agent_id: string
  target_agent_id: string | null
  status: 'planning' | 'ready' | 'in_progress' | 'completed' | 'failed' | 'cancelled'
  migration_plan: any
  tasks: MigrationTask[]
  completed_tasks: any[]
  failed_tasks: any[]
  current_task: string | null
  progress_percent: number
  estimated_duration_minutes: number | null
  started_at: string | null
  completed_at: string | null
  created_at: string
  ai_recommendations: any
  hardware_recommendation: HardwareRecommendation
  optimization_suggestions: any
  manual_steps: ManualStep[]
}

export interface MigrationTask {
  name: string
  order: number
  estimated_minutes: number
  instructions: string
  dependencies: string[]
}

export interface HardwareRecommendation {
  cpu: {
    recommendation: string
    justification: string
  }
  ram: {
    recommendation_gb: number
    justification: string
  }
  storage: {
    recommendation_gb: number
    type: string
    justification: string
  }
  gpu: {
    recommendation: string
    justification: string
  }
}

export interface ManualStep {
  title: string
  description: string
  instructions: string[]
}

