import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Build a compact page-number list for a pagination control, collapsing runs
 * into a single ellipsis placeholder (e.g. 1 … 4 5 6 … 12).
 */
export function getPageNumbers(
  currentPage: number,
  lastPage: number
): (number | '...')[] {
  const delta = 2
  const range: number[] = []
  const rangeWithDots: (number | '...')[] = []
  let previous: number | undefined

  for (let i = 1; i <= lastPage; i++) {
    if (
      i === 1 ||
      i === lastPage ||
      (i >= currentPage - delta && i <= currentPage + delta)
    ) {
      range.push(i)
    }
  }

  range.forEach((page) => {
    if (previous !== undefined) {
      if (page - previous === 2) {
        rangeWithDots.push(previous + 1)
      } else if (page - previous !== 1) {
        rangeWithDots.push('...')
      }
    }
    rangeWithDots.push(page)
    previous = page
  })

  return rangeWithDots
}

