import { z } from 'zod'

/* ------------------------------------------------------------------ */
/* Domain enums (single source of truth for options + validation)     */
/* ------------------------------------------------------------------ */

export const PROJECT_STATUSES = [
  'Planning',
  'In Progress',
  'On Hold',
  'Completed',
] as const
export type ProjectStatus = (typeof PROJECT_STATUSES)[number]

export const PROJECT_PRIORITIES = ['Low', 'Medium', 'High'] as const
export type ProjectPriority = (typeof PROJECT_PRIORITIES)[number]

export const projectSchema = z.object({
  id: z.number(),
  uuid: z.string(),
  clientName: z.string(),
  projectName: z.string(),
  description: z.string().nullable().default(null),
  status: z.enum(PROJECT_STATUSES),
  priority: z.enum(PROJECT_PRIORITIES),
  startDate: z.string(),
  dueDate: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type Project = z.infer<typeof projectSchema>

export const projectsResponseSchema = z.object({
  data: z.array(projectSchema),
  meta: z.object({
    page: z.number(),
    per_page: z.number(),
    total: z.number(),
    last_page: z.number(),
  }),
})

export type ProjectsResponse = z.infer<typeof projectsResponseSchema>

/** Sortable columns per the API contract. */
export const PROJECT_SORTABLE_COLUMNS = [
  'clientName',
  'projectName',
  'status',
  'priority',
  'startDate',
  'dueDate',
  'createdAt',
] as const
export type ProjectSortColumn = (typeof PROJECT_SORTABLE_COLUMNS)[number]

export type ProjectSortDirection = 'asc' | 'desc'

/** Query params that drive the (server-side) projects list request. */
export type ProjectsQuery = {
  page: number
  perPage: number
  status: ProjectStatus[]
  priority: ProjectPriority[]
  search: string
  sort: ProjectSortColumn
  direction: ProjectSortDirection
}

/** Payload sent to POST /api/projects and PUT /api/projects/{uuid}. */
export type ProjectPayload = {
  clientName: string
  projectName: string
  description: string
  status: ProjectStatus
  priority: ProjectPriority
  startDate: string
  dueDate: string
}

/* ------------------------------------------------------------------ */
/* Client form validation                                              */
/* ------------------------------------------------------------------ */

/**
 * Zod schema used by the create/edit sheet. Mirrors the server's rules:
 * required clientName/projectName, valid enum values, and a `dueDate >=
 * startDate` refinement. Server 422 responses are additionally mapped onto
 * the form fields at submit time.
 */
export const projectFormSchema = z
  .object({
    clientName: z
      .string()
      .trim()
      .min(1, 'Client name is required.')
      .max(255, 'Client name must be 255 characters or fewer.'),
    projectName: z
      .string()
      .trim()
      .min(1, 'Project name is required.')
      .max(255, 'Project name must be 255 characters or fewer.'),
    description: z.string().trim().max(2000, 'Description is too long.').optional(),
    status: z.enum(PROJECT_STATUSES, {
      error: 'Please select a status.',
    }),
    priority: z.enum(PROJECT_PRIORITIES, {
      error: 'Please select a priority.',
    }),
    startDate: z.string().min(1, 'Start date is required.'),
    dueDate: z.string().min(1, 'Due date is required.'),
  })
  .refine((value) => !value.startDate || !value.dueDate || value.dueDate >= value.startDate, {
    message: 'Due date must be on or after the start date.',
    path: ['dueDate'],
  })

export type ProjectFormValues = z.infer<typeof projectFormSchema>

/* ------------------------------------------------------------------ */
/* Date helpers — dates are `YYYY-MM-DD` strings end to end            */
/* ------------------------------------------------------------------ */

/** Parse a `YYYY-MM-DD` string into a local-time `Date` (no UTC shift). */
export function dateStringToDate(value: string): Date | undefined {
  if (!value) return undefined
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return undefined
  const [, year, month, day] = match
  return new Date(Number(year), Number(month) - 1, Number(day))
}

/** Format a local-time `Date` as a `YYYY-MM-DD` string. */
export function dateToString(date: Date | undefined): string {
  if (!date) return ''
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/** Present a `YYYY-MM-DD` string nicely, e.g. `Aug 10, 2026`. */
export function formatDateString(value: string): string {
  const date = dateStringToDate(value)
  if (!date) return value
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
