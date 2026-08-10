import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useProjectsContext } from './projects-provider'

export function ProjectsPrimaryButtons() {
  const { setOpen, setCurrentRow } = useProjectsContext()

  return (
    <Button
      onClick={() => {
        setCurrentRow(null)
        setOpen('create')
      }}
    >
      <Plus className='size-4' />
      New project
    </Button>
  )
}
