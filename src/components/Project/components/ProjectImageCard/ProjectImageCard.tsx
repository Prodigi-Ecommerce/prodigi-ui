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
  const typeLabel = kind === 'input' ? 'Input' : 'Output'
  const hasDownload = Boolean(downloadUrl)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [zoomOrigin, setZoomOrigin] = useState<{ x: number; y: number } | null>(null)

  useEffect(() => {
    setImageLoaded(false)
    setImageError(false)
  }, [previewUrl])

  return (
    <Card className="group overflow-hidden p-0">
      <Dialog>
        <DialogTrigger asChild>
          <button
            type="button"
            className="relative bg-muted w-full cursor-zoom-in"
          >
            <AspectRatio ratio={4 / 5} className="overflow-hidden">
              {!previewUrl || imageError ? (
                <div className="flex h-full w-full items-center justify-center p-4 text-center text-xs text-muted-foreground">
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
                    className={`h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02] ${
                      imageLoaded ? 'opacity-100' : 'opacity-0'
                    }`}
                    loading="lazy"
                    decoding="async"
                    onLoad={() => setImageLoaded(true)}
                    onError={() => setImageError(true)}
                  />
                </>
              )}
            </AspectRatio>

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
                {onDownloadImage ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="gap-2"
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
        <DialogContent
          className="w-[40vw] max-w-[40vw] sm:max-w-[40vw] md:max-w-[40vw] lg:max-w-[40vw] xl:max-w-[40vw] p-1 sm:p-3 [&_[data-slot='dialog-close']]:text-black [&_[data-slot='dialog-close']]:hover:text-black [&_[data-slot='dialog-close']]:data-[state=open]:text-black"
        >
          <DialogHeader className="sr-only">
            <DialogTitle>
              {typeLabel} image • {image.imageId}
            </DialogTitle>
          </DialogHeader>
          {viewUrl ? (
            <div
              className="relative mx-auto max-h-[98vh] w-full max-w-[40vw] overflow-hidden rounded-lg bg-muted"
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
                  'mx-auto max-h-[98vh] w-full max-w-[30vw] object-contain transition-transform duration-200 ease-out',
                  zoomOrigin ? 'scale-[1.8]' : 'scale-100'
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
            <div className="mt-3 flex items-center justify-end gap-3">
              <p className="text-sm font-medium text-muted-foreground">
                {typeLabel} image • {image.imageId}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
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
      <CardContent className="space-y-1 p-3 border-t">
        <p className="text-xs text-muted-foreground">
          {kind === 'output' ? 'Output' : 'Input'} image
        </p>
      </CardContent>
    </Card>
  )
}
