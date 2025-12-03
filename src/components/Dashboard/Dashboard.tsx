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
import { Filter, ChevronDown, ChevronUp, ArrowUpRight } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { GenerateFormPanel } from '@/components/Generate/GenerateFormPanel'
import { cn } from '@/lib/utils'

const statusColors: Record<ProjectStatus, string> = {
  DRAFT: 'bg-gray-500',
  PENDING: 'bg-yellow-500',
  PROCESSING: 'bg-blue-500',
  COMPLETE: 'bg-green-500',
  FAILED: 'bg-red-500',
}

export function Dashboard() {
  const [projects, setProjects] = useState<ProjectSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'ALL'>('ALL')
  const [nameFilter, setNameFilter] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const { selectedWorkspaceId } = useWorkspaceContext()
  const { user, accessToken } = useAuth()
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const sectionTitleClass =
    'text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground'

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
        <GenerateFormPanel className="mx-auto" />

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
              <Link
                key={project.projectId}
                to="/projects/$projectId"
                params={{ projectId: project.projectId }}
                className="group block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 h-full"
              >
                <Card className="h-full overflow-hidden transition-all duration-200 group-hover:-translate-y-0.5 group-hover:border-primary/50 group-hover:shadow-lg group-active:translate-y-0 py-0 gap-0">
                  <div className="aspect-square overflow-hidden">
                    <PreviewTile project={project} />
                  </div>
                  <CardHeader className="space-y-3 px-4 py-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <Badge className={statusColors[project.status]}>
                        {project.status}
                      </Badge>
                      <h2 className="text-lg font-semibold transition-colors group-hover:text-primary">
                        {project.name}
                      </h2>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground transition-all group-hover:text-primary">
                      <span>Open project</span>
                      <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

interface PreviewGalleryProps {
  title: string
  images: Array<ProjectInputImage | ProjectOutputImage>
  previewCount?: number
}

const PreviewGallery = ({
  title,
  images,
  previewCount = 4,
}: PreviewGalleryProps) => {
  const previews = images.slice(0, previewCount)
  const remainingCount = Math.max(images.length - previews.length, 0)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">{title}</h3>
        {remainingCount > 0 && (
          <span className="text-xs text-muted-foreground">
            +{remainingCount} more
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {previews.map((img) => (
          <div
            key={img.imageId}
            className="relative aspect-square overflow-hidden rounded-lg border bg-muted"
          >
            {img.downloadUrl ? (
              <img
                src={img.downloadUrl}
                alt={img.imageId}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center p-3 text-center text-xs text-muted-foreground">
                No preview
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

type PreviewTileProps = {
  project: ProjectSummary
}

const PreviewTile = ({ project }: PreviewTileProps) => {
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
    return (
      <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground text-sm">
        No images yet
      </div>
    )
  }

  const firstImage = imagesToShow[0]
  const src =
    'downloadUrl' in firstImage && firstImage.downloadUrl
      ? firstImage.downloadUrl
      : 'url' in firstImage
        ? firstImage.url
        : ''

  return (
    <div className="h-full w-full">
      {src ? (
        <img
          src={src}
          alt={firstImage.imageId ?? 'preview'}
          className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground text-sm">
          Preview unavailable
        </div>
      )}
    </div>
  )
}
