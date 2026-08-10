import { createContext, useContext, useState } from 'react'
import type { Project } from '@/features/projects/data/schema'

type ProjectsDialogType = 'create' | 'update' | 'delete' | null

type ProjectsContextType = {
  open: ProjectsDialogType
  setOpen: (open: ProjectsDialogType) => void
  currentRow: Project | null
  setCurrentRow: (row: Project | null) => void
}

const ProjectsContext = createContext<ProjectsContextType | null>(null)

export function ProjectsProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState<ProjectsDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Project | null>(null)

  return (
    <ProjectsContext.Provider value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </ProjectsContext.Provider>
  )
}

export function useProjectsContext() {
  const context = useContext(ProjectsContext)
  if (!context) {
    throw new Error('useProjectsContext must be used within a ProjectsProvider.')
  }
  return context
}
