import { useEffect, useMemo, useState } from 'react'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'
import type { ProjectSummary } from '@/types/projectsApi'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import { getPreviewImages } from './PreviewTile.utils'

type PreviewTileProps = {
  project: ProjectSummary
}

export const PreviewTile = ({ project }: PreviewTileProps) => {
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({})
  const [erroredImages, setErroredImages] = useState<Record<string, boolean>>({})

  const images = useMemo(() => getPreviewImages(project), [project])

  useEffect(() => {
    setLoadedImages({})
    setErroredImages({})
  }, [images.map((image) => image.src).join('|')])

  if (images.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground text-sm">
        No images yet
      </div>
    )
  }

  const hasMultiple = images.length > 1

  return (
    <div className="relative h-full w-full overflow-hidden bg-muted">
      <Carousel className="h-full" opts={{ loop: false }}>
        <CarouselContent className="h-full">
          {images.map((image, index) => {
            const loaded = loadedImages[image.src]
            const errored = erroredImages[image.src]

            return (
              <CarouselItem key={`${image.src}-${index}`} className="h-full">
                <div className="relative h-full w-full">
                  {!loaded && !errored && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Spinner className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                  {errored ? (
                    <div className="flex h-full w-full items-center justify-center text-muted-foreground text-sm">
                      Preview unavailable
                    </div>
                  ) : (
                    <img
                      src={image.src}
                      alt={image.altText}
                      onLoad={() =>
                        setLoadedImages((prev) => ({
                          ...prev,
                          [image.src]: true,
                        }))
                      }
                      onError={() =>
                        setErroredImages((prev) => ({
                          ...prev,
                          [image.src]: true,
                        }))
                      }
                      className={cn(
                        'h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.02]',
                        loaded ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                  )}
                </div>
              </CarouselItem>
            )
          })}
        </CarouselContent>

        {hasMultiple && (
          <>
            <CarouselPrevious className="z-10 opacity-0 pointer-events-none transition-opacity duration-200 group-hover:opacity-100 group-hover:pointer-events-auto focus-visible:opacity-100 focus-visible:pointer-events-auto" />
            <CarouselNext className="z-10 opacity-0 pointer-events-none transition-opacity duration-200 group-hover:opacity-100 group-hover:pointer-events-auto focus-visible:opacity-100 focus-visible:pointer-events-auto" />
          </>
        )}
      </Carousel>
    </div>
  )
}
