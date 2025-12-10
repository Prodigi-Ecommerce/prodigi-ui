import type {
  ProjectInputImage,
  ProjectOutputImage,
  ProjectSummary,
} from '@/types/projectsApi'

const buildAltText = (image: ProjectInputImage | ProjectOutputImage) =>
  typeof image.imageId === 'string' && image.imageId.length > 0
    ? image.imageId
    : 'preview'

const resolveSrc = (
  image: ProjectInputImage | ProjectOutputImage
): string | null => {
  if (
    'thumbnailDownloadUrl' in image &&
    typeof image.thumbnailDownloadUrl === 'string' &&
    image.thumbnailDownloadUrl.length > 0
  ) {
    return image.thumbnailDownloadUrl
  }

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

export const getPreviewImages = (project: ProjectSummary) => {
  const useOutputs = project.outputImages.length > 0
  const imagesToShow = useOutputs ? project.outputImages : project.inputImages

  return imagesToShow
    .map((image) => {
      const src = resolveSrc(image)
      if (!src) return null

      return {
        src,
        altText: buildAltText(image),
      }
    })
    .filter(Boolean) as { src: string; altText: string }[]
}
