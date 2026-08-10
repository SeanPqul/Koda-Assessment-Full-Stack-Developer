import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { type Table } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DataTableFacetedFilter } from './faceted-filter'
import { DataTableViewOptions } from './view-options'

type DataTableToolbarProps<TData> = {
  table: Table<TData>
  searchPlaceholder?: string
  searchKey?: string
  filters?: {
    columnId: string
    title: string
    options: {
      label: string
      value: string
      icon?: React.ComponentType<{ className?: string }>
    }[]
  }[]
}

export function DataTableToolbar<TData>({
  table,
  searchPlaceholder = 'Filter...',
  searchKey,
  filters = [],
}: DataTableToolbarProps<TData>) {
  const isFiltered =
    table.getState().columnFilters.length > 0 || table.getState().globalFilter

  return (
    <div className='flex items-center justify-between'>
      <div className='flex flex-1 flex-col-reverse items-start gap-y-2 sm:flex-row sm:items-center sm:space-x-2'>
        {searchKey ? (
          <DebouncedSearchInput
            value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ''}
            onValueChange={(value) =>
              table.getColumn(searchKey)?.setFilterValue(value)
            }
            placeholder={searchPlaceholder}
          />
        ) : (
          <DebouncedSearchInput
            value={table.getState().globalFilter ?? ''}
            onValueChange={(value) => table.setGlobalFilter(value)}
            placeholder={searchPlaceholder}
          />
        )}
        <div className='flex gap-x-2'>
          {filters.map((filter) => {
            const column = table.getColumn(filter.columnId)
            if (!column) return null
            return (
              <DataTableFacetedFilter
                key={filter.columnId}
                column={column}
                title={filter.title}
                options={filter.options}
              />
            )
          })}
        </div>
        {isFiltered && (
          <Button
            variant='ghost'
            onClick={() => {
              table.resetColumnFilters()
              table.setGlobalFilter('')
            }}
            className='h-8 px-2 lg:px-3'
          >
            Reset
            <X className='ms-2 size-4' />
          </Button>
        )}
      </div>
      <DataTableViewOptions table={table} />
    </div>
  )
}

/**
 * Debounced text input used for the server-side search box. Keeps typing
 * responsive (no re-render/refetch per keystroke) while still pushing the
 * final value to the URL after a short pause.
 */
function DebouncedSearchInput({
  value,
  onValueChange,
  placeholder,
}: {
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
}) {
  const [localValue, setLocalValue] = useState(value)
  const timerRef = useRef<number | undefined>(undefined)

  // Sync when the external (URL-driven) value changes — e.g. the Reset button.
  useEffect(() => {
    setLocalValue(value)
  }, [value])

  useEffect(() => {
    return () => window.clearTimeout(timerRef.current)
  }, [])

  return (
    <Input
      placeholder={placeholder}
      value={localValue}
      onChange={(event) => {
        const next = event.target.value
        setLocalValue(next)
        window.clearTimeout(timerRef.current)
        timerRef.current = window.setTimeout(() => {
          onValueChange(next)
        }, 400)
      }}
      className='h-8 w-60 lg:w-80'
    />
  )
}
