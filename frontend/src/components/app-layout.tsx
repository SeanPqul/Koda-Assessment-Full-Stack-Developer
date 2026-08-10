import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'

function getCookie(name: string): string | undefined {
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`))
  return match?.[2]
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const defaultOpen = getCookie('sidebar_state') !== 'false'
  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar />
      <SidebarInset className='@container/content peer-data-[variant=inset]:h-[calc(100svh-theme(spacing.4))] overflow-hidden'>
        <SiteHeader />
        <div className='flex-1 overflow-y-auto'>
          <div className='flex flex-col gap-4 p-4 md:p-6'>{children}</div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
