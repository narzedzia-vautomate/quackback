import type { IntlShape } from 'react-intl'

/** Seeded default post-status slugs (packages/db DEFAULT_STATUSES). */
const DEFAULT_STATUS_SLUGS = new Set([
  'open',
  'under_review',
  'planned',
  'in_progress',
  'complete',
  'closed',
])

/** English seed names → slug, for call sites that only pass `name`. */
const DEFAULT_STATUS_NAME_TO_SLUG: Record<string, string> = {
  Open: 'open',
  'Under Review': 'under_review',
  Planned: 'planned',
  'In Progress': 'in_progress',
  Complete: 'complete',
  Closed: 'closed',
}

/**
 * Localize a seeded default post status; custom statuses keep their DB name.
 */
export function localizedStatusName(
  intl: IntlShape,
  status: { slug?: string | null; name: string }
): string {
  const slug =
    (status.slug && DEFAULT_STATUS_SLUGS.has(status.slug) ? status.slug : null) ??
    DEFAULT_STATUS_NAME_TO_SLUG[status.name] ??
    null

  if (!slug) return status.name

  return intl.formatMessage({
    id: `portal.postStatus.${slug}`,
    defaultMessage: status.name,
  })
}
