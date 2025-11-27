import {
  createFileRoute,
  Outlet,
  useMatches,
  useNavigate,
} from '@tanstack/react-router'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar.tsx'
import { AppSidebar } from '@/components/AppSidebar/AppSidebar.tsx'
import { WorkspaceSwitcher } from '@/components/Workspace/WorkspaceSwitcher'
import { WorkspaceProvider } from '@/contexts/WorkspaceContext'
import { useAuth } from '@/contexts/AuthContext'
import { Loader2, Menu } from 'lucide-react'
import { memo, useEffect } from 'react'

const MemoizedAppSidebar = memo(AppSidebar)

const AuthLayout = () => {
  const { user, isLoading: authLoading } = useAuth()
  const navigate = useNavigate()
  const matches = useMatches()
  const currentRoute = matches[matches.length - 1]
  const title =
    (currentRoute?.staticData as { title?: string })?.title || 'Dashboard'

  useEffect(() => {
    if (!authLoading && !user) {
      void navigate({ to: '/login', replace: true })
    }
  }, [authLoading, navigate, user])

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <WorkspaceProvider>
      <SidebarProvider defaultOpen={false}>
        <div className="flex min-h-screen w-full">
          <MemoizedAppSidebar />
          <SidebarInset className="transition-all duration-300 ease-in-out flex-1 relative">
            <header className="absolute top-0 left-0 right-0 z-40 border-b border-border bg-background/80 backdrop-blur-md h-[52px]">
              <div className="flex items-center gap-3 px-4 sm:px-5 py-2 h-full">
                <SidebarTrigger className="hover:bg-accent rounded-md p-2 transition-colors text-primary">
                  <Menu className="h-5 w-5" />
                </SidebarTrigger>
                <h1 className="text-lg font-semibold flex-1 text-foreground truncate">
                  {title}
                </h1>
                <WorkspaceSwitcher />
              </div>
            </header>

            <main className="min-h-screen pt-[52px] relative overflow-hidden bg-background">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/5 to-background"></div>
              <div className="relative z-10">
                <Outlet />
              </div>
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </WorkspaceProvider>
  )
}

export const Route = createFileRoute('/_auth')({
  component: AuthLayout,
})
