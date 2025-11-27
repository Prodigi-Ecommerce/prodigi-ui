import { createFileRoute } from '@tanstack/react-router'
import { Dashboard } from '@/components/Dashboard/Dashboard.tsx'

export const Route = createFileRoute('/_auth/dashboard')({
  component: Dashboard,
  staticData: {
    title: 'Dashboard',
  },
})
