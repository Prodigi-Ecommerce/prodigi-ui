import type {
  CreateWorkspaceResponse,
  WorkspaceSummary,
} from '@/types/workspacesApi'
import { getUserHeaders, type AuthHeaderParams } from './apiHeaders'
import projectsApiClient from './projectsApi'

const workspacesCache = new Map<string, WorkspaceSummary[]>()

export const fetchWorkspaces = async (auth: AuthHeaderParams) => {
  const cacheKey = auth.userId
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

export const invalidateWorkspacesCache = (userId?: string) => {
  if (userId) {
    workspacesCache.delete(userId)
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
  invalidateWorkspacesCache(auth.userId)
}

export const createWorkspace = async (name: string, auth: AuthHeaderParams) => {
  const response = await projectsApiClient.post<CreateWorkspaceResponse>(
    '/workspaces',
    { name },
    {
      headers: getUserHeaders(auth),
    }
  )

  invalidateWorkspacesCache(auth.userId)
  return response.data
}
