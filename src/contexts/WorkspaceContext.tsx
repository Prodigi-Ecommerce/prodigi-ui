import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { WorkspaceSummary } from '@/types/workspacesApi'
import {
  createWorkspace as createWorkspaceRequest,
  fetchWorkspaces,
} from '@/services/workspacesService'

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
  const [workspaces, setWorkspaces] = useState<WorkspaceSummary[]>([])
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(
    null
  )
  const [isLoading, setIsLoading] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const selectWorkspace = useCallback((workspaceId: string | null) => {
    setSelectedWorkspaceId(workspaceId)
    persistWorkspaceId(workspaceId)
  }, [])

  const refreshWorkspaces = useCallback(
    async (preferredWorkspaceId?: string) => {
      setIsLoading(true)
      setError(null)

      try {
        const fetchedWorkspaces = await fetchWorkspaces()
        setWorkspaces(fetchedWorkspaces)

        if (fetchedWorkspaces.length === 0) {
          selectWorkspace(null)
          return
        }

        const storedWorkspaceId =
          preferredWorkspaceId ?? getStoredWorkspaceId()
        const matchedWorkspace =
          storedWorkspaceId &&
          fetchedWorkspaces.find(
            (workspace) => workspace.workspaceId === storedWorkspaceId
          )

        if (matchedWorkspace) {
          selectWorkspace(matchedWorkspace.workspaceId)
        } else {
          selectWorkspace(fetchedWorkspaces[0]?.workspaceId ?? null)
        }
      } catch (err) {
        console.error('Failed to load workspaces', err)
        setError('Failed to load workspaces')
        selectWorkspace(null)
      } finally {
        setIsLoading(false)
      }
    },
    [selectWorkspace]
  )

  useEffect(() => {
    refreshWorkspaces().catch((err) => {
      console.error('Initial workspace load failed', err)
    })
  }, [refreshWorkspaces])

  const createWorkspace = useCallback(
    async (name: string) => {
      setIsCreating(true)
      setError(null)

      try {
        const createdWorkspace = await createWorkspaceRequest(name)
        await refreshWorkspaces(createdWorkspace.workspaceId)
      } catch (err) {
        console.error('Failed to create workspace', err)
        setError('Failed to create workspace')
        throw err
      } finally {
        setIsCreating(false)
      }
    },
    [refreshWorkspaces]
  )

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
