/**
 * localStorage utility functions
 * Provides a safe, typed wrapper around the localStorage API.
 */

/**
 * Get a value from localStorage, parsed as JSON.
 * Returns undefined if the key doesn't exist or parsing fails.
 */
export function getLocalStorage<T>(key: string): T | undefined {
  try {
    const item = localStorage.getItem(key)
    return item ? (JSON.parse(item) as T) : undefined
  } catch {
    return undefined
  }
}

/**
 * Set a value in localStorage, serialized as JSON.
 */
export function setLocalStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Silently ignore write errors (e.g. private mode storage quota)
  }
}

/**
 * Remove a key from localStorage.
 */
export function removeLocalStorage(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch {
    // Silently ignore
  }
}
