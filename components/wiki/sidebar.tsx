import Link from 'next/link'
import { buildNavTree } from '@/lib/wiki'
import { SidebarNav } from './sidebar-nav'

export function WikiSidebar() {
  const tree = buildNavTree()

  return (
    <aside className="w-60 shrink-0 sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto py-8 px-4 border-r border-zinc-200 dark:border-zinc-800 hidden lg:block">
      <div className="mb-4">
        <Link
          href="/pages"
          className="text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
        >
          Wiki
        </Link>
      </div>
      <SidebarNav tree={tree} />
    </aside>
  )
}
