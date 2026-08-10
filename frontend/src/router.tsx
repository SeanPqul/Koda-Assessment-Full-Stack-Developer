import { createContext, useCallback, useContext, useEffect, useState } from 'react'

type RouterContextValue = {
  /** Current pathname, kept in sync with the browser history. */
  path: string
  /** Navigate to a path via the History API (no full page reload). */
  navigate: (to: string) => void
}

const RouterContext = createContext<RouterContextValue | null>(null)

/**
 * Minimal SPA router for the single-page tracker. The app has one real page
 * (`/projects`), so a full routing library would be overkill — this keeps the
 * URL in sync with the browser history and powers the sidebar nav state.
 */
export function RouterProvider({ children }: { children: React.ReactNode }) {
  const [path, setPath] = useState(() => window.location.pathname)

  useEffect(() => {
    // Default route: `/projects` (redirect `/` on first load).
    if (window.location.pathname !== '/projects') {
      window.history.replaceState(null, '', '/projects')
      setPath('/projects')
    }

    const onPopState = () => setPath(window.location.pathname)
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  const navigate = useCallback((to: string) => {
    if (to === window.location.pathname) return
    window.history.pushState(null, '', to)
    setPath(to)
  }, [])

  return (
    <RouterContext.Provider value={{ path, navigate }}>
      {children}
    </RouterContext.Provider>
  )
}

export function useRouter() {
  const context = useContext(RouterContext)
  if (!context) {
    throw new Error('useRouter must be used within a RouterProvider.')
  }
  return context
}
