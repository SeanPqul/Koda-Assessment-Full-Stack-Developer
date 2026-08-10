import { ClipboardList } from 'lucide-react'

export type SidebarNavItem = {
  title: string
  url: string
  icon: React.ComponentType<{ className?: string }>
}

export type SidebarNavGroup = {
  title: string
  items: SidebarNavItem[]
}

export const sidebarData = {
  navGroups: [
    {
      title: 'General',
      items: [
        {
          title: 'Projects',
          url: '/',
          icon: ClipboardList,
        },
      ],
    },
  ] satisfies SidebarNavGroup[],
}
