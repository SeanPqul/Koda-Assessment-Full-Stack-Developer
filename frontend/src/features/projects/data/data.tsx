import {
  CheckCircle2,
  ClipboardList,
  Pause,
  Timer,
  type LucideIcon,
} from 'lucide-react'
import type { ProjectPriority, ProjectStatus } from './schema'

export type StatusOption = {
  label: string
  value: ProjectStatus
  icon: LucideIcon
  /** Semantic badge colors — matched to the shadcn reference aesthetic. */
  badgeClass: string
}

export type PriorityOption = {
  label: string
  value: ProjectPriority
  icon?: LucideIcon
  badgeClass: string
}

export const statusOptions: StatusOption[] = [
  {
    label: 'Planning',
    value: 'Planning',
    icon: ClipboardList,
    badgeClass:
      'border-transparent bg-blue-500/15 text-blue-700 dark:bg-blue-500/25 dark:text-blue-300',
  },
  {
    label: 'In Progress',
    value: 'In Progress',
    icon: Timer,
    badgeClass:
      'border-transparent bg-amber-500/15 text-amber-700 dark:bg-amber-500/25 dark:text-amber-300',
  },
  {
    label: 'On Hold',
    value: 'On Hold',
    icon: Pause,
    badgeClass:
      'border-transparent bg-zinc-500/15 text-zinc-600 dark:bg-zinc-500/25 dark:text-zinc-300',
  },
  {
    label: 'Completed',
    value: 'Completed',
    icon: CheckCircle2,
    badgeClass:
      'border-transparent bg-emerald-500/15 text-emerald-700 dark:bg-emerald-500/25 dark:text-emerald-300',
  },
]

export const priorityOptions: PriorityOption[] = [
  {
    label: 'Low',
    value: 'Low',
    badgeClass:
      'border-transparent bg-slate-500/15 text-slate-600 dark:bg-slate-500/25 dark:text-slate-300',
  },
  {
    label: 'Medium',
    value: 'Medium',
    badgeClass:
      'border-transparent bg-amber-500/15 text-amber-700 dark:bg-amber-500/25 dark:text-amber-300',
  },
  {
    label: 'High',
    value: 'High',
    badgeClass:
      'border-transparent bg-rose-500/15 text-rose-700 dark:bg-rose-500/25 dark:text-rose-300',
  },
]

