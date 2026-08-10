import type { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { DataTableColumnHeader } from '@/components/data-table/column-header'
import { LongText } from '@/components/long-text'
import {
  formatDateString,
  type Project,
} from '@/features/projects/data/schema'
import { priorityOptions, statusOptions } from '@/features/projects/data/data'
import { DataTableRowActions } from './data-table-row-actions'

type CellMeta = { className?: string } | undefined

export const projectsColumns: ColumnDef<Project>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
    cell: ({ row }) => (
      <div className='w-10 text-muted-foreground'>{row.getValue('id')}</div>
    ),
    enableSorting: false,
    enableHiding: false,
    meta: { className: 'w-10' } satisfies CellMeta,
  },
  {
    accessorKey: 'clientName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Client' />
    ),
    cell: ({ row }) => (
      <div className='w-[220px] font-medium'>{row.getValue('clientName')}</div>
    ),
    meta: { className: 'w-[220px]' } satisfies CellMeta,
  },
  {
    accessorKey: 'projectName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Project' />
    ),
    cell: ({ row }) => (
      <LongText
        text={row.getValue('projectName')}
        className='w-full'
      />
    ),
    meta: { className: 'min-w-[240px] max-w-[500px]' } satisfies CellMeta,
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ row }) => {
      const status = row.getValue<Project['status']>('status')
      const option = statusOptions.find((o) => o.value === status)
      return (
        <Badge variant='outline' className={option?.badgeClass}>
          {status}
        </Badge>
      )
    },
    filterFn: 'arrIncludesSome',
    meta: { className: 'w-[140px]' } satisfies CellMeta,
  },
  {
    accessorKey: 'priority',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Priority' />
    ),
    cell: ({ row }) => {
      const priority = row.getValue<Project['priority']>('priority')
      const option = priorityOptions.find((o) => o.value === priority)
      return (
        <Badge variant='outline' className={option?.badgeClass}>
          {priority}
        </Badge>
      )
    },
    filterFn: 'arrIncludesSome',
    meta: { className: 'w-[120px]' } satisfies CellMeta,
  },
  {
    accessorKey: 'startDate',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Start date' />
    ),
    cell: ({ row }) => (
      <span className='w-[120px] whitespace-nowrap'>
        {formatDateString(row.getValue('startDate'))}
      </span>
    ),
    meta: { className: 'w-[120px]' } satisfies CellMeta,
  },
  {
    accessorKey: 'dueDate',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Due date' />
    ),
    cell: ({ row }) => (
      <span className='w-[120px] whitespace-nowrap'>
        {formatDateString(row.getValue('dueDate'))}
      </span>
    ),
    meta: { className: 'w-[120px]' } satisfies CellMeta,
  },
  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
    enableSorting: false,
    enableHiding: false,
    meta: { className: 'w-12' } satisfies CellMeta,
  },
]
