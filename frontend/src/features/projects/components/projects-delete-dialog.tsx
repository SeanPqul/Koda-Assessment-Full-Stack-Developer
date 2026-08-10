import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { useDeleteProject } from '@/features/projects/data/queries'
import { useProjectsContext } from './projects-provider'

export function ProjectsDeleteDialog() {
  const { open, setOpen, currentRow } = useProjectsContext()
  const deleteMutation = useDeleteProject()

  function handleDelete() {
    if (!currentRow) return
    deleteMutation.mutate(currentRow.uuid, {
      onSuccess: () => {
        toast.success('Project deleted.')
        setOpen(null)
      },
    })
  }

  return (
    <ConfirmDialog
      open={open === 'delete'}
      onOpenChange={(next) => !next && setOpen(null)}
      title='Delete project?'
      description={
        <>
          This will permanently delete{' '}
          <span className='font-semibold'>{currentRow?.projectName}</span>.
          This action cannot be undone.
        </>
      }
      confirmLabel='Delete'
      destructive
      loading={deleteMutation.isPending}
      onConfirm={handleDelete}
    />
  )
}
