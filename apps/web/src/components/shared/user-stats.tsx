'use client'

import type { ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import { FormattedMessage } from 'react-intl'
import { getUserStatsFn } from '@/lib/server/functions/user'
import { cn } from '@/lib/shared/utils'

function StatItem({
  value,
  label,
  compact,
}: {
  value: number | undefined
  label: ReactNode
  compact?: boolean
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center rounded-md bg-muted/40',
        compact ? 'py-1.5 px-1' : 'py-2 px-2'
      )}
    >
      <span
        className={cn('font-bold tabular-nums text-foreground', compact ? 'text-sm' : 'text-lg')}
      >
        {value ?? '-'}
      </span>
      <span className={cn('text-muted-foreground mt-0.5', compact ? 'text-xs' : 'text-xs')}>
        {label}
      </span>
    </div>
  )
}

interface UserStatsBarProps {
  compact?: boolean
  className?: string
  headers?: Record<string, string>
}

export function UserStatsBar({ compact, className, headers }: UserStatsBarProps) {
  const { data } = useQuery({
    queryKey: headers ? ['widget', 'user', 'engagement-stats'] : ['user', 'engagement-stats'],
    queryFn: () => getUserStatsFn(headers ? { headers } : undefined),
    staleTime: 60 * 1000,
  })

  return (
    <div className={cn('grid grid-cols-3 gap-1', className)}>
      <StatItem
        value={data?.ideas}
        label={<FormattedMessage id="portal.userStats.ideas" defaultMessage="Ideas" />}
        compact={compact}
      />
      <StatItem
        value={data?.votes}
        label={<FormattedMessage id="portal.userStats.votes" defaultMessage="Votes" />}
        compact={compact}
      />
      <StatItem
        value={data?.comments}
        label={<FormattedMessage id="portal.userStats.comments" defaultMessage="Comments" />}
        compact={compact}
      />
    </div>
  )
}
