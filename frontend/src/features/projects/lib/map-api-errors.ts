import { AxiosError } from 'axios'
import type { FieldValues, Path, UseFormReturn } from 'react-hook-form'

/**
 * Maps a Laravel 422 response (`{ message, errors: { field: [messages] } }`)
 * onto the matching form fields so server-side validation errors appear inline.
 */
export function mapApiErrors<T extends FieldValues>(
  error: unknown,
  form: UseFormReturn<T>
) {
  if (!(error instanceof AxiosError) || error.response?.status !== 422) return

  const errors = (error.response.data as { errors?: Record<string, string[]> })
    ?.errors

  if (!errors) return

  const knownFields = new Set(Object.keys(form.getValues()))

  for (const [field, messages] of Object.entries(errors)) {
    if (!knownFields.has(field)) continue
    const message = Array.isArray(messages) ? messages[0] : String(messages)
    form.setError(field as Path<T>, {
      type: 'server',
      message,
    })
  }
}
