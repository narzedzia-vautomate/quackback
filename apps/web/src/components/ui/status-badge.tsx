import type { ReactElement } from 'react'
import { useIntl } from 'react-intl'

import { localizedStatusName } from '@/lib/shared/localize-status'
import { cn } from '@/lib/shared/utils'

interface StatusBadgeProps {
  name: string
  /** When set (or when `name` matches a seeded English default), label is localized. */
  slug?: string | null
  color?: string | null
  className?: string
}

/**
 * Status indicator displaying a colored dot with text.
 * Falls back to muted styling when no color is provided.
 */
export function StatusBadge({ name, slug, color, className }: StatusBadgeProps): ReactElement {
  const intl = useIntl()
  const label = localizedStatusName(intl, { slug, name })
  const dotStyles = color ? { backgroundColor: color } : undefined

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 text-xs font-medium text-foreground',
        !color && 'text-muted-foreground',
        className
      )}
    >
      <span
        className={cn('size-1.5 shrink-0 rounded-full', !color && 'bg-muted-foreground')}
        style={dotStyles}
        aria-hidden="true"
      />
      {label}
    </span>
  )
}
