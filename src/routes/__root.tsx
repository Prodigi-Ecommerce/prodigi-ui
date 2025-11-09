import {
  createRootRoute,
  Outlet,
  useRouterState,
} from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { ThemeToggle } from '@/components/Theme/ThemeToggle.tsx'
import { AuthProvider } from '@/contexts/AuthContext'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

const RootLayout = () => {
  const isLoading = useRouterState({ select: (s) => s.isLoading })

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeToggle className="fixed bottom-4 right-4 z-[100] h-10" />

        <div className="flex min-h-screen w-full relative">
          {isLoading ? (
            <div className="flex items-center justify-center min-h-screen w-full">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          ) : (
            <Outlet />
          )}
        </div>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export const Route = createRootRoute({
  component: RootLayout,
})
