import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { useIntl } from 'react-intl'
import { postAuthSuccess, postAuthError } from '@/lib/client/hooks/use-auth-broadcast'
import { formatAuthBlockMessage } from '@/lib/shared/auth-block-messages'
import { PortalIntlProvider } from '@/components/portal-intl-provider'
import { loadPortalIntl } from '@/lib/server/functions/locale'
import { ArrowPathIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid'

/**
 * Auth Complete Page
 *
 * Popup landing for OAuth sign-ins. On success it broadcasts to the
 * original window via BroadcastChannel and closes itself.
 *
 * It is also the popup's `errorCallbackURL`: a failed OAuth callback
 * lands here with `?error=<code>`. That error is broadcast to the
 * opener (whose dialog is still mounted and can react — e.g. offer the
 * link-conflict recovery for `account_not_linked`) and shown here so
 * the failure is never a silent "Signed in successfully!" + close.
 */
export const Route = createFileRoute('/auth/auth-complete')({
  validateSearch: (search: Record<string, unknown>): { error?: string } => ({
    error: typeof search.error === 'string' ? search.error : undefined,
  }),
  loader: async () => await loadPortalIntl(),
  component: AuthCompletePage,
})

function AuthCompletePage() {
  const { locale, messages } = Route.useLoaderData()

  return (
    <PortalIntlProvider locale={locale} messages={messages}>
      <AuthCompleteContent />
    </PortalIntlProvider>
  )
}

function AuthCompleteContent() {
  const { error } = Route.useSearch()
  const intl = useIntl()
  const [status, setStatus] = useState<'broadcasting' | 'success' | 'error'>('broadcasting')

  useEffect(() => {
    if (error) {
      postAuthError(error)
      setStatus('error')
      // account_not_linked recovery continues in the opener's dialog —
      // get this window out of the way quickly. Other errors keep the
      // window up long enough to read the message.
      const timeout = setTimeout(
        () => {
          window.close()
        },
        error === 'account_not_linked' ? 1500 : 6000
      )
      return () => clearTimeout(timeout)
    }

    // Post success message to other windows
    postAuthSuccess()
    setStatus('success')

    // Close the window after a brief delay
    const timeout = setTimeout(() => {
      window.close()
    }, 1000)

    return () => clearTimeout(timeout)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4 p-8 max-w-md">
        {status === 'broadcasting' && (
          <>
            <ArrowPathIcon className="h-12 w-12 animate-spin text-primary mx-auto" />
            <p className="text-muted-foreground">
              {intl.formatMessage({
                id: 'portal.auth.complete.broadcasting',
                defaultMessage: 'Completing sign in...',
              })}
            </p>
          </>
        )}
        {status === 'success' && (
          <>
            <CheckCircleIcon className="h-12 w-12 text-green-500 mx-auto" />
            <p className="text-foreground font-medium">
              {intl.formatMessage({
                id: 'portal.auth.complete.success',
                defaultMessage: 'Signed in successfully!',
              })}
            </p>
            <p className="text-sm text-muted-foreground">
              {intl.formatMessage({
                id: 'portal.auth.complete.windowWillClose',
                defaultMessage: 'This window will close automatically.',
              })}
            </p>
          </>
        )}
        {status === 'error' && (
          <>
            <ExclamationTriangleIcon className="h-12 w-12 text-amber-500 mx-auto" />
            <p className="text-foreground font-medium">
              {intl.formatMessage({
                id: 'portal.auth.complete.errorTitle',
                defaultMessage: "Sign-in didn't complete",
              })}
            </p>
            <p className="text-sm text-muted-foreground">
              {formatAuthBlockMessage(intl.formatMessage, error, {
                id: 'portal.auth.complete.errorFallback',
                defaultMessage: 'Sign-in failed. Return to the original window and try again.',
              })}
            </p>
            <p className="text-sm text-muted-foreground">
              {intl.formatMessage({
                id: 'portal.auth.complete.windowWillClose',
                defaultMessage: 'This window will close automatically.',
              })}
            </p>
          </>
        )}
      </div>
    </div>
  )
}
