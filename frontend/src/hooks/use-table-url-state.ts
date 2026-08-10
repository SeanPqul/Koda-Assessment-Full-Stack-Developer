import { useCallback, useMemo } from 'react'
import type {
  ColumnFiltersState,
  OnChangeFn,
  PaginationState,
  SortingState,
} from '@tanstack/react-table'
import {
  PROJECT_SORTABLE_COLUMNS,
  type ProjectPriority,
  type ProjectSortColumn,
  type ProjectSortDirection,
  type ProjectStatus,
  type ProjectsQuery,
} from '@/features/projects/data/schema'
import { useUrlSearchParams } from './use-url-search-params'

const DEFAULT_SORT: ProjectSortColumn = 'createdAt'
const DEFAULT_PAGE_SIZE = 10
const MAX_PAGE_SIZE = 100

function parseIntSafe(value: string | null): number | undefined {
  if (value === null || value === '') return undefined
  const n = Number(value)
  return Number.isFinite(n) ? Math.floor(n) : undefined
}

function setArrayParam(sp: URLSearchParams, key: string, values: string[]) {
  sp.delete(key)
  for (const value of values) {
    sp.append(key, value)
  }
}

/**
 * Bridges the URL query string and the react-table state for the
 * server-driven projects table. Every table interaction writes back to the
 * URL (page, perPage, status[], priority[], search, sort, direction), which
 * in turn changes the `useProjects` query key and refetches from the API.
 */
export function useTableUrlState() {
  const { searchParams, setSearchParams } = useUrlSearchParams()

  const query = useMemo<ProjectsQuery>(() => {
    const page = Math.max(1, parseIntSafe(searchParams.get('page')) ?? 1)
    const perPageRaw = parseIntSafe(searchParams.get('perPage')) ?? DEFAULT_PAGE_SIZE
    const perPage = Math.min(MAX_PAGE_SIZE, Math.max(1, perPageRaw))

    const hasBracketStatus = searchParams.getAll('status[]').length > 0
    const status = (hasBracketStatus
      ? searchParams.getAll('status[]')
      : searchParams.getAll('status')) as ProjectStatus[]

    const hasBracketPriority = searchParams.getAll('priority[]').length > 0
    const priority = (hasBracketPriority
      ? searchParams.getAll('priority[]')
      : searchParams.getAll('priority')) as ProjectPriority[]

    const search = searchParams.get('search') ?? ''

    const rawSort = searchParams.get('sort')
    const sort = (PROJECT_SORTABLE_COLUMNS as readonly string[]).includes(
      rawSort ?? ''
    )
      ? (rawSort as ProjectSortColumn)
      : DEFAULT_SORT

    const direction: ProjectSortDirection =
      searchParams.get('direction') === 'desc' ? 'desc' : 'asc'

    return { page, perPage, status, priority, search, sort, direction }
  }, [searchParams])

  const pagination: PaginationState = {
    pageIndex: query.page - 1,
    pageSize: query.perPage,
  }

  const sorting: SortingState = [{ id: query.sort, desc: query.direction === 'desc' }]

  const columnFilters: ColumnFiltersState = [
    ...(query.status.length > 0 ? [{ id: 'status', value: query.status }] : []),
    ...(query.priority.length > 0 ? [{ id: 'priority', value: query.priority }] : []),
  ]

  const globalFilter = query.search

  const onPaginationChange: OnChangeFn<PaginationState> = (updater) => {
    const next = typeof updater === 'function' ? updater(pagination) : updater
    const nextPage = next.pageIndex + 1
    const nextPageSize = next.pageSize
    setSearchParams((sp) => {
      if (nextPage <= 1) sp.delete('page')
      else sp.set('page', String(nextPage))
      if (nextPageSize === DEFAULT_PAGE_SIZE) sp.delete('perPage')
      else sp.set('perPage', String(nextPageSize))
      return sp
    })
  }

  const onSortingChange: OnChangeFn<SortingState> = (updater) => {
    const next = typeof updater === 'function' ? updater(sorting) : updater
    const current = next[0]
    setSearchParams((sp) => {
      if (current) {
        if (current.id === DEFAULT_SORT && !current.desc) {
          sp.delete('sort')
          sp.delete('direction')
        } else {
          sp.set('sort', current.id)
          sp.set('direction', current.desc ? 'desc' : 'asc')
        }
      } else {
        sp.delete('sort')
        sp.delete('direction')
      }
      sp.delete('page')
      return sp
    })
  }

  const onColumnFiltersChange: OnChangeFn<ColumnFiltersState> = (updater) => {
    const next = typeof updater === 'function' ? updater(columnFilters) : updater
    const statusValue = next.find((f) => f.id === 'status')?.value
    const priorityValue = next.find((f) => f.id === 'priority')?.value
    setSearchParams((sp) => {
      setArrayParam(sp, 'status[]', Array.isArray(statusValue) ? statusValue.map(String) : [])
      setArrayParam(
        sp,
        'priority[]',
        Array.isArray(priorityValue) ? priorityValue.map(String) : []
      )
      sp.delete('page')
      return sp
    })
  }

  const onGlobalFilterChange: OnChangeFn<string> = (updater) => {
    const next = typeof updater === 'function' ? updater(globalFilter) : updater
    const value = (next ?? '').trim()
    setSearchParams((sp) => {
      if (value) sp.set('search', value)
      else sp.delete('search')
      sp.delete('page')
      return sp
    })
  }

  const ensurePageInRange = useCallback(
    (pageCount: number) => {
      if (pageCount > 0 && query.page > pageCount) {
        setSearchParams(
          (sp) => {
            sp.delete('page')
            return sp
          },
          { replace: true }
        )
      }
    },
    [query.page, setSearchParams]
  )

  return {
    query,
    pagination,
    sorting,
    columnFilters,
    globalFilter,
    onPaginationChange,
    onSortingChange,
    onColumnFiltersChange,
    onGlobalFilterChange,
    ensurePageInRange,
  }
}
