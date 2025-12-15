import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// API functions
export const agentsApi = {
  list: () => api.get('/agents'),
  get: (id: string) => api.get(`/agents/${id}`),
  getInventory: (id: string) => api.get(`/agents/${id}/inventory`),
  register: (data: any) => api.post('/agents/register', data),
}

export const migrationsApi = {
  list: (params?: any) => api.get('/migrations', { params }),
  get: (id: string) => api.get(`/migrations/${id}`),
  create: (data: any) => api.post('/migrations', data),
  update: (id: string, data: any) => api.patch(`/migrations/${id}`, data),
  start: (id: string) => api.post(`/migrations/${id}/start`),
}

export const companiesApi = {
  list: () => api.get('/companies'),
  get: (id: string) => api.get(`/companies/${id}`),
  create: (data: any) => api.post('/companies', data),
}

export const authApi = {
  login: (username: string, password: string) => {
    const formData = new FormData()
    formData.append('username', username)
    formData.append('password', password)
    return api.post('/auth/login', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
}


