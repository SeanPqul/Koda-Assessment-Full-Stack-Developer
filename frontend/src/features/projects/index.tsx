import { ProjectsProvider } from './components/projects-provider'
import { ProjectsTable } from './components/projects-table'
import { ProjectsDialogs } from './components/projects-dialogs'
import { ProjectsPrimaryButtons } from './components/projects-primary-buttons'

export default function ProjectsPage() {
  return (
    <ProjectsProvider>
      <div className='flex flex-wrap items-end justify-between gap-2'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>Projects</h2>
          <p className='text-muted-foreground'>
            Track client projects, progress and priorities.
          </p>
        </div>
        <ProjectsPrimaryButtons />
      </div>
      <ProjectsTable />
      <ProjectsDialogs />
    </ProjectsProvider>
  )
}
