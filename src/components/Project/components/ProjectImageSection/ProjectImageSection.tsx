import type { ProjectInputImage, ProjectOutputImage } from '@/types/projectsApi'
import { sectionTitleClass } from '../../constants'
import { ProjectImageCard } from '../ProjectImageCard/ProjectImageCard'

interface ProjectImageSectionProps {
  title: string
  images: Array<ProjectInputImage | ProjectOutputImage>
  kind: 'input' | 'output'
  onDownloadImage?: (image: ProjectInputImage | ProjectOutputImage) => void
}

export const ProjectImageSection = ({
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
      <div className="py-6 text-sm text-muted-foreground text-center">
        No images available.
      </div>
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
