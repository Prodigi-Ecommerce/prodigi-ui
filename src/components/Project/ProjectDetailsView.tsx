import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type {
  ProjectDetail,
  ProjectInputImage,
  ProjectOutputImage,
} from '@/types/projectsApi'
import { Download } from 'lucide-react'
import { useMemo } from 'react'
import { ProjectImageSection } from './components/ProjectImageSection/ProjectImageSection'
import { MetadataItem } from './components/MetadataItem/MetadataItem'
import { formatDate } from './ProjectDetailsView.utils'
import { statusColors } from './ProjectDetailsView.configs'

interface ProjectDetailsViewProps {
  project: ProjectDetail
  onDownloadOutputImage: (image: ProjectOutputImage) => void
  onDownloadInputImage?: (image: ProjectInputImage) => void
  onDownloadAllOutputs: () => void
  isDownloadingAll: boolean
}

export function ProjectDetailsView({
  project,
  onDownloadAllOutputs,
  onDownloadOutputImage,
  onDownloadInputImage,
  isDownloadingAll,
}: ProjectDetailsViewProps) {
  const downloadableOutputCount = useMemo(() => {
    return project.outputImages.filter((image) => Boolean(image.downloadUrl))
      .length
  }, [project])

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <header className="flex flex-col gap-6 from-background via-card to-background pt-4">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <Badge className={statusColors[project.status]}>
                {project.status}
              </Badge>
              <h1 className="text-3xl font-semibold tracking-tight">
                {project.name}
              </h1>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <MetadataItem
                label="Created"
                value={formatDate(project.createdAt)}
              />
              <MetadataItem
                label="Last updated"
                value={formatDate(project.updatedAt)}
              />
              <MetadataItem
                label="Input images"
                value={String(project.inputImages.length)}
              />
              <MetadataItem
                label="Output images"
                value={String(project.outputImages.length)}
              />
            </div>
          </div>
          <div className="flex flex-col gap-2 rounded-xl border border-primary/20 bg-primary/5 p-4 shadow-sm">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                Output bundle
              </p>
              <p className="text-sm text-muted-foreground">
                {downloadableOutputCount > 0
                  ? `${downloadableOutputCount} of ${project.outputImages.length} output images are ready to download.`
                  : 'Outputs are not yet ready to download.'}
              </p>
            </div>
            <Button
              onClick={onDownloadAllOutputs}
              disabled={isDownloadingAll || downloadableOutputCount === 0}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              {isDownloadingAll
                ? 'Bundling outputs…'
                : 'Download all outputs (.zip)'}
            </Button>
            <p className="text-xs text-muted-foreground">
              Zips every generated image currently available.
            </p>
          </div>
        </div>
      </header>

      <ProjectImageSection
        title="Generated images"
        images={project.outputImages}
        kind="output"
        onDownloadImage={onDownloadOutputImage}
      />

      <ProjectImageSection
        title="Input images"
        images={project.inputImages}
        kind="input"
        onDownloadImage={onDownloadInputImage}
      />
    </div>
  )
}
