import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { WorkspaceSummary } from '@/types/workspacesApi'
import {
  createWorkspace as createWorkspaceRequest,
  fetchWorkspaces,
} from '@/services/workspacesService'
import { useAuth } from '@/contexts/AuthContext'

interface WorkspaceContextValue {
  workspaces: WorkspaceSummary[]
  selectedWorkspaceId: string | null
  selectWorkspace: (workspaceId: string | null) => void
  refreshWorkspaces: (preferredWorkspaceId?: string) => Promise<void>
  createWorkspace: (name: string) => Promise<void>
  isLoading: boolean
  isCreating: boolean
  error: string | null
}

const WorkspaceContext = createContext<WorkspaceContextValue | undefined>(
  undefined
)

const STORAGE_KEY = 'prodigi.selectedWorkspaceId'

const getStoredWorkspaceId = () => {
  if (typeof window === 'undefined') {
    return null
  }
  return window.localStorage.getItem(STORAGE_KEY)
}

const persistWorkspaceId = (workspaceId: string | null) => {
  if (typeof window === 'undefined') {
    return
  }

  if (workspaceId) {
    window.localStorage.setItem(STORAGE_KEY, workspaceId)
  } else {
    window.localStorage.removeItem(STORAGE_KEY)
  }
}

export const WorkspaceProvider = ({ children }: { children: ReactNode }) => {
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(
    null
  )
  const [isCreating, setIsCreating] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const { user, accessToken } = useAuth()
  const authHeaders = useMemo(
    () => (user && accessToken ? { userId: user.id, accessToken } : null),
    [user, accessToken]
  )
  const queryClient = useQueryClient()
  const workspaceQueryKey = useMemo(
    () => ['workspaces', user?.id ?? 'anonymous'],
    [user?.id]
  )

  const selectWorkspace = useCallback((workspaceId: string | null) => {
    setSelectedWorkspaceId((previous) => {
      if (previous === workspaceId) {
        return previous
      }
      persistWorkspaceId(workspaceId)
      return workspaceId
    })
  }, [])

  const {
    data: workspaces = [],
    isLoading: isQueryLoading,
    isFetching,
    error: workspaceQueryError,
    refetch,
  } = useQuery({
    queryKey: workspaceQueryKey,
    queryFn: async () => {
      if (!authHeaders) {
        throw new Error('Missing authentication context')
      }
      return fetchWorkspaces(authHeaders)
    },
    enabled: Boolean(authHeaders),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  })

  const isLoading = isQueryLoading || isFetching

  useEffect(() => {
    if (!authHeaders) {
      selectWorkspace(null)
      return
    }

    if (workspaces.length === 0) {
      selectWorkspace(null)
      return
    }

    if (
      selectedWorkspaceId &&
      workspaces.some(
        (workspace) => workspace.workspaceId === selectedWorkspaceId
      )
    ) {
      return
    }

    const storedWorkspaceId = getStoredWorkspaceId()
    const preferredWorkspaceId =
      storedWorkspaceId &&
      workspaces.find(
        (workspace) => workspace.workspaceId === storedWorkspaceId
      )?.workspaceId

    selectWorkspace(preferredWorkspaceId ?? workspaces[0]?.workspaceId ?? null)
  }, [authHeaders, workspaces, selectWorkspace, selectedWorkspaceId])

  const refreshWorkspaces = useCallback(
    async (preferredWorkspaceId?: string) => {
      if (!authHeaders) {
        setActionError('You must be signed in to manage workspaces')
        selectWorkspace(null)
        return
      }

      setActionError(null)
      const result = await refetch({ throwOnError: false })
      if (preferredWorkspaceId && result.data) {
        const matchedWorkspace = result.data.find(
          (workspace) => workspace.workspaceId === preferredWorkspaceId
        )
        if (matchedWorkspace) {
          selectWorkspace(matchedWorkspace.workspaceId)
        }
      }
    },
    [authHeaders, refetch, selectWorkspace]
  )

  const createWorkspace = useCallback(
    async (name: string) => {
      setIsCreating(true)
      setActionError(null)

      try {
        if (!authHeaders) {
          throw new Error('You must be signed in to create a workspace')
        }

        const createdWorkspace = await createWorkspaceRequest(name, authHeaders)
        const nextWorkspace: WorkspaceSummary = {
          role: 'owner',
          joinedAt: createdWorkspace.createdAt,
          ...createdWorkspace,
        }

        queryClient.setQueryData<WorkspaceSummary[] | undefined>(
          workspaceQueryKey,
          (previous) => {
            const existing = previous ?? []
            return [
              nextWorkspace,
              ...existing.filter(
                (workspace) =>
                  workspace.workspaceId !== createdWorkspace.workspaceId
              ),
            ]
          }
        )

        persistWorkspaceId(createdWorkspace.workspaceId)
        selectWorkspace(createdWorkspace.workspaceId)
        await queryClient.invalidateQueries({ queryKey: workspaceQueryKey })
      } catch (err) {
        console.error('Failed to create workspace', err)
        setActionError('Failed to create workspace')
        throw err
      } finally {
        setIsCreating(false)
      }
    },
    [authHeaders, queryClient, selectWorkspace, workspaceQueryKey]
  )

  const workspaceErrorMessage =
    workspaceQueryError instanceof Error
      ? workspaceQueryError.message
      : workspaceQueryError
        ? 'Failed to load workspaces'
        : null
  const error = actionError ?? workspaceErrorMessage ?? null

  const value = useMemo<WorkspaceContextValue>(
    () => ({
      workspaces,
      selectedWorkspaceId,
      selectWorkspace,
      refreshWorkspaces,
      createWorkspace,
      isLoading,
      isCreating,
      error,
    }),
    [
      workspaces,
      selectedWorkspaceId,
      selectWorkspace,
      refreshWorkspaces,
      createWorkspace,
      isLoading,
      isCreating,
      error,
    ]
  )

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  )
}

export const useWorkspaceContext = () => {
  const context = useContext(WorkspaceContext)
  if (!context) {
    throw new Error(
      'useWorkspaceContext must be used within a WorkspaceProvider'
    )
  }
  return context
}
