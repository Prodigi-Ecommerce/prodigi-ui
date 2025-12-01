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
} from '@/components/ui/sidebar'
import {
  LayoutDashboard,
  Grid2x2,
  Sparkles,
  Wand2,
  Sparkle,
  LogOut,
  ChevronsUpDown,
} from 'lucide-react'
import { Link, useRouterState } from '@tanstack/react-router'
import { useCallback } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

const navItems = [
  {
    title: 'Dashboard',
    description: 'Project overview',
    url: '/dashboard',
    icon: LayoutDashboard,
    collapsedIcon: Grid2x2,
  },
  {
    title: 'Generate',
    description: 'Create new visuals',
    url: '/generate',
    icon: Sparkles,
    collapsedIcon: Wand2,
  },
]

export function AppSidebar() {
  const { toggleSidebar, state, isMobile } = useSidebar()
  const pathname = useRouterState({
    select: (routerState) => routerState.location.pathname,
  })
  const { signOut, user } = useAuth()
  const userInitial = user?.email?.[0]?.toUpperCase() ?? 'P'
  const isCollapsed = state === 'collapsed'
  const accountPopoverSide = isCollapsed ? 'right' : 'top'

  const handleNavigate = useCallback(() => {
    if (isMobile) {
      toggleSidebar()
    }
  }, [isMobile, toggleSidebar])

  return (
    <Sidebar collapsible="icon">
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
          <SidebarTrigger className="hover:bg-accent rounded-md p-2 h-12 w-12" />
        </div>
      </SidebarHeader>

      <SidebarContent className="py-2 flex h-full flex-col">
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
                      isActive={isActive}
                      tooltip={state === 'collapsed' ? item.title : undefined}
                      className="transition-colors data-[active=true]:bg-primary/15 data-[active=true]:text-primary h-12 w-full"
                    >
                      <Link
                        to={item.url}
                        onClick={handleNavigate}
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
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
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
                  >
                    <span
                      className={cn(
                        'flex items-center gap-3 overflow-hidden',
                        isCollapsed && 'w-full justify-center gap-0'
                      )}
                    >
                      <Avatar
                        className={cn(
                          'h-10 w-10 min-w-[2.5rem] rounded-md bg-primary/15 text-primary aspect-square shrink-0',
                          isCollapsed &&
                            'h-10 w-10 min-w-[2.5rem] rounded-md bg-primary/15'
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
    </Sidebar>
  )
}
