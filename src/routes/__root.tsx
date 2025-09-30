import {
  createRootRoute,
  Outlet,
  useRouterState,
} from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { ThemeToggle } from '@/components/Theme/ThemeToggle.tsx'

const RootLayout = () => {
  const isLoading = useRouterState({ select: (s) => s.isLoading })

  return (
    <>
      <ThemeToggle className="fixed top-[10px] right-4 z-[100] h-10" />

      <div className="flex min-h-screen w-full relative">
        {isLoading ? (
          <div className="flex items-center justify-center min-h-screen w-full">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        ) : (
          <Outlet />
        )}
      </div>
    </>
  )
}

export const Route = createRootRoute({
  component: RootLayout,
})