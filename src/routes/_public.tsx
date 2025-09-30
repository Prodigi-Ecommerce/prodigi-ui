import { createFileRoute, Outlet } from '@tanstack/react-router'

const PublicLayout = () => {
  return (
    <main className="min-h-screen w-full relative overflow-hidden bg-background">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/5 to-background"></div>
      <div className="relative z-10">
        <Outlet />
      </div>
    </main>
  )
}

export const Route = createFileRoute('/_public')({
  component: PublicLayout,
})