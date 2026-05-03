'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import type { NavNode } from '@/lib/wiki'

type Props = {
  tree: NavNode[]
}

export function SidebarNav({ tree }: Props) {
  const pathname = usePathname()

  return (
    <nav aria-label="Wiki navigation">
      <ul className="space-y-0.5">
        <li>
          <Link
            href="/pages"
            className={navLinkClass(pathname === '/pages')}
          >
            Overview
          </Link>
        </li>
        {tree.map((node) => (
          <NavItem key={node.href} node={node} pathname={pathname} depth={0} />
        ))}
      </ul>
    </nav>
  )
}

function NavItem({
  node,
  pathname,
  depth,
}: {
  node: NavNode
  pathname: string
  depth: number
}) {
  const isActive = pathname === node.href
  const isAncestor = pathname.startsWith(node.href + '/')
  const hasChildren = node.children.length > 0

  const [isOpen, setIsOpen] = useState(isActive || isAncestor)

  // Keep section open when navigating into a child
  useEffect(() => {
    if (isActive || isAncestor) setIsOpen(true)
  }, [isActive, isAncestor])

  if (!hasChildren) {
    return (
      <li>
        <Link href={node.href} className={navLinkClass(isActive, depth)}>
          {node.title}
        </Link>
      </li>
    )
  }

  return (
    <li>
      <div className="flex items-center">
        <Link
          href={node.href}
          className={navLinkClass(isActive, depth, true)}
        >
          {node.title}
        </Link>
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="ml-auto shrink-0 p-1 rounded text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
          aria-label={isOpen ? 'Collapse section' : 'Expand section'}
          aria-expanded={isOpen}
        >
          <ChevronIcon isOpen={isOpen} />
        </button>
      </div>

      {isOpen && (
        <ul className="mt-0.5 ml-3 space-y-0.5 border-l border-zinc-200 dark:border-zinc-700 pl-3">
          {node.children.map((child) => (
            <NavItem
              key={child.href}
              node={child}
              pathname={pathname}
              depth={depth + 1}
            />
          ))}
        </ul>
      )}
    </li>
  )
}

function ChevronIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`transition-transform duration-150 ${isOpen ? 'rotate-90' : ''}`}
      aria-hidden="true"
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
}

function navLinkClass(
  isActive: boolean,
  depth = 0,
  hasChildren = false,
): string {
  const base =
    'flex-1 block rounded px-2.5 py-1.5 text-sm transition-colors'
  const indent = depth > 0 ? '' : ''
  const active =
    'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-medium'
  const inactive =
    'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-100'

  return [base, indent, isActive ? active : inactive].join(' ')
}
