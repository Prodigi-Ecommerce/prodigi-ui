import type {
  CreateProjectResponse,
  ProjectDetail,
  ProjectSummary,
  UpdateProjectResponse,
  UploadUrl,
} from '@/types/projectsApi'
import { getWorkspaceHeaders, type AuthHeaderParams } from './apiHeaders'
import projectsApiClient from './projectsApi'

const projectsCache = new Map<string, ProjectSummary[]>()

const projectsCacheKey = (workspaceId: string, accessToken: string) =>
  `${workspaceId}::${accessToken}`

export const fetchProjects = async ({
  workspaceId,
  auth,
}: {
  workspaceId: string
  auth: AuthHeaderParams
}) => {
  const key = projectsCacheKey(workspaceId, auth.accessToken)
  if (projectsCache.has(key)) {
    return projectsCache.get(key)!
  }

  const response = await projectsApiClient.get<ProjectSummary[]>(
    '/projects',
    {
      headers: getWorkspaceHeaders(workspaceId, auth),
    }
  )
  projectsCache.set(key, response.data)
  return response.data
}

export const invalidateProjectsCache = (workspaceId?: string, accessToken?: string) => {
  if (workspaceId && accessToken) {
    projectsCache.delete(projectsCacheKey(workspaceId, accessToken))
    return
  }
  if (workspaceId) {
    Array.from(projectsCache.keys()).forEach((key) => {
      if (key.startsWith(`${workspaceId}::`)) {
        projectsCache.delete(key)
      }
    })
    return
  }
  projectsCache.clear()
}

interface CreateProjectArgs {
  workspaceId: string
  name: string
  files: File[]
  auth: AuthHeaderParams
}

export const createProject = async ({
  workspaceId,
  name,
  files,
  auth,
}: CreateProjectArgs) => {
  const response = await projectsApiClient.post<CreateProjectResponse>(
    '/projects',
    {
      name,
      files: files.map((file) => ({
        fileType: file.type || 'application/octet-stream',
      })),
    },
    {
      headers: getWorkspaceHeaders(workspaceId, auth),
    }
  )
  invalidateProjectsCache(workspaceId, auth.accessToken)
  return response.data
}

interface UpdateProjectArgs {
  workspaceId: string
  projectId: string
  uploadUrls: UploadUrl[]
  auth: AuthHeaderParams
}

export const updateProject = async ({
  workspaceId,
  projectId,
  uploadUrls,
  auth,
}: UpdateProjectArgs) => {
  const response = await projectsApiClient.patch<UpdateProjectResponse>(
    `/projects/${projectId}`,
    {
      status: 'PENDING',
      inputImages: uploadUrls.map((url) => ({
        imageId: url.imageId,
        s3Key: url.key,
      })),
      outputImages: [],
    },
    {
      headers: getWorkspaceHeaders(workspaceId, auth),
    }
  )
  invalidateProjectsCache(workspaceId, auth.accessToken)
  return response.data
}

interface GetProjectArgs {
  workspaceId: string
  projectId: string
  auth: AuthHeaderParams
}

export const getProject = async ({
  workspaceId,
  projectId,
  auth,
}: GetProjectArgs) => {
  const response = await projectsApiClient.get<ProjectDetail>(
    `/projects/${projectId}`,
    {
      headers: getWorkspaceHeaders(workspaceId, auth),
    }
  )
  return response.data
}

interface DeleteProjectArgs {
  workspaceId: string
  projectId: string
  auth: AuthHeaderParams
}

export const deleteProject = async ({
  workspaceId,
  projectId,
  auth,
}: DeleteProjectArgs) => {
  await projectsApiClient.delete(`/projects/${projectId}`, {
    headers: getWorkspaceHeaders(workspaceId, auth),
  })
  invalidateProjectsCache(workspaceId, auth.accessToken)
}
