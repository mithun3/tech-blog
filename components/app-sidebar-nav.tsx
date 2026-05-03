'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import type { NavNode } from '@/lib/wiki'
import { ThemeToggle } from './theme-toggle'

type Props = {
  tree: NavNode[]
}

export function AppSidebarNav({ tree }: Props) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  // Close mobile menu on navigation
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  return (
    <>
      {/* Mobile hamburger toggle */}
      <button
        type="button"
        onClick={() => setMobileOpen((prev) => !prev)}
        className="fixed top-3 left-4 z-50 lg:hidden p-1.5 rounded-md text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
        aria-expanded={mobileOpen}
        aria-controls="app-sidebar"
      >
        <HamburgerIcon isOpen={mobileOpen} />
      </button>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        id="app-sidebar"
        className={`fixed left-0 top-0 z-40 h-screen w-64 flex flex-col bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 transition-transform duration-200 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Site header */}
        <div className="px-6 py-6 shrink-0">
          <Link href="/" className="block group">
            <span className="text-base font-bold text-zinc-900 dark:text-zinc-100 leading-tight block">
              Tech Notes
            </span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 block leading-snug">
              Software engineering &amp; building things
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav
          className="flex-1 overflow-y-auto px-3 pb-4"
          aria-label="Main navigation"
        >
          <ul className="space-y-0.5">
            <NavLink href="/" label="Home" isActive={pathname === '/'} />
            <NavLink
              href="/blog"
              label="Blog"
              isActive={pathname === '/blog' || pathname.startsWith('/blog/')}
            />
          </ul>

          {tree.length > 0 && (
            <>
              <div className="mt-5 mb-2 px-3">
                <span className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                  Notes
                </span>
              </div>
              <ul className="space-y-0.5">
                {tree.map((node) => (
                  <SidebarItem
                    key={node.href}
                    node={node}
                    pathname={pathname}
                  />
                ))}
              </ul>
            </>
          )}
        </nav>

        {/* Sidebar footer */}
        <div className="shrink-0 px-4 py-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <a
            href="/rss.xml"
            className="text-xs text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
          >
            RSS
          </a>
          <ThemeToggle />
        </div>
      </aside>
    </>
  )
}

// ─── Nav helpers ─────────────────────────────────────────────────────────────

function NavLink({
  href,
  label,
  isActive,
}: {
  href: string
  label: string
  isActive: boolean
}) {
  return (
    <li>
      <Link href={href} className={linkClass(isActive)}>
        {label}
      </Link>
    </li>
  )
}

function SidebarItem({
  node,
  pathname,
}: {
  node: NavNode
  pathname: string
}) {
  const isActive = pathname === node.href
  const isAncestor = pathname.startsWith(node.href + '/')
  const hasChildren = node.children.length > 0

  const [isOpen, setIsOpen] = useState(isActive || isAncestor)

  useEffect(() => {
    if (isActive || isAncestor) setIsOpen(true)
  }, [isActive, isAncestor])

  if (!hasChildren) {
    return (
      <li>
        <Link href={node.href} className={linkClass(isActive)}>
          {node.title}
        </Link>
      </li>
    )
  }

  return (
    <li>
      <div className="flex items-center">
        <Link href={node.href} className={linkClass(isActive, true)}>
          {node.title}
        </Link>
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="shrink-0 p-1.5 rounded text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
          aria-label={isOpen ? 'Collapse section' : 'Expand section'}
          aria-expanded={isOpen}
        >
          <ChevronIcon isOpen={isOpen} />
        </button>
      </div>

      {isOpen && (
        <ul className="mt-0.5 ml-3 pl-3 space-y-0.5 border-l border-zinc-200 dark:border-zinc-700">
          {node.children.map((child) => (
            <SidebarItem key={child.href} node={child} pathname={pathname} />
          ))}
        </ul>
      )}
    </li>
  )
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function HamburgerIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {isOpen ? (
        <>
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </>
      ) : (
        <>
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </>
      )}
    </svg>
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

// ─── Styles ───────────────────────────────────────────────────────────────────

function linkClass(isActive: boolean, hasChildren = false): string {
  const base =
    'flex-1 block px-3 py-1.5 rounded-md text-sm transition-colors'
  const active =
    'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 font-medium'
  const inactive =
    'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100'
  return [base, isActive ? active : inactive].join(' ')
}
