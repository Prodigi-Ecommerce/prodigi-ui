import type {
  CreateProjectResponse,
  ProjectDetail,
  UpdateProjectResponse,
  UploadUrl,
} from '@/types/projectsApi'
import { getWorkspaceHeaders } from './apiHeaders'
import projectsApiClient from './projectsApi'

interface CreateProjectArgs {
  workspaceId: string
  name: string
  files: File[]
}

export const createProject = async ({
  workspaceId,
  name,
  files,
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
      headers: getWorkspaceHeaders(workspaceId),
    }
  )
  return response.data
}

interface UpdateProjectArgs {
  workspaceId: string
  projectId: string
  uploadUrls: UploadUrl[]
}

export const updateProject = async ({
  workspaceId,
  projectId,
  uploadUrls,
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
      headers: getWorkspaceHeaders(workspaceId),
    }
  )
  return response.data
}

interface GetProjectArgs {
  workspaceId: string
  projectId: string
}

export const getProject = async ({ workspaceId, projectId }: GetProjectArgs) => {
  const response = await projectsApiClient.get<ProjectDetail>(
    `/projects/${projectId}`,
    {
      headers: getWorkspaceHeaders(workspaceId),
    }
  )
  return response.data
}
