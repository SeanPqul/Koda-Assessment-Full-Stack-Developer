import {
  AxiosError,
  type AxiosAdapter,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios'
import seedProjects from './mock/test_data.json'
import {
  PROJECT_PRIORITIES,
  PROJECT_STATUSES,
  PROJECT_SORTABLE_COLUMNS,
  type Project,
  type ProjectPayload,
  type ProjectStatus,
} from '@/features/projects/data/schema'

/* ------------------------------------------------------------------ */
/* In-memory store seeded from test_data.json                          */
/* ------------------------------------------------------------------ */

// The seed file is hand-authored/JSON so it doubles as the "backend" fixture.
// Keep a working copy that mutations act on (deep-copied, ids re-based).
let store: Project[] = (seedProjects as unknown as Project[]).map((seed) => ({
  ...seed,
}))
let nextId = Math.max(0, ...store.map((p) => p.id)) + 1

function generateUuid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `proj-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

function nowIso(): string {
  return new Date().toISOString()
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

type MockParams = Record<string, unknown>

function getArrayParam(params: MockParams, ...keys: string[]): string[] {
  for (const key of keys) {
    const value = params[key]
    if (value === undefined || value === null) continue
    if (Array.isArray(value)) {
      return value.map(String)
    }
    return [String(value)]
  }
  return []
}

function getStringParam(params: MockParams, key: string): string {
  const value = params[key]
  return typeof value === 'string' ? value : ''
}

function getNumberParam(params: MockParams, key: string, fallback: number): number {
  const value = params[key]
  if (typeof value === 'string' && value.trim() !== '' && !Number.isNaN(Number(value))) {
    return Number(value)
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }
  return fallback
}

function makeResponse(
  config: InternalAxiosRequestConfig,
  data: unknown,
  status: number,
  statusText: string
): AxiosResponse {
  return { data, status, statusText, headers: {}, config }
}

function rejectWith(
  config: InternalAxiosRequestConfig,
  status: number,
  data: unknown
): Promise<never> {
  const statusText =
    status === 404 ? 'Not Found' : status === 422 ? 'Unprocessable Content' : 'Error'
  const response = makeResponse(config, data, status, statusText)
  return Promise.reject(
    new AxiosError(
      `Request failed with status code ${status}`,
      `ERR_BAD_REQUEST`,
      config,
      undefined,
      response
    )
  )
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/* ------------------------------------------------------------------ */
/* Validation (mirrors Laravel 422 response shape)                     */
/* ------------------------------------------------------------------ */

type ErrorBag = Record<string, string[]>

function validatePayload(body: Partial<ProjectPayload>): ErrorBag {
  const errors: ErrorBag = {}

  if (!body.clientName || body.clientName.trim() === '') {
    errors.clientName = ['The client name field is required.']
  }
  if (!body.projectName || body.projectName.trim() === '') {
    errors.projectName = ['The project name field is required.']
  }
  if (
    !body.status ||
    !(PROJECT_STATUSES as readonly string[]).includes(body.status)
  ) {
    errors.status = ['The selected status is invalid.']
  }
  if (
    !body.priority ||
    !(PROJECT_PRIORITIES as readonly string[]).includes(body.priority)
  ) {
    errors.priority = ['The selected priority is invalid.']
  }
  if (!body.startDate) {
    errors.startDate = ['The start date field is required.']
  }
  if (!body.dueDate) {
    errors.dueDate = ['The due date field is required.']
  } else if (body.startDate && body.dueDate < body.startDate) {
    errors.dueDate = ['The due date must be on or after the start date.']
  }

  return errors
}

function parsePayload(raw: string): Partial<ProjectPayload> {
  try {
    return JSON.parse(raw) as Partial<ProjectPayload>
  } catch {
    return {}
  }
}

/* ------------------------------------------------------------------ */
/* The adapter                                                         */
/* ------------------------------------------------------------------ */

export const mockAdapter: AxiosAdapter = (config) => {
  const method = (config.method ?? 'get').toLowerCase()
  const fullPath = `${config.baseURL ?? ''}${config.url ?? ''}`

  const listMatch = /^\/api\/projects\/?$/.exec(fullPath)
  const detailMatch = /^\/api\/projects\/([^/]+)\/?$/.exec(fullPath)

  // GET /api/projects
  if (listMatch && method === 'get') {
    return (async () => {
      await delay(450)

      const params = (config.params ?? {}) as MockParams
      const search = getStringParam(params, 'search').trim().toLowerCase()
      const statusFilter = getArrayParam(params, 'status[]', 'status')
      const priorityFilter = getArrayParam(params, 'priority[]', 'priority')

      let result = [...store]

      if (search) {
        result = result.filter(
          (p) =>
            p.clientName.toLowerCase().includes(search) ||
            p.projectName.toLowerCase().includes(search)
        )
      }
      if (statusFilter.length > 0) {
        result = result.filter((p) => statusFilter.includes(p.status))
      }
      if (priorityFilter.length > 0) {
        result = result.filter((p) => priorityFilter.includes(p.priority))
      }

      // Sort — whitelist enforced, default createdAt asc.
      const rawSort = getStringParam(params, 'sort')
      const sort = (
        PROJECT_SORTABLE_COLUMNS as readonly string[]
      ).includes(rawSort)
        ? (rawSort as ProjectStatus) // key exists -> cast is safe
        : 'createdAt'
      const direction = getStringParam(params, 'direction') === 'desc' ? -1 : 1

      result.sort((a, b) => {
        const av = String(a[sort as keyof Project] ?? '')
        const bv = String(b[sort as keyof Project] ?? '')
        if (av < bv) return -1 * direction
        if (av > bv) return 1 * direction
        return 0
      })

      // Pagination
      const page = Math.max(1, getNumberParam(params, 'page', 1))
      const perPageRaw = getNumberParam(params, 'per_page', 10)
      const perPage = Math.min(100, Math.max(1, perPageRaw))
      const total = result.length
      const lastPage = Math.max(1, Math.ceil(total / perPage))
      const start = (page - 1) * perPage
      const data = result.slice(start, start + perPage)

      return makeResponse(
        config,
        { data, meta: { page, per_page: perPage, total, last_page: lastPage } },
        200,
        'OK'
      )
    })()
  }

  // GET /api/projects/{uuid}
  if (detailMatch && method === 'get') {
    return (async () => {
      await delay(350)
      const project = store.find((p) => p.uuid === detailMatch[1])
      if (!project) {
        return rejectWith(config, 404, { message: 'Project not found.' })
      }
      return makeResponse(config, { data: project }, 200, 'OK')
    })()
  }

  // POST /api/projects
  if (listMatch && method === 'post') {
    return (async () => {
      await delay(450)
      const body = parsePayload(config.data)
      const errors = validatePayload(body)

      if (Object.keys(errors).length > 0) {
        return rejectWith(config, 422, {
          message: 'The given data was invalid.',
          errors,
        })
      }

      const timestamp = nowIso()
      const project: Project = {
        id: nextId++,
        uuid: generateUuid(),
        clientName: (body.clientName as string).trim(),
        projectName: (body.projectName as string).trim(),
        description: body.description?.trim() || null,
        status: body.status as Project['status'],
        priority: body.priority as Project['priority'],
        startDate: body.startDate as string,
        dueDate: body.dueDate as string,
        createdAt: timestamp,
        updatedAt: timestamp,
      }
      store.unshift(project)

      return makeResponse(config, { data: project }, 201, 'Created')
    })()
  }

  // PUT /api/projects/{uuid}
  if (detailMatch && method === 'put') {
    return (async () => {
      await delay(400)
      const project = store.find((p) => p.uuid === detailMatch[1])
      if (!project) {
        return rejectWith(config, 404, { message: 'Project not found.' })
      }

      const body = parsePayload(config.data)
      const errors = validatePayload(body)

      if (Object.keys(errors).length > 0) {
        return rejectWith(config, 422, {
          message: 'The given data was invalid.',
          errors,
        })
      }

      project.clientName = (body.clientName as string).trim()
      project.projectName = (body.projectName as string).trim()
      project.description = body.description?.trim() || null
      project.status = body.status as Project['status']
      project.priority = body.priority as Project['priority']
      project.startDate = body.startDate as string
      project.dueDate = body.dueDate as string
      project.updatedAt = nowIso()

      return makeResponse(config, { data: project }, 200, 'OK')
    })()
  }

  // DELETE /api/projects/{uuid}
  if (detailMatch && method === 'delete') {
    return (async () => {
      await delay(400)
      const index = store.findIndex((p) => p.uuid === detailMatch[1])
      if (index === -1) {
        return rejectWith(config, 404, { message: 'Project not found.' })
      }
      store.splice(index, 1)
      return makeResponse(config, undefined, 204, 'No Content')
    })()
  }

  return rejectWith(config, 404, { message: 'Not Found' })
}
