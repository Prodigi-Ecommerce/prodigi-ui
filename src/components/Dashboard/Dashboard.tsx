import { useEffect, useState } from 'react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import projectsApiClient from '@/services/projectsApi'

type ProjectStatus = 'DRAFT' | 'PENDING' | 'PROCESSING' | 'COMPLETE' | 'FAILED'

interface ImageDto {
  imageId: string
  s3Key: string
  downloadUrl?: string
  uploadedAt?: string
  generatedAt?: string
}

interface Project {
  projectId: string
  userId: string
  status: ProjectStatus
  createdAt: string
  updatedAt: string
  inputImages: ImageDto[]
  outputImages: ImageDto[]
}

const statusColors: Record<ProjectStatus, string> = {
  DRAFT: 'bg-gray-500',
  PENDING: 'bg-yellow-500',
  PROCESSING: 'bg-blue-500',
  COMPLETE: 'bg-green-500',
  FAILED: 'bg-red-500',
}

export function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'ALL'>('ALL')

  const fetchProjects = async (status?: ProjectStatus) => {
    setLoading(true)
    setError(null)
    try {
      const response = await projectsApiClient.get<Project[]>('/projects', {
        params: status && status !== undefined ? { status } : {},
        headers: {
          'x-user-id': '001221', // Replace with actual user ID retrieval logic
          Authorization: `Bearer  mock-token`, // Replace with actual token retrieval logic
        },
      })
      setProjects(response.data)
    } catch (err) {
      console.error('Failed to fetch projects:', err)
      setError('Failed to load projects')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProjects(statusFilter === 'ALL' ? undefined : statusFilter)
  }, [statusFilter])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
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
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Projects</h1>
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as ProjectStatus | 'ALL')}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Projects</SelectItem>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="PROCESSING">Processing</SelectItem>
              <SelectItem value="COMPLETE">Complete</SelectItem>
              <SelectItem value="FAILED">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>

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
        ) : projects.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                No projects found. Create one to get started!
              </p>
            </CardContent>
          </Card>
        ) : (
          <Accordion type="single" collapsible className="space-y-4">
            {projects.map((project) => (
              <AccordionItem
                key={project.projectId}
                value={project.projectId}
                className="border rounded-lg bg-card"
              >
                <AccordionTrigger className="px-6 hover:no-underline">
                  <div className="flex items-center gap-4 w-full">
                    <Badge className={statusColors[project.status]}>
                      {project.status}
                    </Badge>
                    <div className="flex-1 text-left">
                      <p className="font-mono text-sm">{project.projectId}</p>
                      <p className="text-xs text-muted-foreground">
                        Created: {formatDate(project.createdAt)}
                      </p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {project.inputImages.length} input •{' '}
                      {project.outputImages.length} output
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6 transition-opacity duration-200 data-[state=closed]:opacity-0 data-[state=open]:opacity-100 data-[state=closed]:hidden will-change-[opacity,transform] data-[state=open]:animate-fadeInSlow data-[state=closed]:animate-fadeOutFast">
                  <div className="space-y-6 pt-4">
                    {/* Input Images */}
                    {project.inputImages.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold mb-3">
                          Input Images ({project.inputImages.length})
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {project.inputImages.map((img) => (
                            <div
                              key={img.imageId}
                              className="relative group overflow-hidden rounded-lg border bg-muted aspect-square"
                            >
                              {img.downloadUrl ? (
                                <img
                                  src={img.downloadUrl}
                                  alt={img.imageId}
                                  loading='lazy'
                                  decoding='async'
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <p className="text-xs text-muted-foreground">
                                    No preview
                                  </p>
                                </div>
                              )}
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <p className="text-white text-xs font-mono px-2 text-center break-all">
                                  {img.imageId}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Output Images */}
                    {project.outputImages.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold mb-3">
                          Generated Images ({project.outputImages.length})
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {project.outputImages.map((img) => (
                            <div
                              key={img.imageId}
                              className="relative group overflow-hidden rounded-lg border bg-muted aspect-square"
                            >
                              {img.downloadUrl ? (
                                <img
                                  src={img.downloadUrl}
                                  alt={img.imageId}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <p className="text-xs text-muted-foreground">
                                    No preview
                                  </p>
                                </div>
                              )}
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <p className="text-white text-xs font-mono px-2 text-center break-all">
                                  {img.imageId}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Metadata */}
                    <div className="text-xs text-muted-foreground space-y-1 pt-4 border-t">
                      <p>Last updated: {formatDate(project.updatedAt)}</p>
                      <p className="font-mono">User ID: {project.userId}</p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>
    </div>
  )
}