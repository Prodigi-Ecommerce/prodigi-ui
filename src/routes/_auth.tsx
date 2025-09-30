import { createFileRoute, Outlet, useMatches } from '@tanstack/react-router'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar.tsx'
import { AppSidebar } from '@/components/AppSidebar/AppSidebar.tsx'
import { Menu } from 'lucide-react'
import { memo } from 'react'

const MemoizedAppSidebar = memo(AppSidebar)

const AuthLayout = () => {
  const matches = useMatches()
  const currentRoute = matches[matches.length - 1]
  const title =
    (currentRoute?.staticData as { title?: string })?.title || 'Dashboard'

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="flex min-h-screen w-full">
        <MemoizedAppSidebar />
        <SidebarInset className="transition-all duration-300 ease-in-out flex-1 relative">
          <header className="absolute top-0 left-0 right-0 z-40 border-b border-border bg-background/80 backdrop-blur-md h-[60px]">
            <div className="flex items-center gap-4 px-6 py-3 h-full">
              <SidebarTrigger className="hover:bg-accent rounded-md p-2 transition-colors text-primary">
                <Menu className="h-5 w-5" />
              </SidebarTrigger>
              <h1 className="text-lg font-semibold flex-1 text-foreground">
                {title}
              </h1>
            </div>
          </header>

          <main className="min-h-screen pt-[60px] relative overflow-hidden bg-background">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/5 to-background"></div>
            <div className="relative z-10">
              <Outlet />
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}

export const Route = createFileRoute('/_auth')({
  component: AuthLayout,
})