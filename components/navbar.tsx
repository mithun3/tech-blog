import Link from 'next/link'
import { ThemeToggle } from './theme-toggle'

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-sm">
      <nav className="mx-auto max-w-3xl px-4 flex h-14 items-center justify-between">
        <Link
          href="/"
          className="font-semibold text-base tracking-tight hover:opacity-80 transition-opacity"
        >
          Tech Blog
        </Link>
        <div className="flex items-center gap-5">
          <ThemeToggle />
        </div>
      </nav>
    </header>
  )
}
