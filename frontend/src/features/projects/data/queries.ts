import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import type {
  Project,
  ProjectPayload,
  ProjectsQuery,
  ProjectsResponse,
} from './schema'

export const projectsQueryKeys = {
  all: ['projects'] as const,
  list: (query: ProjectsQuery) => ['projects', 'list', query] as const,
  detail: (uuid: string) => ['projects', 'detail', uuid] as const,
}

async function listProjects(query: ProjectsQuery): Promise<ProjectsResponse> {
  const { data } = await apiClient.get<ProjectsResponse>('/projects', {
    params: {
      page: query.page,
      per_page: query.perPage,
      ...(query.status.length > 0 ? { 'status[]': query.status } : {}),
      ...(query.priority.length > 0 ? { 'priority[]': query.priority } : {}),
      ...(query.search.length > 0 ? { search: query.search } : {}),
      sort: query.sort,
      direction: query.direction,
    },
  })
  return data
}

async function createProject(payload: ProjectPayload): Promise<Project> {
  const { data } = await apiClient.post<{ data: Project }>('/projects', payload)
  return data.data
}

async function updateProject(uuid: string, payload: ProjectPayload): Promise<Project> {
  const { data } = await apiClient.put<{ data: Project }>(`/projects/${uuid}`, payload)
  return data.data
}

async function deleteProject(uuid: string): Promise<void> {
  await apiClient.delete(`/projects/${uuid}`)
}

export function useProjects(query: ProjectsQuery) {
  return useQuery({
    queryKey: projectsQueryKeys.list(query),
    queryFn: () => listProjects(query),
    placeholderData: keepPreviousData,
  })
}

export function useCreateProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectsQueryKeys.all })
    },
  })
}

export function useUpdateProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ uuid, payload }: { uuid: string; payload: ProjectPayload }) =>
      updateProject(uuid, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectsQueryKeys.all })
    },
  })
}

export function useDeleteProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectsQueryKeys.all })
    },
  })
}
