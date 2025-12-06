import type {
  CreateWorkspaceResponse,
  WorkspaceSummary,
} from '@/types/workspacesApi'
import { getUserHeaders, type AuthHeaderParams } from './apiHeaders'
import projectsApiClient from './projectsApi'

export const fetchWorkspaces = async (auth: AuthHeaderParams) => {
  const response = await projectsApiClient.get<WorkspaceSummary[]>(
    '/workspaces',
    {
      headers: getUserHeaders(auth),
    }
  )

  return response.data
}

interface DeleteWorkspaceArgs {
  workspaceId: string
  auth: AuthHeaderParams
}

export const deleteWorkspace = async ({
  workspaceId,
  auth,
}: DeleteWorkspaceArgs) => {
  await projectsApiClient.delete(`/workspaces/${workspaceId}`, {
    headers: getUserHeaders(auth),
  })
}

export const createWorkspace = async (name: string, auth: AuthHeaderParams) => {
  const response = await projectsApiClient.post<CreateWorkspaceResponse>(
    '/workspaces',
    { name },
    {
      headers: getUserHeaders(auth),
    }
  )

  return response.data
}
