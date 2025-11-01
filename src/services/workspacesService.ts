import type {
  CreateWorkspaceResponse,
  WorkspaceSummary,
} from '@/types/workspacesApi'
import { getUserHeaders } from './apiHeaders'
import projectsApiClient from './projectsApi'

export const fetchWorkspaces = async () => {
  const response = await projectsApiClient.get<WorkspaceSummary[]>(
    '/workspaces',
    {
      headers: getUserHeaders(),
    }
  )

  return response.data
}

export const createWorkspace = async (name: string) => {
  const response = await projectsApiClient.post<CreateWorkspaceResponse>(
    '/workspaces',
    { name },
    {
      headers: getUserHeaders(),
    }
  )

  return response.data
}
