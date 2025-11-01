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
} from '@/components/ui/sidebar'
import {
  LayoutDashboard,
  Grid2x2,
  Sparkles,
  Wand2,
  Sparkle,
} from 'lucide-react'
import { Link, useRouterState } from '@tanstack/react-router'
import { useCallback } from 'react'
import { cn } from '@/lib/utils'

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
  const pathname = useRouterState({ select: (routerState) => routerState.location.pathname })

  const handleNavigate = useCallback(() => {
    if (isMobile) {
      toggleSidebar()
    }
  }, [isMobile, toggleSidebar])

  return (
    <Sidebar>
      <SidebarContent className="py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center gap-3 px-2 text-sm font-semibold mb-6">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <Sparkle className="h-4 w-4" />
            </span>
            {state === 'expanded' && (
              <div className="flex flex-col leading-tight">
                <span className="text-sm font-semibold">Prodigi</span>
              </div>
            )}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive =
                  pathname === item.url || pathname.startsWith(`${item.url}/`)
                const Icon = state === 'collapsed' && item.collapsedIcon ? item.collapsedIcon : item.icon

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={state === 'collapsed' ? item.title : undefined}
                      className="transition-colors data-[active=true]:bg-primary/15 data-[active=true]:text-primary h-12"
                    >
                      <Link
                        to={item.url}
                        onClick={handleNavigate}
                        aria-current={isActive ? 'page' : undefined}
                        className="flex w-full items-center gap-"
                      >
                        <Icon className="h-4 w-4 flex-shrink-0" />
                        <div
                          className={cn(
                            'flex flex-col text-left leading-tight',
                            state === 'collapsed' && 'sr-only'
                          )}
                        >
                          <span className="text-sm font-medium">{item.title}</span>
                          {item.description && (
                            <span className="text-xs text-muted-foreground">
                              {item.description}
                            </span>
                          )}
                        </div>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
