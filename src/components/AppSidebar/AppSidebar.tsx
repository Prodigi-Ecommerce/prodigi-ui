import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar'
import {
  LayoutDashboard,
  Sparkle,
  LogOut,
  ChevronsUpDown,
  Plus,
  Loader2,
  Trash2,
} from 'lucide-react'
import { Link, useRouterState } from '@tanstack/react-router'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/AuthContext'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { Separator } from '@/components/ui/separator'
import { useWorkspaceContext } from '@/contexts/WorkspaceContext'
import { SheetClose } from '@/components/ui/sheet'

const navItems = [
  {
    title: 'Dashboard',
    description: 'Project overview',
    url: '/dashboard',
    icon: LayoutDashboard,
  },
]

export function AppSidebar() {
  const { isMobile } = useSidebar()
  const pathname = useRouterState({
    select: (routerState) => routerState.location.pathname,
  })
  const { signOut, user } = useAuth()
  const [workspaceDialogOpen, setWorkspaceDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [workspaceName, setWorkspaceName] = useState('')
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)
  const {
    workspaces,
    selectedWorkspaceId,
    selectWorkspace,
    createWorkspace,
    deleteWorkspace,
    isDeletingWorkspaceId,
    isLoading: workspacesLoading,
    isCreating: workspaceCreating,
    error: workspaceError,
  } = useWorkspaceContext()
  const userInitial = user?.email?.[0]?.toUpperCase() ?? 'P'
  const hasWorkspaces = workspaces.length > 0
  const accountPopoverSide: 'top' | 'right' = 'top'
  const workspacePlaceholder = (() => {
    if (workspacesLoading) return 'Loading workspaces…'
    if (workspaceError) return 'Workspace error'
    if (!hasWorkspaces) return 'No workspaces'
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
      setWorkspaceDialogOpen(false)
    } catch {
      // surfaced via context
    }
  }

  const selectedWorkspace = workspaces.find(
    (workspace) => workspace.workspaceId === selectedWorkspaceId
  )
  const isDeletingSelected = isDeletingWorkspaceId === selectedWorkspaceId

  const handleDeleteWorkspace = async () => {
    if (!selectedWorkspace) {
      return
    }
    setDeleteError(null)
    try {
      await deleteWorkspace(selectedWorkspace.workspaceId)
      setDeleteDialogOpen(false)
    } catch {
      setDeleteError('Failed to delete workspace. Please try again.')
    }
  }

  return (
    <Sidebar
      variant="floating"
      className="bg-transparent border-0 shadow-none"
    >
      <SidebarHeader className="px-2 pb-3 relative">
        <div
          className={cn(
            'flex items-center h-12 w-full',
            'justify-between'
          )}
        >
          <SidebarGroupLabel className="flex items-center gap-3 text-sm font-semibold !h-12 px-0">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <Sparkle className="h-4 w-4" />
            </span>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold">Prodigi</span>
              <span className="text-[11px] text-muted-foreground">AI studio</span>
            </div>
          </SidebarGroupLabel>
        </div>
      </SidebarHeader>

      <SidebarContent className="pb-3 flex h-full flex-col">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive =
                  pathname === item.url || pathname.startsWith(`${item.url}/`)
                const Icon = item.icon

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      size='lg'
                      isActive={isActive}
                      className="transition-all data-[active=true]:bg-primary/15 data-[active=true]:text-primary h-12 w-full hover:translate-x-[1px] justify-start"
                    >
                      {isMobile ? (
                        <SheetClose asChild>
                          <Link
                            to={item.url}
                            aria-current={isActive ? 'page' : undefined}
                            className="flex w-full items-center gap-3"
                          >
                            <Icon className="h-4 w-4 flex-shrink-0" />
                            <div className="flex flex-col text-left leading-tight">
                              <span className="text-sm font-medium">
                                {item.title}
                              </span>
                              {item.description && (
                                <span className="text-xs text-muted-foreground">
                                  {item.description}
                                </span>
                              )}
                            </div>
                          </Link>
                        </SheetClose>
                      ) : (
                        <Link
                          to={item.url}
                          aria-current={isActive ? 'page' : undefined}
                          className="flex w-full items-center gap-3"
                        >
                          <Icon className="h-4 w-4 flex-shrink-0" />
                          <div className="flex flex-col text-left leading-tight">
                            <span className="text-sm font-medium">
                              {item.title}
                            </span>
                            {item.description && (
                              <span className="text-xs text-muted-foreground">
                                {item.description}
                              </span>
                            )}
                          </div>
                        </Link>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="px-2 pb-2 mt-auto">
          <div className="flex items-center justify-between">
            <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wide px-0">
              Workspaces
            </SidebarGroupLabel>
            <div className="flex items-center gap-1.5">
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-destructive hover:text-destructive"
                aria-label="Delete workspace"
                disabled={
                  !selectedWorkspaceId || isDeletingSelected || workspacesLoading
                }
                onClick={() => setDeleteDialogOpen(true)}
              >
                {isDeletingSelected ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5" />
                )}
              </Button>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                aria-label="Add workspace"
                onClick={() => setWorkspaceDialogOpen(true)}
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
          <SidebarGroupContent className="mt-3 rounded-lg border border-border/70 bg-card/70 p-3 space-y-2">
            <Select
              value={selectedWorkspaceId ?? undefined}
              onValueChange={(value) => selectWorkspace(value)}
              disabled={workspacesLoading || !hasWorkspaces}
            >
              <SelectTrigger className="h-10 w-full">
                <SelectValue placeholder={workspacePlaceholder} />
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
            {workspacesLoading && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Syncing workspaces…</span>
              </div>
            )}
            {workspaceError && (
              <p className="text-xs text-destructive">{workspaceError}</p>
            )}
            {!workspacesLoading && !workspaceError && (
              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                <span>
                  Active:{' '}
                  <span className="text-foreground font-medium">
                    {selectedWorkspace?.name ?? 'None'}
                  </span>
                </span>
                <span className="text-primary/80">
                  {workspaces.length} total
                </span>
              </div>
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {user && (
        <SidebarFooter className="px-2 pb-3 pt-3 border-t border-border/60">
          <SidebarMenu className="w-full">
            <SidebarMenuItem>
              <Popover>
                <PopoverTrigger asChild>
                  <SidebarMenuButton
                    className="h-12 w-full justify-between data-[active=true]:bg-primary/15 data-[active=true]:text-primary"
                    size='lg'
                  >
                    <span className="flex items-center gap-3 overflow-hidden">
                      <Avatar className="h-10 w-10 rounded-md bg-primary/15 text-primary shrink-0">
                        <AvatarFallback className="rounded-md bg-primary/15 text-base font-semibold text-primary">
                          {userInitial}
                        </AvatarFallback>
                      </Avatar>
                      <span className="flex flex-col text-left leading-tight">
                        <span className="text-sm font-medium text-foreground">
                          {user.email}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Account
                        </span>
                      </span>
                    </span>
                    <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
                  </SidebarMenuButton>
                </PopoverTrigger>
                <PopoverContent
                  side={accountPopoverSide}
                  align="start"
                  className="w-64 p-0"
                >
                  <div className="p-4 pb-3 flex items-center gap-3">
                    <Avatar className="h-10 w-10 min-w-[2.5rem] rounded-md bg-primary/15 text-primary aspect-square shrink-0">
                      <AvatarFallback className="rounded-md bg-primary/15 text-base font-semibold text-primary">
                        {userInitial}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-foreground">
                        {user.email}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Signed in
                      </span>
                    </div>
                  </div>
                  <div className="border-t border-border/60 p-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      onClick={() => signOut()}
                    >
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      )}

      <Dialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open)
          if (!open) {
            setDeleteError(null)
          }
        }}
      >
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
          {(deleteError || workspaceError) && (
            <p className="text-sm text-destructive">
              {deleteError ?? workspaceError}
            </p>
          )}
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
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
        open={workspaceDialogOpen}
        onOpenChange={(open) => {
          setWorkspaceDialogOpen(open)
          if (!open) {
            setWorkspaceName('')
            setValidationError(null)
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create workspace</DialogTitle>
            <DialogDescription>
              Workspaces help you group related projects and collaborators.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sidebar-workspace-name">Workspace name</Label>
              <Input
                id="sidebar-workspace-name"
                placeholder="Spring launch campaign"
                value={workspaceName}
                onChange={(event) => {
                  setWorkspaceName(event.target.value)
                  setValidationError(null)
                }}
                disabled={workspaceCreating}
              />
              {(validationError || workspaceError) && (
                <p className="text-sm text-destructive">
                  {validationError ?? workspaceError}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              onClick={handleCreateWorkspace}
              disabled={workspaceCreating}
            >
              {workspaceCreating ? 'Creating…' : 'Create workspace'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Sidebar>
  )
}
