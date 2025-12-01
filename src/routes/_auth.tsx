import { createFileRoute, Outlet, useNavigate } from '@tanstack/react-router'
import {
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar.tsx'
import { AppSidebar } from '@/components/AppSidebar/AppSidebar.tsx'
import { WorkspaceProvider } from '@/contexts/WorkspaceContext'
import { useAuth } from '@/contexts/AuthContext'
import { Loader2 } from 'lucide-react'
import { memo, useEffect } from 'react'

const MemoizedAppSidebar = memo(AppSidebar)

const AuthLayout = () => {
  const { user, isLoading: authLoading } = useAuth()
  const navigate = useNavigate()
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
        <div className="flex min-h-screen w-full bg-gradient-to-br from-primary/10 via-secondary/5 to-background">
          <MemoizedAppSidebar />
          <SidebarInset className="transition-all duration-300 ease-in-out flex-1 relative">
            <main className="min-h-screen relative overflow-hidden">
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
