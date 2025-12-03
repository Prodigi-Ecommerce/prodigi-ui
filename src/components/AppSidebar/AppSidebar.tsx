import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
  SidebarTrigger,
  SidebarHeader,
  SidebarFooter,
  SidebarGroupAction,
} from '@/components/ui/sidebar'
import {
  LayoutDashboard,
  Grid2x2,
  Sparkle,
  LogOut,
  ChevronsUpDown,
  Plus,
  Loader2,
} from 'lucide-react'
import { Link, useRouterState } from '@tanstack/react-router'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
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
import { useWorkspaceContext } from '@/contexts/WorkspaceContext'
import { SheetClose } from '@/components/ui/sheet'

const navItems = [
  {
    title: 'Dashboard',
    description: 'Project overview',
    url: '/dashboard',
    icon: LayoutDashboard,
    collapsedIcon: Grid2x2,
  },
]

export function AppSidebar() {
  const { state, isMobile } = useSidebar()
  const pathname = useRouterState({
    select: (routerState) => routerState.location.pathname,
  })
  const { signOut, user } = useAuth()
  const [workspaceDialogOpen, setWorkspaceDialogOpen] = useState(false)
  const [workspaceName, setWorkspaceName] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)
  const {
    workspaces,
    selectedWorkspaceId,
    selectWorkspace,
    createWorkspace,
    isLoading: workspacesLoading,
    isCreating: workspaceCreating,
    error: workspaceError,
  } = useWorkspaceContext()
  const userInitial = user?.email?.[0]?.toUpperCase() ?? 'P'
  const isCollapsed = state === 'collapsed'
  const accountPopoverSide = isCollapsed ? 'right' : 'top'
  const hasWorkspaces = workspaces.length > 0
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

  return (
    <Sidebar collapsible="icon" variant="floating">
      <SidebarHeader className="px-2 pb-3">
        <div
          className={cn(
            'flex items-center h-12 w-full',
            isCollapsed ? 'justify-center' : 'justify-between'
          )}
        >
          {!isCollapsed && (
            <SidebarGroupLabel className="flex items-center gap-3 text-sm font-semibold !h-12 px-0">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
                <Sparkle className="h-4 w-4" />
              </span>
              <span className="text-sm font-semibold">Prodigi</span>
            </SidebarGroupLabel>
          )}
          <SidebarTrigger className="hover:bg-accent rounded-md p-2 h-8 w-8" />
        </div>
      </SidebarHeader>

      <SidebarContent className="pb-3 flex h-full flex-col">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive =
                  pathname === item.url || pathname.startsWith(`${item.url}/`)
                const Icon =
                  state === 'collapsed' && item.collapsedIcon
                    ? item.collapsedIcon
                    : item.icon

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      size='lg'
                      isActive={isActive}
                      tooltip={state === 'collapsed' ? item.title : undefined}
                      className="transition-colors data-[active=true]:bg-primary/15 data-[active=true]:text-primary h-12 w-full"
                    >
                      {isMobile ? (
                        <SheetClose asChild>
                          <Link
                            to={item.url}
                            aria-current={isActive ? 'page' : undefined}
                            className={cn(
                              'flex w-full items-center gap-3',
                              isCollapsed && 'justify-center gap-0'
                            )}
                          >
                            <Icon className="h-4 w-4 flex-shrink-0" />
                            {!isCollapsed && (
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
                            )}
                          </Link>
                        </SheetClose>
                      ) : (
                        <Link
                          to={item.url}
                          aria-current={isActive ? 'page' : undefined}
                          className={cn(
                            'flex w-full items-center gap-3',
                            isCollapsed && 'justify-center gap-0'
                          )}
                        >
                          <Icon className="h-4 w-4 flex-shrink-0" />
                          {!isCollapsed && (
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
                          )}
                        </Link>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {!isCollapsed && (
          <SidebarGroup className="px-2 pb-2 mt-auto">
            <div className="flex items-center justify-between">
              <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wide px-0">
                Workspace
              </SidebarGroupLabel>
              <SidebarGroupAction
                aria-label="Add workspace"
                onClick={() => setWorkspaceDialogOpen(true)}
              >
                <Plus className="h-3.5 w-3.5" />
              </SidebarGroupAction>
            </div>
            <SidebarGroupContent className="mt-3">
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
                <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Syncing workspaces…</span>
                </div>
              )}
              {workspaceError && (
                <p className="mt-2 text-xs text-destructive">{workspaceError}</p>
              )}
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      {user && (
        <SidebarFooter className="px-2 pb-2 pt-0">
          <SidebarMenu className={cn('w-full', isCollapsed && 'px-0')}>
            <SidebarMenuItem>
              <Popover>
                <PopoverTrigger asChild>
                  <SidebarMenuButton
                    className="h-12 w-full justify-between data-[active=true]:bg-primary/15 data-[active=true]:text-primary"
                    tooltip={isCollapsed ? 'Account' : undefined}
                    size='lg'
                  >
                    <span
                      className={cn(
                        'flex items-center gap-3 overflow-hidden',
                        isCollapsed && 'w-full justify-center gap-0'
                      )}
                    >
                      <Avatar
                        className={cn(
                          'h-10 w-10 rounded-md bg-primary/15 text-primary shrink-0'
                        )}
                      >
                        <AvatarFallback className="rounded-md bg-primary/15 text-base font-semibold text-primary">
                          {userInitial}
                        </AvatarFallback>
                      </Avatar>
                      {!isCollapsed && (
                        <span className="flex flex-col text-left leading-tight">
                          <span className="text-sm font-medium text-foreground">
                            {user.email}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Account
                          </span>
                        </span>
                      )}
                    </span>
                    {!isCollapsed && (
                      <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
                    )}
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
