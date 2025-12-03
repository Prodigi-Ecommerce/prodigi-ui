import { useEffect, useMemo, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useWorkspaceContext } from '@/contexts/WorkspaceContext'
import { useAuth } from '@/contexts/AuthContext'
import projectsApiClient from '@/services/projectsApi'
import { getWorkspaceHeaders } from '@/services/apiHeaders'
import type {
  ProjectInputImage,
  ProjectOutputImage,
  ProjectStatus,
  ProjectSummary,
} from '@/types/projectsApi'
import {
  Filter,
  ChevronDown,
  ChevronUp,
  ArrowUpRight,
  ArrowDownToLine,
} from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { GenerateFormPanel } from '@/components/Generate/GenerateFormPanel'
import { cn } from '@/lib/utils'
import { PreviewTile } from './components/PreviewTile/PreviewTile'
import JSZip from 'jszip'

const statusColors: Record<ProjectStatus, string> = {
  DRAFT: 'bg-gray-500',
  PENDING: 'bg-yellow-500',
  PROCESSING: 'bg-blue-500',
  COMPLETE: 'bg-green-500',
  FAILED: 'bg-red-500',
}

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

export function Dashboard() {
  const [projects, setProjects] = useState<ProjectSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'ALL'>('ALL')
  const [nameFilter, setNameFilter] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [downloadingProjectId, setDownloadingProjectId] = useState<string | null>(null)
  const [downloadErrors, setDownloadErrors] = useState<Record<string, string>>({})
  const { selectedWorkspaceId } = useWorkspaceContext()
  const { user, accessToken } = useAuth()
  const navigate = useNavigate()
  const authHeaders = useMemo(
    () => (user && accessToken ? { userId: user.id, accessToken } : null),
    [user, accessToken]
  )

  const workspaceReady = Boolean(selectedWorkspaceId && authHeaders)

  const fetchProjects = async () => {
    if (!workspaceReady || !selectedWorkspaceId || !authHeaders) {
      setProjects([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const response = await projectsApiClient.get<ProjectSummary[]>(
        '/projects',
        {
          headers: getWorkspaceHeaders(selectedWorkspaceId, authHeaders),
        }
      )
      setProjects(response.data)
    } catch (err) {
      console.error('Failed to fetch projects:', err)
      setError('Failed to load projects')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [selectedWorkspaceId, authHeaders, workspaceReady])

  const hasActiveFilters =
    statusFilter !== 'ALL' || nameFilter.trim().length > 0

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      if (statusFilter !== 'ALL' && project.status !== statusFilter) {
        return false
      }

      if (nameFilter) {
        const search = nameFilter.trim().toLowerCase()
        const matchesName = project.name.toLowerCase().includes(search)
        const matchesId = project.projectId.toLowerCase().includes(search)
        if (!matchesName && !matchesId) {
          return false
        }
      }

      return true
    })
  }, [projects, statusFilter, nameFilter])

  const resetFilters = () => {
    setStatusFilter('ALL')
    setNameFilter('')
  }

  const sectionTitleClass =
    'text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground'

  const handleDownloadOutputs = async (project: ProjectSummary) => {
    const downloadableOutputs = project.outputImages.filter(
      (image): image is ProjectOutputImage & { downloadUrl: string } =>
        Boolean(image.downloadUrl)
    )

    if (downloadableOutputs.length === 0) {
      return
    }

    setDownloadingProjectId(project.projectId)
    setDownloadErrors((prev) => {
      const next = { ...prev }
      delete next[project.projectId]
      return next
    })

    try {
      const zip = new JSZip()
      await Promise.all(
        downloadableOutputs.map(async (image) => {
          const response = await fetch(image.downloadUrl!, {
            method: 'GET',
            credentials: 'omit',
            cache: 'no-store',
          })
          if (!response.ok) {
            throw new Error('Failed to fetch file')
          }
          const buffer = await response.arrayBuffer()
          zip.file(buildFilename(image, 'output'), buffer)
        })
      )

      const zipBlob = await zip.generateAsync({ type: 'blob' })
      const safeProjectName = project.name.replace(/[^a-zA-Z0-9-_\.]/g, '_')
      const filename =
        safeProjectName.length > 0
          ? `${safeProjectName}-outputs.zip`
          : `${project.projectId}-outputs.zip`
      triggerDownload(zipBlob, filename)
    } catch (err) {
      console.error('Failed to download outputs', err)
      setDownloadErrors((prev) => ({
        ...prev,
        [project.projectId]: 'Failed to download outputs. Please try again.',
      }))
    } finally {
      setDownloadingProjectId(null)
    }
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-red-500">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <GenerateFormPanel
          className="mx-auto"
          onProjectCreated={(projectId) =>
            navigate({
              to: '/projects/$projectId',
              params: { projectId },
            })
          }
        />

        <div className="flex flex-col gap-4">
          <div className="space-y-2 text-center sm:text-left">
            <h1 className="text-3xl font-bold">Projects</h1>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className={sectionTitleClass}>Optional filters</p>
            <Button
              variant={showFilters || hasActiveFilters ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowFilters((prev) => !prev)}
              disabled={!workspaceReady}
              className="gap-2 self-start sm:self-auto"
            >
              <Filter className="h-4 w-4" />
              {showFilters ? 'Hide filters' : 'Show filters'}
              {showFilters ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {showFilters && (
          <Card>
            <CardContent className="pt-6 space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label className={sectionTitleClass}>
                    Search by name or ID
                  </Label>
                  <Input
                    placeholder="e.g. Spring campaign or project ID"
                    value={nameFilter}
                    onChange={(event) => setNameFilter(event.target.value)}
                    disabled={!workspaceReady}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label className={sectionTitleClass}>Project status</Label>
                  <Select
                    value={statusFilter}
                    onValueChange={(value) => setStatusFilter(value as ProjectStatus | 'ALL')}
                    disabled={!workspaceReady}
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All</SelectItem>
                      <SelectItem value="DRAFT">Draft</SelectItem>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="PROCESSING">Processing</SelectItem>
                      <SelectItem value="COMPLETE">Complete</SelectItem>
                      <SelectItem value="FAILED">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={resetFilters}>
                    Reset filters
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-2/3" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : !workspaceReady ? (
          <Card className="border border-dashed border-border/60 shadow-none">
            <CardContent className="flex flex-col items-center justify-center gap-3 py-16 px-8 text-center">
              <p className="max-w-md text-muted-foreground">
                No projects found. Create one to get started.
              </p>
            </CardContent>
          </Card>
        ) : filteredProjects.length === 0 ? (
          <Card className="border border-dashed border-border/60 shadow-none">
            <CardContent className="flex flex-col items-center justify-center gap-4 py-16 px-8 text-center">
              <p className="max-w-md text-muted-foreground">
                {hasActiveFilters
                  ? 'No projects match your filters. Try adjusting or resetting them.'
                  : 'No projects found. Create one to get started!'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 max-w-7xl mx-auto">
            {filteredProjects.map((project) => (
              <Card
                key={project.projectId}
                role="link"
                tabIndex={0}
                onClick={() =>
                  navigate({
                    to: '/projects/$projectId',
                    params: { projectId: project.projectId },
                  })
                }
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    navigate({
                      to: '/projects/$projectId',
                      params: { projectId: project.projectId },
                    })
                  }
                }}
                className="group h-full overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-lg active:translate-y-0 py-0 gap-0 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2"
              >
                <AspectRatio ratio={4 / 5} className="overflow-hidden">
                  <PreviewTile project={project} />
                </AspectRatio>
                <CardHeader className="space-y-3 px-4 py-4">
                  <div className="flex flex-col gap-2 items-start">
                    <Badge className={statusColors[project.status]}>
                      {project.status}
                    </Badge>
                    <h2 className="text-lg font-semibold transition-colors group-hover:text-primary">
                      {project.name}
                    </h2>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground transition-all group-hover:text-primary">
                      <span>Open project</span>
                      <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-full border border-transparent hover:border-primary/40 hover:bg-primary/5 transition-colors"
                      disabled={
                        downloadingProjectId === project.projectId ||
                        project.outputImages.every((img) => !img.downloadUrl)
                      }
                      onClick={(event) => {
                        event.stopPropagation()
                        handleDownloadOutputs(project)
                      }}
                    >
                      <ArrowDownToLine
                        className={cn(
                          'h-4 w-4 transition-colors',
                          downloadingProjectId === project.projectId
                            ? 'text-muted-foreground'
                            : 'text-foreground'
                        )}
                      />
                      <span className="sr-only">Download outputs</span>
                    </Button>
                  </div>
                  {downloadErrors[project.projectId] && (
                    <p className="text-xs text-destructive">
                      {downloadErrors[project.projectId]}
                    </p>
                  )}
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
