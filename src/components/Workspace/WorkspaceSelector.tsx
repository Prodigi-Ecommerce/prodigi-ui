import { useState } from 'react'
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

interface WorkspaceSelectorProps {
  className?: string
}

export function WorkspaceSelector({ className }: WorkspaceSelectorProps) {
  const {
    workspaces,
    selectedWorkspaceId,
    selectWorkspace,
    createWorkspace,
    isLoading,
    isCreating,
    error,
  } = useWorkspaceContext()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [workspaceName, setWorkspaceName] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)

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
      // The context already logs and surfaces the error message
    }
  }

  const sectionTitleClass =
    'text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground'

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <div>
        <p className={sectionTitleClass}>
          Workspace
        </p>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch sm:gap-3">
        <Select
          value={selectedWorkspaceId ?? undefined}
          onValueChange={(value) => selectWorkspace(value)}
          disabled={isLoading || workspaces.length === 0}
        >
          <SelectTrigger className="w-full sm:basis-[70%] sm:flex-1">
            <SelectValue placeholder="Select a workspace" />
          </SelectTrigger>
          <SelectContent>
            {workspaces.map((workspace) => (
              <SelectItem
                key={workspace.workspaceId}
                value={workspace.workspaceId}
              >
                {workspace.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

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
            <Button variant="outline" className="w-full sm:basis-[30%]">
              New workspace
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create workspace</DialogTitle>
              <DialogDescription>
                Workspaces help you keep projects and collaborators organized.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="workspace-name">Workspace name</Label>
                <Input
                  id="workspace-name"
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
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
      {isLoading && (
        <p className="text-xs text-muted-foreground">
          Loading available workspaces…
        </p>
      )}
      {!isLoading && workspaces.length === 0 && !error && (
        <p className="text-sm text-muted-foreground">
          No workspaces yet. Create one to get started.
        </p>
      )}
    </div>
  )
}
