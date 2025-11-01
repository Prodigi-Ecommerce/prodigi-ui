import { useCallback, useEffect, useMemo, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { createFileRoute } from '@tanstack/react-router'
import { WorkspaceProvider } from '@/contexts/WorkspaceContext'
import { useWorkspaceContext } from '@/contexts/WorkspaceContext'
import { getProject } from '@/services/projectsService'
import type {
  ProjectDetail,
  ProjectInputImage,
  ProjectOutputImage,
} from '@/types/projectsApi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ProjectDetailsView } from '@/components/Project/ProjectDetailsView'

const deriveExtension = (image: ProjectInputImage | ProjectOutputImage) => {
  if (!image.downloadUrl) {
    return 'png'
  }

  try {
    const { pathname } = new URL(image.downloadUrl)
    const lastSegment = pathname.split('/').pop() ?? ''
    const extFromPath = lastSegment.includes('.')
      ? lastSegment.split('.').pop()
      : null

    if (extFromPath && extFromPath.length > 0 && extFromPath.length <= 5) {
      return extFromPath
    }
  } catch (error) {
    console.warn('Failed to parse download URL for extension', error)
  }

  if ('s3Key' in image && image.s3Key?.includes('.')) {
    const ext = image.s3Key.split('.').pop() ?? ''
    if (ext && ext.length <= 5) {
      return ext
    }
  }

  return 'png'
}

const buildFilename = (
  image: ProjectInputImage | ProjectOutputImage,
  kind: 'input' | 'output'
) => {
  const baseFromKey =
    ('s3Key' in image && image.s3Key?.split('/').pop()) || image.imageId
  const safeBase =
    baseFromKey?.replace(/[^a-zA-Z0-9-_\.]/g, '_') || `${kind}_${image.imageId}`
  const extension = deriveExtension(image)

  if (safeBase.endsWith(`.${extension}`)) {
    return safeBase
  }

  return `${safeBase}.${extension}`
}

const triggerDownload = (blob: Blob, filename: string) => {
  const objectUrl = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = objectUrl
  link.download = filename
  link.style.display = 'none'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(objectUrl)
}

const fetchBlob = async (url: string) => {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Failed to fetch file')
  }
  return response.blob()
}

const fetchArrayBuffer = async (url: string) => {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Failed to fetch file')
  }
  return response.arrayBuffer()
}

const crcTable = new Uint32Array(256).map((_, index) => {
  let c = index
  for (let k = 0; k < 8; k += 1) {
    c = (c & 1) ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  }
  return c >>> 0
})

const crc32 = (data: Uint8Array) => {
  let crc = 0xffffffff
  for (let i = 0; i < data.length; i += 1) {
    const byte = data[i]
    crc = (crc >>> 8) ^ crcTable[(crc ^ byte) & 0xff]
  }
  return (crc ^ 0xffffffff) >>> 0
}

const textEncoder = new TextEncoder()

const createZipBlob = async (
  files: Array<{ filename: string; url: string }>
) => {
  const fileChunks: Array<Uint8Array | Uint8Array> = []
  const centralChunks: Uint8Array[] = []
  let offset = 0
  let centralDirectorySize = 0

  for (const file of files) {
    const dataBuffer = await fetchArrayBuffer(file.url)
    const data = new Uint8Array(dataBuffer)
    const crc = crc32(data)
    const nameBytes = textEncoder.encode(file.filename)

    const localHeader = new Uint8Array(30 + nameBytes.length)
    const localView = new DataView(localHeader.buffer)
    localView.setUint32(0, 0x04034b50, true)
    localView.setUint16(4, 20, true) // version needed
    localView.setUint16(6, 0, true) // flags
    localView.setUint16(8, 0, true) // compression (store)
    localView.setUint16(10, 0, true) // mod time
    localView.setUint16(12, 0, true) // mod date
    localView.setUint32(14, crc, true)
    localView.setUint32(18, data.length, true)
    localView.setUint32(22, data.length, true)
    localView.setUint16(26, nameBytes.length, true)
    localView.setUint16(28, 0, true) // extra length
    localHeader.set(nameBytes, 30)

    fileChunks.push(localHeader, data)

    const centralHeader = new Uint8Array(46 + nameBytes.length)
    const centralView = new DataView(centralHeader.buffer)
    centralView.setUint32(0, 0x02014b50, true)
    centralView.setUint16(4, 20, true) // version made by
    centralView.setUint16(6, 20, true) // version needed
    centralView.setUint16(8, 0, true) // flags
    centralView.setUint16(10, 0, true) // compression
    centralView.setUint16(12, 0, true) // mod time
    centralView.setUint16(14, 0, true) // mod date
    centralView.setUint32(16, crc, true)
    centralView.setUint32(20, data.length, true)
    centralView.setUint32(24, data.length, true)
    centralView.setUint16(28, nameBytes.length, true)
    centralView.setUint16(30, 0, true) // extra length
    centralView.setUint16(32, 0, true) // comment length
    centralView.setUint16(34, 0, true) // disk number
    centralView.setUint16(36, 0, true) // internal attrs
    centralView.setUint32(38, 0, true) // external attrs
    centralView.setUint32(42, offset, true)
    centralHeader.set(nameBytes, 46)

    centralChunks.push(centralHeader)
    centralDirectorySize += centralHeader.length

    offset += localHeader.length + data.length
  }

  const endRecord = new Uint8Array(22)
  const endView = new DataView(endRecord.buffer)
  endView.setUint32(0, 0x06054b50, true)
  endView.setUint16(4, 0, true) // disk number
  endView.setUint16(6, 0, true) // disk start
  endView.setUint16(8, centralChunks.length, true)
  endView.setUint16(10, centralChunks.length, true)
  endView.setUint32(12, centralDirectorySize, true)
  endView.setUint32(16, offset, true)
  endView.setUint16(20, 0, true) // comment length

  return new Blob([...fileChunks, ...centralChunks, endRecord], {
    type: 'application/zip',
  })
}

