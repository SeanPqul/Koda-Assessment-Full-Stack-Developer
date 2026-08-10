import { useCallback, useEffect, useState } from 'react'

export type UrlStateUpdater = (prev: URLSearchParams) => URLSearchParams

export type UrlStateOptions = {
  /** Use history.replaceState instead of pushState (no extra history entry). */
  replace?: boolean
}

/**
 * A tiny, router-agnostic wrapper around the History API.
 *
 * The URL query string is the single source of truth for the projects page:
 * reading it is reactive, and `setSearchParams` pushes/replaces the state and
 * notifies subscribers (including `popstate` from the back/forward buttons).
 */
export function useUrlSearchParams() {
  const [searchParams, setSearchParamsState] = useState<URLSearchParams>(
    () => new URLSearchParams(window.location.search)
  )

  useEffect(() => {
    const onPopState = () => {
      setSearchParamsState(new URLSearchParams(window.location.search))
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  const setSearchParams = useCallback(
    (updater: UrlStateUpdater, options?: UrlStateOptions) => {
      // Always base the next state on the committed URL so rapid consecutive
      // updates never clobber each other (pushState is synchronous).
      const next = updater(new URLSearchParams(window.location.search))
      const query = next.toString()
      const url = query ? `${window.location.pathname}?${query}` : window.location.pathname
      const method = options?.replace ? 'replaceState' : 'pushState'
      window.history[method](null, '', url)
      setSearchParamsState(next)
    },
    []
  )

  return { searchParams, setSearchParams }
}
