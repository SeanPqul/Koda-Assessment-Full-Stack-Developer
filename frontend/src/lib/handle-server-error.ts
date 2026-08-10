import { AxiosError } from 'axios'
import { toast } from 'sonner'

/**
 * Normalizes an unknown error into a user-friendly toast.
 *
 * Prefers the Laravel-shaped `response.data.message` (e.g. validation
 * failures / 422 responses), falls back to a `title` field, then a generic
 * fallback message.
 */
export function handleServerError(error: unknown) {
  if (import.meta.env.DEV) {
    console.log(error)
  }

  let errMsg = 'Something went wrong!'

  if (
    error &&
    typeof error === 'object' &&
    'status' in error &&
    Number(error.status) === 204
  ) {
    errMsg = 'No content.'
  }

  if (error instanceof AxiosError) {
    const data = error.response?.data as
      | { message?: unknown; title?: unknown }
      | undefined

    if (data && typeof data.message === 'string' && data.message.length > 0) {
      errMsg = data.message
    } else if (
      data &&
      typeof data.title === 'string' &&
      data.title.length > 0
    ) {
      errMsg = data.title
    }
  }

  toast.error(errMsg)
}
