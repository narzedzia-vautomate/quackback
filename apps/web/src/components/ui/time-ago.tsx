import { useEffect, useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import type { Locale } from 'date-fns'
import {
  ar,
  de,
  enUS,
  es,
  fr,
  pl,
  ptBR,
  ru,
  zhCN,
  zhTW,
} from 'date-fns/locale'
import { useIntl } from 'react-intl'

interface TimeAgoProps {
  date: Date | string
  className?: string
}

const DATE_FNS_LOCALES: Record<string, Locale> = {
  en: enUS,
  de,
  fr,
  es,
  ar,
  ru,
  'pt-br': ptBR,
  pl,
  'zh-cn': zhCN,
  'zh-tw': zhTW,
}

function dateFnsLocaleFor(locale: string): Locale {
  const lower = locale.toLowerCase()
  return DATE_FNS_LOCALES[lower] ?? DATE_FNS_LOCALES[lower.split('-')[0]] ?? enUS
}

/** The relative-time label `<TimeAgo>` renders, for static (no-interval)
 *  consumers like CitationFreshness; '' for a missing or invalid date. */
export function getTimeAgo(
  date: Date | string | null | undefined,
  locale: string = 'en'
): string {
  if (!date) return ''
  const d = typeof date === 'string' ? new Date(date) : date
  // Check for invalid date
  if (isNaN(d.getTime())) return ''
  return formatDistanceToNow(d, { addSuffix: true, locale: dateFnsLocaleFor(locale) })
}

export function TimeAgo({ date, className }: TimeAgoProps) {
  const intl = useIntl()
  // Initialize with computed value for SSR
  const [timeAgo, setTimeAgo] = useState<string>(() => getTimeAgo(date, intl.locale))

  useEffect(() => {
    // Update immediately in case server/client time differs slightly
    setTimeAgo(getTimeAgo(date, intl.locale))

    // Update every minute
    const interval = setInterval(() => {
      setTimeAgo(getTimeAgo(date, intl.locale))
    }, 60000)

    return () => clearInterval(interval)
  }, [date, intl.locale])

  return <span className={className}>{timeAgo}</span>
}
