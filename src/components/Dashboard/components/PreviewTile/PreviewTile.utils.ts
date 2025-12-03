import type {
  ProjectInputImage,
  ProjectOutputImage,
  ProjectSummary,
} from '@/types/projectsApi'

export type FirstImageResult = { src: string; altText: string } | null

const buildAltText = (image: ProjectInputImage | ProjectOutputImage) =>
  typeof image.imageId === 'string' && image.imageId.length > 0
    ? image.imageId
    : 'preview'

const resolveSrc = (
  image: ProjectInputImage | ProjectOutputImage
): string | null => {
  if (
    'downloadUrl' in image &&
    typeof image.downloadUrl === 'string' &&
    image.downloadUrl.length > 0
  ) {
    return image.downloadUrl
  }

  if ('url' in image) {
    const candidate = (image as { url?: string }).url
    if (typeof candidate === 'string' && candidate.length > 0) {
      return candidate
    }
  }

  return null
}

export const getFirstImage = (project: ProjectSummary): FirstImageResult => {
  const useOutputs =
    project.status === 'COMPLETE' && project.outputImages.length > 0
      ? true
      : project.outputImages.length > 0

  const imagesToShow = useOutputs
    ? project.outputImages
    : project.inputImages.length > 0
      ? project.inputImages
      : []

  if (imagesToShow.length === 0) {
    return null
  }

  const firstImage = imagesToShow[0]
  const src = resolveSrc(firstImage)

  if (!src) {
    return null
  }

  return {
    src,
    altText: buildAltText(firstImage),
  }
}
