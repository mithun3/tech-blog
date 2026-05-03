import type { ReactNode } from 'react'

type CalloutType = 'info' | 'warning' | 'tip' | 'danger'

const variants: Record<CalloutType, { container: string; icon: string }> = {
  info: {
    container: 'bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800 text-blue-900 dark:text-blue-100',
    icon: 'ℹ️',
  },
  warning: {
    container: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950/30 dark:border-yellow-800 text-yellow-900 dark:text-yellow-100',
    icon: '⚠️',
  },
  tip: {
    container: 'bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800 text-green-900 dark:text-green-100',
    icon: '💡',
  },
  danger: {
    container: 'bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800 text-red-900 dark:text-red-100',
    icon: '🚨',
  },
}

type CalloutProps = {
  type?: CalloutType
  children: ReactNode
}

export function Callout({ type = 'info', children }: CalloutProps) {
  const { container, icon } = variants[type]
  return (
    <div className={`my-6 flex gap-3 rounded-lg border p-4 ${container}`}>
      <span className="text-lg leading-tight flex-shrink-0" aria-hidden="true">
        {icon}
      </span>
      <div className="text-sm leading-relaxed [&>p]:m-0 [&>p:not(:last-child)]:mb-2">
        {children}
      </div>
    </div>
  )
}
