import type {
  CreateWorkspaceResponse,
  WorkspaceSummary,
} from '@/types/workspacesApi'
import { getUserHeaders, type AuthHeaderParams } from './apiHeaders'
import projectsApiClient from './projectsApi'

const workspacesCache = new Map<string, WorkspaceSummary[]>()

export const fetchWorkspaces = async (auth: AuthHeaderParams) => {
  const cacheKey = auth.accessToken
  if (workspacesCache.has(cacheKey)) {
    return workspacesCache.get(cacheKey)!
  }

  const response = await projectsApiClient.get<WorkspaceSummary[]>(
    '/workspaces',
    {
      headers: getUserHeaders(auth),
    }
  )
  workspacesCache.set(cacheKey, response.data)
  return response.data
}

export const invalidateWorkspacesCache = (accessToken?: string) => {
  if (accessToken) {
    workspacesCache.delete(accessToken)
  } else {
    workspacesCache.clear()
  }
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
  invalidateWorkspacesCache(auth.accessToken)
}

export const createWorkspace = async (name: string, auth: AuthHeaderParams) => {
  const response = await projectsApiClient.post<CreateWorkspaceResponse>(
    '/workspaces',
    { name },
    {
      headers: getUserHeaders(auth),
    }
  )

  invalidateWorkspacesCache(auth.accessToken)
  return response.data
}
