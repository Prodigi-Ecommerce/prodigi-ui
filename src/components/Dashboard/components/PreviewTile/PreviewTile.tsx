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
  type CarouselApi,
} from '@/components/ui/carousel'
import { getPreviewImages } from './PreviewTile.utils'

type PreviewTileProps = {
  project: ProjectSummary
}

export const PreviewTile = ({ project }: PreviewTileProps) => {
  const [carouselApi, setCarouselApi] = useState<CarouselApi | null>(null)
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({})
  const [erroredImages, setErroredImages] = useState<Record<string, boolean>>({})
  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(false)

  const images = useMemo(() => getPreviewImages(project), [project])

  useEffect(() => {
    setLoadedImages({})
    setErroredImages({})
  }, [images.map((image) => image.src).join('|')])

  useEffect(() => {
    if (!carouselApi) return

    const update = () => {
      setCanScrollPrev(carouselApi.canScrollPrev())
      setCanScrollNext(carouselApi.canScrollNext())
    }

    update()
    carouselApi.on('select', update)
    carouselApi.on('reInit', update)

    return () => {
      carouselApi.off('select', update)
      carouselApi.off('reInit', update)
    }
  }, [carouselApi])

  if (images.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground text-sm">
        No images yet
      </div>
    )
  }

  const hasMultiple = images.length > 1

  return (
    <div className="group relative h-full w-full overflow-hidden bg-muted">
      <Carousel className="h-full" opts={{ loop: false }} setApi={setCarouselApi}>
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
            {canScrollPrev && (
              <CarouselPrevious
                onClick={(event) => {
                  event.preventDefault()
                  event.stopPropagation()
                  carouselApi?.scrollPrev()
                }}
                className="pointer-events-none z-10 left-3 top-1/2 -translate-y-1/2 opacity-0 bg-background/85 text-foreground shadow-sm transition-opacity duration-200 group-hover:pointer-events-auto group-hover:opacity-100 focus-visible:pointer-events-auto focus-visible:opacity-100"
              />
            )}
            {canScrollNext && (
              <CarouselNext
                onClick={(event) => {
                  event.preventDefault()
                  event.stopPropagation()
                  carouselApi?.scrollNext()
                }}
                className="pointer-events-none z-10 right-3 top-1/2 -translate-y-1/2 opacity-0 bg-background/85 text-foreground shadow-sm transition-opacity duration-200 group-hover:pointer-events-auto group-hover:opacity-100 focus-visible:pointer-events-auto focus-visible:opacity-100"
              />
            )}
          </>
        )}
      </Carousel>
    </div>
  )
}
