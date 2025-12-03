import { useEffect, useState } from 'react'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'
import type { ProjectSummary } from '@/types/projectsApi'
import { getFirstImage } from './PreviewTile.utils'

type PreviewTileProps = {
  project: ProjectSummary
}

export const PreviewTile = ({ project }: PreviewTileProps) => {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  const firstImage = getFirstImage(project)

  useEffect(() => {
    setImageLoaded(false)
    setImageError(false)
  }, [firstImage?.src])

  if (!firstImage) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground text-sm">
        No images yet
      </div>
    )
  }

  const { src, altText } = firstImage

  return (
    <div className="relative h-full w-full overflow-hidden bg-muted">
      {!src || imageError ? (
        <div className="flex h-full w-full items-center justify-center text-muted-foreground text-sm">
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
            src={src}
            alt={altText}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            className={cn(
              'h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.02]',
              imageLoaded ? 'opacity-100' : 'opacity-0'
            )}
          />
        </>
      )}
    </div>
  )
}
