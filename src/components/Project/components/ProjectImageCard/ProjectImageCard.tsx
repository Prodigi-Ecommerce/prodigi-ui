import { useEffect, useState } from 'react'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Spinner } from '@/components/ui/spinner'
import type { ProjectInputImage, ProjectOutputImage } from '@/types/projectsApi'
import { Download, Maximize2 } from 'lucide-react'

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
  const displayUrl = image.thumbnailDownloadUrl ?? image.downloadUrl
  const downloadUrl = image.downloadUrl ?? image.thumbnailDownloadUrl
  const typeLabel = kind === 'input' ? 'Input' : 'Output'
  const hasDownload = Boolean(downloadUrl)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  useEffect(() => {
    setImageLoaded(false)
    setImageError(false)
  }, [displayUrl])

  return (
    <Card className="group overflow-hidden p-0">
      <Dialog>
        <DialogTrigger asChild>
          <button
            type="button"
            className="relative bg-muted w-full cursor-zoom-in"
          >
            <AspectRatio ratio={4 / 5} className="overflow-hidden">
              {!displayUrl || imageError ? (
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
                    src={displayUrl}
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
        <DialogContent className="max-w-6xl">
          <DialogHeader>
            <DialogTitle className="text-sm font-medium">
              {typeLabel} image • {image.imageId}
            </DialogTitle>
          </DialogHeader>
          {displayUrl ? (
            <img
              src={displayUrl}
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
      <CardContent className="space-y-1 p-3 border-t">
        <p className="text-xs text-muted-foreground">
          {kind === 'output' ? 'Output' : 'Input'} image
        </p>
      </CardContent>
    </Card>
  )
}
