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
