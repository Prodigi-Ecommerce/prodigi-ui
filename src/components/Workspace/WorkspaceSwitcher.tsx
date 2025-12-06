import { useState } from 'react'
import { Loader2, Plus, RotateCw, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useWorkspaceContext } from '@/contexts/WorkspaceContext'
import { cn } from '@/lib/utils'

interface WorkspaceSwitcherProps {
  className?: string
}

export const WorkspaceSwitcher = ({ className }: WorkspaceSwitcherProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [workspaceName, setWorkspaceName] = useState('')
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)
  const {
    workspaces,
    selectedWorkspaceId,
    selectWorkspace,
    createWorkspace,
    refreshWorkspaces,
    deleteWorkspace,
    isLoading,
    isCreating,
    isDeletingWorkspaceId,
    error,
  } = useWorkspaceContext()

  const hasWorkspaces = workspaces.length > 0
  const selectedWorkspace = workspaces.find(
    (workspace) => workspace.workspaceId === selectedWorkspaceId
  )
  const isDeletingSelected = isDeletingWorkspaceId === selectedWorkspaceId
  const placeholder = (() => {
    if (isLoading) {
      return 'Loading workspaces…'
    }
    if (error) {
      return 'Workspace error'
    }
    if (!hasWorkspaces) {
      return 'No workspaces'
    }
    return 'Select workspace'
  })()

  const handleCreateWorkspace = async () => {
    const trimmedName = workspaceName.trim()
    if (!trimmedName) {
      setValidationError('Workspace name is required')
      return
    }

    try {
      await createWorkspace(trimmedName)
      setWorkspaceName('')
      setValidationError(null)
      setIsDialogOpen(false)
    } catch {
      // errors surface via context
    }
  }

  const handleRefresh = async () => {
    await refreshWorkspaces(selectedWorkspaceId ?? undefined)
  }

  const handleDeleteWorkspace = async () => {
    if (!selectedWorkspace) {
      return
    }

    setDeleteError(null)
    try {
      await deleteWorkspace(selectedWorkspace.workspaceId)
      setIsDeleteDialogOpen(false)
    } catch {
      setDeleteError('Could not delete workspace. Please try again.')
    }
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="hidden text-xs font-medium text-muted-foreground sm:block">
        Workspace
      </div>
      <Select
        value={selectedWorkspaceId ?? undefined}
        onValueChange={(value) => selectWorkspace(value)}
        disabled={isLoading || !hasWorkspaces}
      >
        <SelectTrigger className="w-[200px] sm:w-[240px] bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/70">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {workspaces.map((workspace) => (
            <SelectItem key={workspace.workspaceId} value={workspace.workspaceId}>
              {workspace.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="shrink-0 text-muted-foreground hover:text-foreground"
        onClick={handleRefresh}
        disabled={isLoading}
        title="Refresh workspaces"
      >
        <RotateCw className="h-4 w-4" />
      </Button>
      <Dialog
        open={isDeleteDialogOpen}
        onOpenChange={(open) => {
          setIsDeleteDialogOpen(open)
          if (!open) {
            setDeleteError(null)
          }
        }}
      >
        <DialogTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0 text-muted-foreground hover:text-destructive"
            disabled={
              !selectedWorkspace || isLoading || Boolean(isDeletingWorkspaceId)
            }
            title={
              selectedWorkspace ? 'Delete workspace' : 'No workspace selected'
            }
          >
            {isDeletingSelected ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete workspace</DialogTitle>
            <DialogDescription>
              This will permanently remove{' '}
              <span className="font-medium text-foreground">
                {selectedWorkspace?.name ?? 'this workspace'}
              </span>{' '}
              and all of its projects.
            </DialogDescription>
          </DialogHeader>
          {(deleteError || error) && (
            <p className="text-sm text-destructive">
              {deleteError ?? error}
            </p>
          )}
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeletingSelected}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteWorkspace}
              disabled={!selectedWorkspace || isDeletingSelected}
            >
              {isDeletingSelected ? 'Deleting…' : 'Delete workspace'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) {
            setWorkspaceName('')
            setValidationError(null)
          }
        }}
      >
        <DialogTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="shrink-0"
            disabled={isCreating}
            title="Create workspace"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create workspace</DialogTitle>
            <DialogDescription>
              Workspaces help you group related projects and collaborators.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="header-workspace-name">Workspace name</Label>
              <Input
                id="header-workspace-name"
                placeholder="Spring launch campaign"
                value={workspaceName}
                onChange={(event) => {
                  setWorkspaceName(event.target.value)
                  setValidationError(null)
                }}
                disabled={isCreating}
              />
              {(validationError || error) && (
                <p className="text-sm text-destructive">
                  {validationError ?? error}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              onClick={handleCreateWorkspace}
              disabled={isCreating}
            >
              {isCreating ? 'Creating…' : 'Create workspace'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {isLoading && (
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      )}
    </div>
  )
}
