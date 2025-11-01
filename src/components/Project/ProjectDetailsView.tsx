import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type {
  ProjectDetail,
  ProjectInputImage,
  ProjectOutputImage,
  ProjectStatus,
} from '@/types/projectsApi'
import { Download, Maximize2 } from 'lucide-react'
import { useMemo } from 'react'

interface ProjectDetailsViewProps {
  project: ProjectDetail
  onDownloadOutputImage: (image: ProjectOutputImage) => void
  onDownloadAllOutputs: () => void
  isDownloadingAll: boolean
}

const statusColors: Record<ProjectStatus, string> = {
  DRAFT: 'bg-gray-500',
  PENDING: 'bg-yellow-500',
  PROCESSING: 'bg-blue-500',
  COMPLETE: 'bg-green-500',
  FAILED: 'bg-red-500',
}

const sectionTitleClass =
  'text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground'

const formatDate = (isoDate: string) =>
  new Date(isoDate).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

export function ProjectDetailsView({
  project,
  onDownloadAllOutputs,
  onDownloadOutputImage,
  isDownloadingAll,
}: ProjectDetailsViewProps) {
  const downloadableOutputCount = useMemo(() => {
    return project.outputImages.filter((image) => Boolean(image.downloadUrl))
      .length
  }, [project])

  return (
    <div className="space-y-10 max-w-6xl mx-auto">
      <header className="flex flex-col gap-8 from-background via-card to-background pt-8">
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
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <MetadataItem
                label="Project ID"
                value={project.projectId}
                mono
              />
              <MetadataItem
                label="Workspace ID"
                value={project.workspaceId}
                mono
              />
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
          <div className="flex flex-col gap-3 rounded-2xl bg-primary/5 p-5 shadow-inner shadow-primary/10">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-primary">
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
        title="Input images"
        images={project.inputImages}
        kind="input"
      />

      <ProjectImageSection
        title="Generated images"
        images={project.outputImages}
        kind="output"
        onDownloadImage={onDownloadOutputImage}
      />
    </div>
  )
}

interface MetadataItemProps {
  label: string
  value: string
  mono?: boolean
}

const MetadataItem = ({ label, value, mono }: MetadataItemProps) => (
  <div className="space-y-1">
    <p className={sectionTitleClass}>{label}</p>
    <p
      className={mono ? 'font-mono text-sm break-all' : 'text-sm text-foreground'}
    >
      {value}
    </p>
  </div>
)

interface ProjectImageSectionProps {
  title: string
  images: Array<ProjectInputImage | ProjectOutputImage>
  kind: 'input' | 'output'
  onDownloadImage?: (image: ProjectOutputImage) => void
}

const ProjectImageSection = ({
  title,
  images,
  kind,
  onDownloadImage,
}: ProjectImageSectionProps) => (
  <section className="space-y-4">
    <div className="flex items-center justify-between">
      <div>
        <p className={sectionTitleClass}>{title}</p>
        <p className="text-sm text-muted-foreground">
          {images.length} {images.length === 1 ? 'image' : 'images'}
        </p>
      </div>
    </div>

    {images.length === 0 ? (
      <Card>
        <CardContent className="py-12 text-center text-sm text-muted-foreground">
          No images available.
        </CardContent>
      </Card>
    ) : (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {images.map((image) => (
          <ProjectImageCard
            key={image.imageId}
            image={image}
            kind={kind}
            onDownloadImage={onDownloadImage}
          />
        ))}
      </div>
    )}
  </section>
)

interface ProjectImageCardProps {
  image: ProjectInputImage | ProjectOutputImage
  kind: 'input' | 'output'
  onDownloadImage?: (image: ProjectOutputImage) => void
}

const ProjectImageCard = ({
  image,
  kind,
  onDownloadImage,
}: ProjectImageCardProps) => {
  const { downloadUrl } = image
  const typeLabel = kind === 'input' ? 'Input' : 'Output'
  const hasDownload = Boolean(downloadUrl) && kind === 'output'

  return (
    <Card className="group overflow-hidden">
      <Dialog>
        <DialogTrigger asChild>
          <button
            type="button"
            className="relative aspect-square bg-muted w-full cursor-zoom-in"
          >
            {downloadUrl ? (
              <img
                src={downloadUrl}
                alt={`${typeLabel} ${image.imageId}`}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                loading="lazy"
                decoding="async"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center p-4 text-center text-xs text-muted-foreground">
                Preview unavailable
              </div>
            )}

            <div className="absolute inset-0 flex flex-col justify-between bg-gradient-to-t from-black/70 via-transparent to-black/40 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              <div className="flex items-start justify-between p-3">
                <Badge variant="secondary" className="text-xs uppercase">
                  {typeLabel}
                </Badge>
                <Maximize2 className="h-4 w-4 text-white" />
              </div>
              <div className="flex items-center justify-between gap-2 p-3">
                <span className="text-xs text-white uppercase tracking-wide">
                  View
                </span>
                {kind === 'output' && onDownloadImage ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="gap-2"
                    onClick={(event) => {
                      event.stopPropagation()
                      onDownloadImage(image as ProjectOutputImage)
                    }}
                    disabled={!hasDownload}
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                ) : (
                  <span className="text-xs text-muted-foreground">
                    Download after processing
                  </span>
                )}
              </div>
            </div>
          </button>
        </DialogTrigger>
        <DialogContent className="max-w-6xl">
          <DialogHeader>
            <DialogTitle className="text-sm font-medium">
              {typeLabel} image • {image.imageId}
            </DialogTitle>
          </DialogHeader>
          {downloadUrl ? (
            <img
              src={downloadUrl}
              alt={`${typeLabel} ${image.imageId}`}
              className="mx-auto max-h-[80vh] w-full max-w-[min(1200px,90vw)] rounded-md object-contain"
            />
          ) : (
            <p className="text-sm text-muted-foreground">
              Preview unavailable for this image.
            </p>
          )}
        </DialogContent>
      </Dialog>
      <CardContent className="space-y-1 p-4">
        <p className="font-mono text-xs break-all">{image.imageId}</p>
        {'s3Key' in image && image.s3Key && (
          <p className="text-xs text-muted-foreground break-all">
            {image.s3Key}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
