import axios from 'axios'
import { mockAdapter } from './mock-api'

const configuredBaseUrl = (
  import.meta.env.VITE_API_BASE_URL as string | undefined
)?.trim()

const useMock = import.meta.env.VITE_USE_MOCK === 'true'

export const apiClient = axios.create({
  baseURL: useMock ? '/api' : (configuredBaseUrl || '/api'),
  timeout: 15000,
  adapter: useMock ? mockAdapter : undefined,
})
