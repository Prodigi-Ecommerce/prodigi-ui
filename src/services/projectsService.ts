import type {
  CreateProjectResponse,
  ProjectDetail,
  UpdateProjectResponse,
  UploadUrl,
} from '@/types/projectsApi'
import { getWorkspaceHeaders, type AuthHeaderParams } from './apiHeaders'
import projectsApiClient from './projectsApi'

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
}
