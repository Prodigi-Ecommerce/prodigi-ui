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
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useWorkspaceContext } from '@/contexts/WorkspaceContext'
import { useAuth } from '@/contexts/AuthContext'
import { fetchProjects, invalidateProjectsCache } from '@/services/projectsService'
import { deleteProject } from '@/services/projectsService'
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
  Clock3,
  Image as ImageIcon,
  Sparkles,
  Search,
  Trash2,
} from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { GenerateFormPanel } from '@/components/Generate/GenerateFormPanel'
import { cn } from '@/lib/utils'
import { PreviewTile } from './components/PreviewTile/PreviewTile'
import JSZip from 'jszip'
import { Spinner } from '@/components/ui/spinner'

const statusStyles: Record<ProjectStatus, string> = {
  DRAFT: 'bg-muted text-foreground border-border',
  PENDING: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-400/15 dark:text-amber-50 dark:border-amber-400/40',
  PROCESSING: 'bg-sky-100 text-sky-900 border-sky-300 dark:bg-sky-400/15 dark:text-sky-50 dark:border-sky-400/40',
  COMPLETE: 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-400/15 dark:text-emerald-50 dark:border-emerald-400/40',
  FAILED: 'bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-400/15 dark:text-rose-50 dark:border-rose-400/40',
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
  const [projectToDelete, setProjectToDelete] = useState<ProjectSummary | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const { selectedWorkspaceId } = useWorkspaceContext()
  const { user, accessToken } = useAuth()
  const navigate = useNavigate()
  const authHeaders = useMemo(
    () => (user && accessToken ? { userId: user.id, accessToken } : null),
    [user, accessToken]
  )

  const workspaceReady = Boolean(selectedWorkspaceId && authHeaders)

  const fetchProjectsList = async () => {
    if (!workspaceReady || !selectedWorkspaceId || !authHeaders) {
      setProjects([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const data = await fetchProjects({
        workspaceId: selectedWorkspaceId,
        auth: authHeaders,
      })
      setProjects(data)
    } catch (err) {
      console.error('Failed to fetch projects:', err)
      setError('Failed to load projects')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (selectedWorkspaceId && authHeaders) {
      invalidateProjectsCache(selectedWorkspaceId, authHeaders.userId)
    }
    fetchProjectsList()
  }, [selectedWorkspaceId, authHeaders, workspaceReady])

  const hasActiveFilters =
    statusFilter !== 'ALL' || nameFilter.trim().length > 0
  const filterButtonActive = showFilters || hasActiveFilters

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
  const statusCounts = useMemo(() => {
    const totals: Record<ProjectStatus, number> = {
      DRAFT: 0,
      PENDING: 0,
      PROCESSING: 0,
      COMPLETE: 0,
      FAILED: 0,
    }
    projects.forEach((project) => {
      totals[project.status] += 1
    })
    return totals
  }, [projects])
  const totalOutputImages = useMemo(
    () => projects.reduce((acc, project) => acc + project.outputImages.length, 0),
    [projects]
  )
  const totalInputImages = useMemo(
    () => projects.reduce((acc, project) => acc + project.inputImages.length, 0),
    [projects]
  )

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

  const handleOpenDeleteDialog = (project: ProjectSummary) => {
    setProjectToDelete(project)
    setDeleteError(null)
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!projectToDelete) return
    if (!selectedWorkspaceId || !authHeaders) {
      setDeleteError(
        'You must be signed in with a workspace selected to delete this project.'
      )
      return
    }

    setDeletingProjectId(projectToDelete.projectId)
    setDeleteError(null)

    try {
      await deleteProject({
        workspaceId: selectedWorkspaceId,
        projectId: projectToDelete.projectId,
        auth: authHeaders,
      })
      setProjects((prev) =>
        prev.filter((project) => project.projectId !== projectToDelete.projectId)
      )
      await fetchProjects()
      setIsDeleteDialogOpen(false)
      setProjectToDelete(null)
    } catch (err) {
      console.error('Failed to delete project', err)
      setDeleteError('Failed to delete project. Please try again.')
    } finally {
      setDeletingProjectId(null)
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

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="relative overflow-hidden border-primary/20 bg-card">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="space-y-2">
                <p className={sectionTitleClass}>Active projects</p>
                <h2 className="text-3xl font-semibold">{projects.length}</h2>
                <p className="text-sm text-muted-foreground">
                  {statusCounts.COMPLETE} complete • {statusCounts.PROCESSING + statusCounts.PENDING} in progress
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <Sparkles className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-amber-300/40 bg-muted/60">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="space-y-2">
                <p className={sectionTitleClass}>In progress</p>
                <h2 className="text-3xl font-semibold">
                  {statusCounts.PROCESSING + statusCounts.PENDING}
                </h2>
                <p className="text-sm text-muted-foreground">Queued or rendering now</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-amber-100 text-amber-900 dark:bg-amber-500/20 dark:text-amber-50 flex items-center justify-center">
                <Clock3 className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="space-y-2">
                <p className={sectionTitleClass}>Assets generated</p>
                <h2 className="text-3xl font-semibold">{totalOutputImages}</h2>
                <p className="text-sm text-muted-foreground">
                  {totalInputImages} references uploaded
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/20 text-primary flex items-center justify-center">
                <ImageIcon className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold">Projects</h1>
              <p className="text-sm text-muted-foreground">
                Track generation runs, download outputs, and jump back into work.
              </p>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              {hasActiveFilters && (
                <Badge variant="secondary" className="rounded-full bg-primary/10 text-primary border-primary/30">
                  {statusFilter !== 'ALL' ? `${statusFilter} • ` : ''}{' '}
                  {nameFilter ? `“${nameFilter}”` : 'Filters active'}
                </Badge>
              )}
              <Button
                variant={filterButtonActive ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setShowFilters((prev) => !prev)}
                disabled={!workspaceReady}
                className={cn(
                  'gap-2 rounded-full border border-border/60 transition-colors',
                  filterButtonActive
                    ? 'bg-primary/15 text-foreground hover:bg-primary/25 hover:text-foreground'
                    : 'hover:bg-muted/60 hover:text-foreground'
                )}
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
        </div>

        {showFilters && (
          <Card className="glass-panel border-primary/10">
            <CardContent className="pt-6 space-y-6">
              <div className="grid gap-4 md:grid-cols-[2fr_1.2fr]">
                <div className="flex flex-col gap-2">
                  <Label className={sectionTitleClass}>
                    Search by name or ID
                  </Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      className="pl-9"
                      placeholder="e.g. Spring campaign or project ID"
                      value={nameFilter}
                      onChange={(event) => setNameFilter(event.target.value)}
                      disabled={!workspaceReady}
                    />
                  </div>
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
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap gap-2">
                  {(
                    [
                      { label: 'All', value: 'ALL', count: projects.length },
                      { label: 'Draft', value: 'DRAFT', count: statusCounts.DRAFT },
                      { label: 'Processing', value: 'PROCESSING', count: statusCounts.PROCESSING },
                      { label: 'Complete', value: 'COMPLETE', count: statusCounts.COMPLETE },
                      { label: 'Failed', value: 'FAILED', count: statusCounts.FAILED },
                    ] as const
                  ).map((option) => (
                    <Button
                      key={option.value}
                      type="button"
                      variant={statusFilter === option.value ? 'default' : 'outline'}
                      size="sm"
                      className={cn(
                        'rounded-full border border-border/60 transition-all',
                        statusFilter === option.value && 'shadow-sm'
                      )}
                      onClick={() => setStatusFilter(option.value as ProjectStatus | 'ALL')}
                      disabled={!workspaceReady}
                    >
                      {option.label}
                      <Badge
                        variant="secondary"
                        className="ml-2 rounded-full bg-background/80 text-foreground px-2 py-0 text-[11px] font-semibold"
                      >
                        {option.count}
                      </Badge>
                    </Button>
                  ))}
                </div>
                <div className="flex justify-end gap-2">
                  {hasActiveFilters && (
                    <Button variant="ghost" size="sm" onClick={resetFilters}>
                      Reset filters
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-12 text-center text-muted-foreground">
            <Spinner className="h-6 w-6" />
            <p className="text-sm">Loading projects…</p>
          </div>
        ) : !workspaceReady ? (
          <div className="flex flex-col items-center justify-center gap-2 py-10 text-center text-muted-foreground">
            <p className="max-w-md">
              No projects found. Create one to get started.
            </p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-10 text-center text-muted-foreground">
            <p className="max-w-md">
              {hasActiveFilters
                ? 'No projects match your filters. Try adjusting or resetting them.'
                : 'No projects found. Create one to get started!'}
            </p>
          </div>
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
                className="group h-full overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-lg active:translate-y-0 py-0 gap-0 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 bg-card/90 backdrop-blur"
              >
                <AspectRatio ratio={4 / 5} className="overflow-hidden">
                  <PreviewTile project={project} />
                </AspectRatio>
                <CardHeader className="space-y-4 px-4 py-4">
                  <div className="flex flex-col gap-2 items-start">
                    <Badge
                      variant="outline"
                      className={cn(
                        'border text-xs font-medium',
                        statusStyles[project.status]
                      )}
                    >
                      {project.status}
                    </Badge>
                    <h2 className="text-lg font-semibold transition-colors group-hover:text-primary line-clamp-2">
                      {project.name}
                    </h2>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <ImageIcon className="h-4 w-4" />
                        <span className="font-medium text-foreground">
                          {project.outputImages.length}
                        </span>
                        <span className="text-muted-foreground">outputs</span>
                        <Separator orientation="vertical" className="h-4" />
                        <span className="font-medium text-foreground">
                          {project.inputImages.length}
                        </span>
                        <span className="text-muted-foreground">inputs</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock3 className="h-4 w-4" />
                        <span>
                          {new Intl.DateTimeFormat(undefined, {
                            month: 'short',
                            day: 'numeric',
                          }).format(new Date(project.updatedAt))}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground transition-all group-hover:text-primary">
                        <span>Open project</span>
                        <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                      </div>
                      <div className="flex items-center gap-2">
                        <TooltipProvider delayDuration={100}>
                          <Tooltip>
                            <TooltipTrigger asChild>
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
                                {downloadingProjectId === project.projectId ? (
                                  <Spinner className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                  <ArrowDownToLine
                                    className={cn(
                                      'h-4 w-4 transition-colors',
                                      project.outputImages.every((img) => !img.downloadUrl)
                                        ? 'text-muted-foreground'
                                        : 'text-foreground'
                                    )}
                                  />
                                )}
                                <span className="sr-only">Download outputs</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                              Download all outputs as .zip
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider delayDuration={100}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 rounded-full border border-transparent text-destructive hover:border-destructive/40 hover:bg-destructive/10 transition-colors"
                                disabled={deletingProjectId === project.projectId || !workspaceReady}
                                onClick={(event) => {
                                  event.stopPropagation()
                                  handleOpenDeleteDialog(project)
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Delete project</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                              Delete project
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
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

        <Dialog
          open={isDeleteDialogOpen}
          onOpenChange={(open) => {
            setIsDeleteDialogOpen(open)
            if (!open) {
              setProjectToDelete(null)
              setDeleteError(null)
              setDeletingProjectId(null)
            }
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete project</DialogTitle>
              <DialogDescription>
                {projectToDelete
                  ? `Are you sure you want to delete "${projectToDelete.name}"? This will remove the project and its images.`
                  : 'Are you sure you want to delete this project?'}
              </DialogDescription>
            </DialogHeader>
            {deleteError && (
              <p className="text-sm text-destructive">{deleteError}</p>
            )}
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button
                variant="destructive"
                onClick={handleConfirmDelete}
                disabled={
                  !projectToDelete ||
                  deletingProjectId === projectToDelete.projectId
                }
              >
                {deletingProjectId === projectToDelete?.projectId
                  ? 'Deleting…'
                  : 'Delete project'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
