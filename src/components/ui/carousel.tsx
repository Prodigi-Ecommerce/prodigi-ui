import * as React from 'react'
import useEmblaCarousel, {
  type EmblaOptionsType,
  type EmblaPluginType,
  type UseEmblaCarouselType,
} from 'embla-carousel-react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button, buttonVariants } from '@/components/ui/button'
import type { VariantProps } from 'class-variance-authority'

type CarouselApi = UseEmblaCarouselType[1]
type CarouselRef = UseEmblaCarouselType[0]

type CarouselProps = {
  opts?: EmblaOptionsType
  plugins?: EmblaPluginType[]
  orientation?: 'horizontal' | 'vertical'
  setApi?: (api: CarouselApi) => void
}

type CarouselContextProps = {
  carouselRef: CarouselRef
  api: CarouselApi
  orientation: 'horizontal' | 'vertical'
}

const CarouselContext = React.createContext<CarouselContextProps | null>(null)

const useCarousel = () => {
  const context = React.useContext(CarouselContext)

  if (!context) {
    throw new Error('useCarousel must be used within a <Carousel />')
  }

  return context
}

const Carousel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & CarouselProps
>(
  (
    {
      orientation = 'horizontal',
      opts,
      setApi,
      plugins,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const [carouselRef, api] = useEmblaCarousel(
      {
        ...opts,
        axis: orientation === 'horizontal' ? 'x' : 'y',
      },
      plugins
    )

    React.useEffect(() => {
      if (!setApi || !api) return
      setApi(api)
    }, [api, setApi])

    return (
      <CarouselContext.Provider value={{ carouselRef, api, orientation }}>
        <div ref={ref} className={cn('relative', className)} {...props}>
          <div ref={carouselRef} className="overflow-hidden">
            {children}
          </div>
        </div>
      </CarouselContext.Provider>
    )
  }
)
Carousel.displayName = 'Carousel'

const CarouselContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { orientation } = useCarousel()

  return (
    <div
      ref={ref}
      className={cn(
        'flex',
        orientation === 'horizontal' ? '-ml-4' : '-mt-4 flex-col',
        className
      )}
      {...props}
    />
  )
})
CarouselContent.displayName = 'CarouselContent'

const CarouselItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { orientation } = useCarousel()

  return (
    <div
      ref={ref}
      className={cn(
        'min-w-0 shrink-0 grow-0 basis-full',
        orientation === 'horizontal' ? 'pl-4' : 'pt-4',
        className
      )}
      {...props}
    />
  )
})
CarouselItem.displayName = 'CarouselItem'

type CarouselButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>

const CarouselPrevious = React.forwardRef<
  HTMLButtonElement,
  CarouselButtonProps
>(({ className, variant = 'outline', size = 'icon', ...props }, ref) => {
  const { api, orientation } = useCarousel()

  return (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      className={cn(
        'absolute h-8 w-8 -translate-y-1/2 rounded-full bg-background/85 text-foreground shadow-sm transition-opacity',
        orientation === 'horizontal'
          ? 'left-3 top-1/2'
          : 'left-1/2 top-3 -translate-x-1/2 rotate-90',
        className
      )}
      {...props}
      onClick={(event) => {
        event.stopPropagation()
        api?.scrollPrev()
        props.onClick?.(event)
      }}
    >
      <ChevronLeft className="h-4 w-4" />
      <span className="sr-only">Previous slide</span>
    </Button>
  )
})
CarouselPrevious.displayName = 'CarouselPrevious'

const CarouselNext = React.forwardRef<
  HTMLButtonElement,
  CarouselButtonProps
>(({ className, variant = 'outline', size = 'icon', ...props }, ref) => {
  const { api, orientation } = useCarousel()

  return (
    <Button
      ref={ref}
      variant={variant as never}
      size={size as never}
      className={cn(
        'absolute h-8 w-8 -translate-y-1/2 rounded-full bg-background/85 text-foreground shadow-sm transition-opacity',
        orientation === 'horizontal'
          ? 'right-3 top-1/2'
          : 'left-1/2 bottom-3 -translate-x-1/2 rotate-90',
        className
      )}
      {...props}
      onClick={(event) => {
        event.stopPropagation()
        api?.scrollNext()
        props.onClick?.(event)
      }}
    >
      <ChevronRight className="h-4 w-4" />
      <span className="sr-only">Next slide</span>
    </Button>
  )
})
CarouselNext.displayName = 'CarouselNext'

export { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext }
