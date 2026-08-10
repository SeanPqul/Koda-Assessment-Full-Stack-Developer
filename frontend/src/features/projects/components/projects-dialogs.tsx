import { useProjectsContext } from './projects-provider'
import { ProjectsMutateDrawer } from './projects-mutate-drawer'
import { ProjectsDeleteDialog } from './projects-delete-dialog'

/** Orchestrates the create/update drawer and the delete confirmation dialog. */
export function ProjectsDialogs() {
  const { open, setOpen, currentRow } = useProjectsContext()

  return (
    <>
      <ProjectsMutateDrawer
        open={open === 'create' || open === 'update'}
        onOpenChange={(next) => {
          if (!next) setOpen(null)
        }}
        currentRow={open === 'update' ? currentRow : null}
      />
      <ProjectsDeleteDialog />
    </>
  )
}
