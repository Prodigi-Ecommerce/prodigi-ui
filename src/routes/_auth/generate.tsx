import { createFileRoute } from '@tanstack/react-router'
import { AiProductPhotoForm } from '@/components/AIProductPhotoForm/AiProductPhotoForm.tsx'

export const Route = createFileRoute("/_auth/generate")({
  component: AiProductPhotoForm,
  staticData: {
    title: "Generate",
  }
})
