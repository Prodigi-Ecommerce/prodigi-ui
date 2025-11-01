import { createFileRoute } from '@tanstack/react-router'
import { Dashboard } from '@/components/Dashboard/Dashboard.tsx'
import { WorkspaceProvider } from '@/contexts/WorkspaceContext.tsx'

export const Route = createFileRoute('/_auth/dashboard')({
  component: () => (
    <WorkspaceProvider>
      <Dashboard />
    </WorkspaceProvider>
  ),
  staticData: {
    title: 'Dashboard',
  },
})
