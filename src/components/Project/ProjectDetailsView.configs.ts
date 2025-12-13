import type { ProjectStatus } from '@/types/projectsApi'

export const statusStyles: Record<ProjectStatus, string> = {
  DRAFT: 'bg-muted text-foreground border-border',
  PENDING:
    'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-400/15 dark:text-amber-50 dark:border-amber-400/40',
  PROCESSING:
    'bg-sky-100 text-sky-900 border-sky-300 dark:bg-sky-400/15 dark:text-sky-50 dark:border-sky-400/40',
  COMPLETE:
    'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-400/15 dark:text-emerald-50 dark:border-emerald-400/40',
  FAILED:
    'bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-400/15 dark:text-rose-50 dark:border-rose-400/40',
}
