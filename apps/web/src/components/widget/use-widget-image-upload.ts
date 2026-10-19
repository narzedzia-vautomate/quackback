import { useCallback } from 'react'
import { useWidgetImageUpload as useWidgetImageUploadRequest } from '@/lib/client/hooks/use-image-upload'
import { useWidgetAuth } from './widget-auth-provider'

type WidgetImageUploadOptions = Parameters<typeof useWidgetImageUploadRequest>[0]

/**
 * Widget-scoped image upload: mints/restores a Bearer session before POST
 * `/api/widget/upload`, matching vote/comment/post write paths.
 *
 * Lives next to {@link useWidgetAuth} so `lib/client` stays free of component
 * imports (hosts embed the widget; the upload hook must not pull the provider).
 */
export function useWidgetImageUpload(options: WidgetImageUploadOptions = {}) {
  const { ensureSessionThen } = useWidgetAuth()
  const { upload: uploadWithAuth } = useWidgetImageUploadRequest(options)

  const upload = useCallback(
    async (file: File): Promise<string> => {
      let publicUrl = ''
      await ensureSessionThen(async () => {
        publicUrl = await uploadWithAuth(file)
      })
      if (!publicUrl) {
        throw new Error('Upload failed: no session')
      }
      return publicUrl
    },
    [ensureSessionThen, uploadWithAuth]
  )

  return { upload }
}