const ProjectDetailsPage = () => {
  const { projectId } = Route.useParams()
  const { selectedWorkspaceId } = useWorkspaceContext()
  const [project, setProject] = useState<ProjectDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDownloadingAll, setIsDownloadingAll] = useState(false)
  const [downloadError, setDownloadError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const loadProject = async () => {
      if (!selectedWorkspaceId) {
        setProject(null)
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const result = await getProject({
          workspaceId: selectedWorkspaceId,
          projectId,
        })

        if (isMounted) {
          setProject(result)
        }
      } catch (err) {
        console.error('Failed to fetch project', err)
        if (isMounted) {
          setError('Unable to load project details. Please try again later.')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadProject()

    return () => {
      isMounted = false
    }
  }, [projectId, selectedWorkspaceId])

  const downloadableOutputs = useMemo(() => {
    if (!project) {
      return []
    }

    return project.outputImages.filter((image) => Boolean(image.downloadUrl))
  }, [project])

  const handleDownloadOutputImage = useCallback(
    async (image: ProjectOutputImage) => {
      if (!image.downloadUrl) {
        return
      }

      try {
        setDownloadError(null)
        const filename = buildFilename(image, 'output')
        const blob = await fetchBlob(image.downloadUrl)
        triggerDownload(blob, filename)
      } catch (err) {
        console.error('Failed to download image', err)
        setDownloadError('Failed to download image. Please try again.')
      }
    },
    []
  )

  const handleDownloadAllOutputs = useCallback(async () => {
    if (!project || downloadableOutputs.length === 0) {
      return
    }

    setIsDownloadingAll(true)
    setDownloadError(null)

    try {
      const files = downloadableOutputs
        .filter((image): image is ProjectOutputImage & { downloadUrl: string } =>
          Boolean(image.downloadUrl)
        )
        .map((image) => ({
          filename: buildFilename(image, 'output'),
          url: image.downloadUrl!,
        }))

      const zipBlob = await createZipBlob(files)
      const projectSlug =
        project.name
          ?.trim()
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '') || project.projectId || 'project'
      const zipFilename = `${projectSlug}-outputs.zip`
      triggerDownload(zipBlob, zipFilename)
    } catch (err) {
      console.error('Failed to download all images', err)
      setDownloadError('Some outputs could not be downloaded. Please retry.')
    } finally {
      setIsDownloadingAll(false)
    }
  }, [downloadableOutputs, project])

  if (!selectedWorkspaceId) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Select a workspace</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Choose or create a workspace first to view project details.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-8">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-destructive/40">
          <CardHeader>
            <CardTitle className="text-destructive">Error loading project</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Project not found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              We couldn&apos;t find the requested project in this workspace.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-12 px-4 sm:px-6 lg:px-10">
      {downloadError && (
        <Card className="border-destructive/40 bg-destructive/10">
          <CardContent className="py-4">
            <p className="text-sm text-destructive">{downloadError}</p>
          </CardContent>
        </Card>
      )}
      <ProjectDetailsView
        project={project}
        onDownloadAllOutputs={handleDownloadAllOutputs}
        onDownloadOutputImage={handleDownloadOutputImage}
        isDownloadingAll={isDownloadingAll}
      />
    </div>
  )
}

const ProjectDetailsRoute = () => (
  <WorkspaceProvider>
    <ProjectDetailsPage />
  </WorkspaceProvider>
)

export const Route = createFileRoute('/_auth/projects/$projectId')({
  component: ProjectDetailsRoute,
  staticData: {
    title: 'Project details',
  },
})
