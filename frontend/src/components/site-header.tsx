import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { ThemeSwitch } from '@/components/theme-switch'

export function SiteHeader() {
  return (
    <header className='flex h-16 shrink-0 items-center gap-3 border-b bg-background px-4 md:px-6'>
      <SidebarTrigger variant='outline' className='scale-95' />
      <Separator orientation='vertical' className='h-6' />
      <h1 className='text-sm font-medium text-foreground'>Projects</h1>
      <div className='ms-auto flex items-center gap-2'>
        <ThemeSwitch />
      </div>
    </header>
  )
}
