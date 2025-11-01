import { createFileRoute } from '@tanstack/react-router'
import { AiProductPhotoForm } from '@/components/AIProductPhotoForm/AiProductPhotoForm.tsx'
import { WorkspaceProvider } from '@/contexts/WorkspaceContext.tsx'

export const Route = createFileRoute("/_auth/generate")({
  component: () => (
    <WorkspaceProvider>
      <AiProductPhotoForm />
    </WorkspaceProvider>
  ),
  staticData: {
    title: "Generate",
  }
})
