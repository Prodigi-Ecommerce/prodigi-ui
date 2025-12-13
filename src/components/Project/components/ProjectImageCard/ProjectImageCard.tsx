import { useEffect, useState } from 'react'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Spinner } from '@/components/ui/spinner'
import type { ProjectInputImage, ProjectOutputImage } from '@/types/projectsApi'
import { cn } from '@/lib/utils'
import { Download, ExternalLink, Maximize2 } from 'lucide-react'

interface ProjectImageCardProps {
  image: ProjectInputImage | ProjectOutputImage
  kind: 'input' | 'output'
  onDownloadImage?: (image: ProjectInputImage | ProjectOutputImage) => void
}

export const ProjectImageCard = ({
  image,
  kind,
  onDownloadImage,
}: ProjectImageCardProps) => {
  const previewUrl = image.thumbnailDownloadUrl ?? image.downloadUrl
  const viewUrl = image.downloadUrl ?? image.thumbnailDownloadUrl
  const downloadUrl = image.downloadUrl ?? image.thumbnailDownloadUrl
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [zoomOrigin, setZoomOrigin] = useState<{ x: number; y: number } | null>(null)
  const typeLabel = kind === 'output' ? 'Output' : 'Input'
  const hasPreview = Boolean(previewUrl) && !imageError
  const hasDownload = Boolean(downloadUrl)

  useEffect(() => {
    setImageLoaded(false)
    setImageError(false)
  }, [previewUrl])

  return (
    <Card className="group flex h-full flex-col overflow-hidden p-0 bg-card/90 border-border/60 backdrop-blur transition-all hover:-translate-y-0.5 hover:shadow-lg hover:border-primary/40">
      <Dialog>
        <DialogTrigger asChild>
          <button
            type="button"
            aria-label={`${typeLabel} image preview ${image.imageId}`}
            className="relative block w-full flex-1 bg-muted cursor-zoom-in text-left p-0 leading-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2"
          >
            <AspectRatio ratio={3 / 4} className="overflow-hidden relative">
              {!hasPreview ? (
                <div className="absolute inset-0 flex items-center justify-center p-4 text-center text-xs text-muted-foreground">
                  Preview unavailable
                </div>
              ) : (
                <>
                  {!imageLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Spinner className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                  <img
                    src={previewUrl}
                    alt={`${typeLabel} ${image.imageId}`}
                    className={cn(
                      'absolute inset-0 block h-full w-full object-cover transition-transform duration-300',
                      imageLoaded ? 'opacity-100 group-hover:scale-[1.02]' : 'opacity-0'
                    )}
                    loading="lazy"
                    decoding="async"
                    onLoad={() => setImageLoaded(true)}
                    onError={() => setImageError(true)}
                  />
                </>
              )}
            </AspectRatio>

            <div className="absolute inset-0 flex flex-col justify-between bg-gradient-to-t from-background/80 via-transparent to-background/30 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              <div className="flex items-start justify-between p-3">
                <Badge
                  variant="secondary"
                  className="text-[11px] uppercase bg-background/90 text-foreground border border-border/60"
                >
                  {typeLabel}
                </Badge>
                <Maximize2 className="h-4 w-4 text-foreground" />
              </div>
              <div className="flex items-center justify-between gap-2 p-3">
                <span className="text-xs text-foreground uppercase tracking-wide">
                  View
                </span>
                {onDownloadImage ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 rounded-full border-border/60 bg-background/80 hover:bg-primary/10"
                    onClick={(event) => {
                      event.stopPropagation()
                      onDownloadImage(image)
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
        <DialogContent className="w-[40vw] max-w-[90vw] sm:max-w-[80vw] md:max-w-[70vw] lg:max-w-[60vw] xl:max-w-[50vw] p-2 sm:p-3 [&_[data-slot='dialog-close']]:text-foreground [&_[data-slot='dialog-close']]:hover:text-foreground">
          <DialogHeader className="sr-only">
            <DialogTitle>
              {typeLabel} image • {image.imageId}
            </DialogTitle>
          </DialogHeader>
          {viewUrl ? (
            <div
              className="relative mx-auto max-h-[98vh] w-full overflow-hidden rounded-lg bg-muted"
              onMouseMove={(event) => {
                const rect = event.currentTarget.getBoundingClientRect()
                const x = ((event.clientX - rect.left) / rect.width) * 100
                const y = ((event.clientY - rect.top) / rect.height) * 100
                setZoomOrigin({ x, y })
              }}
              onMouseLeave={() => setZoomOrigin(null)}
            >
              <img
                src={viewUrl}
                alt={`${typeLabel} ${image.imageId}`}
                className={cn(
                  'mx-auto max-h-[80vh] w-full object-contain transition-transform duration-200 ease-out',
                  zoomOrigin ? 'scale-[1.5]' : 'scale-100'
                )}
                style={
                  zoomOrigin
                    ? {
                        transformOrigin: `${zoomOrigin.x}% ${zoomOrigin.y}%`,
                      }
                    : undefined
                }
              />
            </div>
          ) : null}

          {viewUrl ? (
            <div className="mt-3 flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-muted-foreground">
                {typeLabel} image • {image.imageId}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 rounded-full"
                onClick={() => window.open(viewUrl, '_blank', 'noopener,noreferrer')}
              >
                <ExternalLink className="h-4 w-4" />
                Open full size
              </Button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Preview unavailable for this image.
            </p>
          )}
        </DialogContent>
      </Dialog>
      <CardContent className="mt-auto p-3 border-t bg-muted/20">
        <div className="flex items-center justify-between text-[12px] text-muted-foreground gap-2">
          <span className="font-medium text-foreground">
            {kind === 'output' ? 'Output' : 'Input'} image
          </span>
          {hasDownload ? (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 gap-1 rounded-full text-foreground hover:bg-primary/10"
              onClick={() => onDownloadImage?.(image)}
              disabled={!hasDownload}
            >
              <Download className="h-4 w-4" />
              <span className="sr-only">Download image</span>
            </Button>
          ) : (
            <span className="text-[11px] text-muted-foreground">Pending</span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
