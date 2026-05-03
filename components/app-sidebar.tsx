import { buildNavTree } from '@/lib/wiki'
import { AppSidebarNav } from './app-sidebar-nav'

/**
 * Server component — reads the wiki nav tree from the filesystem
 * and passes it down to the interactive client sidebar.
 */
export function AppSidebar() {
  const tree = buildNavTree()
  return <AppSidebarNav tree={tree} />
}
