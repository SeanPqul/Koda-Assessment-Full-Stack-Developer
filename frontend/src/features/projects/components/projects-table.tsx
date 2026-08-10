import { useCallback, useEffect, useState } from 'react'
import {
  flexRender,
  getCoreRowModel,
  getFacetedMinMaxValues,
  getFacetedRowModel,
  getFacetedUniqueValues,
  useReactTable,
  type VisibilityState,
} from '@tanstack/react-table'
import { DataTablePagination } from '@/components/data-table/pagination'
import { DataTableToolbar } from '@/components/data-table/toolbar'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { getLocalStorage, setLocalStorage } from '@/lib/local-storage'
import { useTableUrlState } from '@/hooks/use-table-url-state'
import { useProjects } from '@/features/projects/data/queries'
import { priorityOptions, statusOptions } from '@/features/projects/data/data'
import { projectsColumns } from './projects-columns'

const SKELETON_ROWS = 8
const COLUMN_VISIBILITY_KEY = 'projects-column-visibility'

function loadColumnVisibility(): VisibilityState {
  return getLocalStorage<VisibilityState>(COLUMN_VISIBILITY_KEY) ?? {}
}

export function ProjectsTable() {
  const {
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
  } = useTableUrlState()

  const { data, isPending, isError } = useProjects(query)
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(loadColumnVisibility)

  const onColumnVisibilityChange = useCallback(
    (updater: VisibilityState | ((prev: VisibilityState) => VisibilityState)) => {
      setColumnVisibility((prev) => {
        const next = typeof updater === 'function' ? updater(prev) : updater
        setLocalStorage(COLUMN_VISIBILITY_KEY, next)
        return next
      })
    },
    []
  )

  const table = useReactTable({
    data: data?.data ?? [],
    columns: projectsColumns,
    pageCount: data?.meta.last_page ?? 0,
    getRowId: (row) => row.uuid,
    state: {
      pagination,
      sorting,
      columnFilters,
      globalFilter,
      columnVisibility,
    },
    onPaginationChange,
    onSortingChange,
    onColumnFiltersChange,
    onGlobalFilterChange,
    onColumnVisibilityChange,
    getCoreRowModel: getCoreRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
  })

  // If the current page is beyond the last page (e.g. after a delete), reset it.
  useEffect(() => {
    ensurePageInRange(data?.meta.last_page ?? 0)
  }, [data?.meta.last_page, ensurePageInRange])

  const rows = table.getRowModel().rows

  return (
    <div className='w-full space-y-4'>
      <DataTableToolbar
        table={table}
        searchPlaceholder='Search projects…'
        filters={[
          {
            columnId: 'status',
            title: 'Status',
            options: statusOptions.map((option) => ({
              label: option.label,
              value: option.value,
              icon: option.icon,
            })),
          },
          {
            columnId: 'priority',
            title: 'Priority',
            options: priorityOptions.map((option) => ({
              label: option.label,
              value: option.value,
              icon: option.icon,
            })),
          },
        ]}
      />

      <div className='overflow-hidden rounded-xl border bg-card'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const meta = header.column.columnDef.meta as
                    | { className?: string }
                    | undefined
                  return (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      className={cn('p-2', meta?.className)}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isPending && !data ? (
              Array.from({ length: SKELETON_ROWS }).map((_, index) => (
                <TableRow key={index}>
                  {projectsColumns.map((column) => (
                    <TableCell key={column.id} className='p-2'>
                      <Skeleton className='h-5 w-full' />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : rows.length ? (
              rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className='hover:bg-muted/50'
                >
                  {row.getVisibleCells().map((cell) => {
                    const meta = cell.column.columnDef.meta as
                      | { className?: string }
                      | undefined
                    return (
                      <TableCell
                        key={cell.id}
                        className={cn('p-2 align-middle whitespace-nowrap', meta?.className)}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    )
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={projectsColumns.length}
                  className='h-24 text-center'
                >
                  {isError
                    ? 'Something went wrong while loading projects.'
                    : 'No projects found.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <DataTablePagination table={table} />
    </div>
  )
}
