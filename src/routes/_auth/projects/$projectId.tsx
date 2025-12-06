import { useCallback, useEffect, useMemo, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useWorkspaceContext } from '@/contexts/WorkspaceContext'
import { useAuth } from '@/contexts/AuthContext'
import { deleteProject, getProject } from '@/services/projectsService'
import type {
  ProjectDetail,
  ProjectInputImage,
  ProjectOutputImage,
} from '@/types/projectsApi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ProjectDetailsView } from '@/components/Project/ProjectDetailsView'
import JSZip from 'jszip'

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
  const response = await fetch(url, {
    method: 'GET',
    credentials: 'omit',
    cache: 'no-store',
  })
  if (!response.ok) {
    throw new Error('Failed to fetch file')
  }
  return response.blob()
}

const fetchArrayBuffer = async (url: string) => {
  const response = await fetch(url, {
    method: 'GET',
    credentials: 'omit',
    cache: 'no-store',
  })
  if (!response.ok) {
    throw new Error('Failed to fetch file')
  }
  return response.arrayBuffer()
}

const createZipBlob = async (
  files: Array<{ filename: string; url: string }>
) => {
  const zip = new JSZip()

  await Promise.all(
    files.map(async (file) => {
      const buffer = await fetchArrayBuffer(file.url)
      zip.file(file.filename, buffer)
    })
  )

  return zip.generateAsync({ type: 'blob' })
}

const ProjectDetailsPage = () => {
  const { projectId } = Route.useParams()
  const { selectedWorkspaceId } = useWorkspaceContext()
  const { user, accessToken } = useAuth()
  const navigate = useNavigate()
  const authHeaders = useMemo(
    () => (user && accessToken ? { userId: user.id, accessToken } : null),
    [user, accessToken]
  )
  const [project, setProject] = useState<ProjectDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDownloadingAll, setIsDownloadingAll] = useState(false)
  const [downloadError, setDownloadError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const loadProject = async () => {
      if (!selectedWorkspaceId || !authHeaders) {
        setProject(null)
        setIsLoading(false)
        if (!authHeaders) {
          setError('You must be signed in to view project details.')
        }
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const result = await getProject({
          workspaceId: selectedWorkspaceId,
          projectId,
          auth: authHeaders,
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
  }, [projectId, selectedWorkspaceId, authHeaders])

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

  const handleDownloadInputImage = useCallback(async (image: ProjectInputImage) => {
    if (!image.downloadUrl) {
      return
    }

    try {
      setDownloadError(null)
      const filename = buildFilename(image, 'input')
      const blob = await fetchBlob(image.downloadUrl)
      triggerDownload(blob, filename)
    } catch (err) {
      console.error('Failed to download image', err)
      setDownloadError('Failed to download image. Please try again.')
    }
  }, [])

  const handleDeleteProject = useCallback(async () => {
    if (!selectedWorkspaceId || !authHeaders) {
      setDeleteError(
        'You must be signed in with a workspace selected to delete this project.'
      )
      return
    }

    setIsDeleting(true)
    setDeleteError(null)

    try {
      await deleteProject({
        workspaceId: selectedWorkspaceId,
        projectId,
        auth: authHeaders,
      })
      navigate({ to: '/dashboard' })
    } catch (err) {
      console.error('Failed to delete project', err)
      setDeleteError('Unable to delete project. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }, [authHeaders, navigate, projectId, selectedWorkspaceId])

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
      {deleteError && (
        <Card className="border-destructive/40 bg-destructive/10">
          <CardContent className="py-4">
            <p className="text-sm text-destructive">{deleteError}</p>
          </CardContent>
        </Card>
      )}
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
        onDownloadInputImage={handleDownloadInputImage}
        isDownloadingAll={isDownloadingAll}
        onDeleteProject={handleDeleteProject}
        isDeleting={isDeleting}
      />
    </div>
  )
}

export const Route = createFileRoute('/_auth/projects/$projectId')({
  component: ProjectDetailsPage,
  staticData: {
    title: 'Project details',
  },
})
