import { FormattedDate } from 'react-intl'

/** Portal changelog date — follows active Intl locale (not hardcoded en-US). */
export function PublishedAt({
  value,
  month = 'long',
}: {
  value: string
  month?: 'long' | 'short'
}) {
  return <FormattedDate value={value} month={month} day="numeric" year="numeric" />
}
