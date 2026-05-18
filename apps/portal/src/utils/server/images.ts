import { getIconUrl, getImageUrl } from '@/utils/images'
import { env } from '@/utils/env'

export function getServerImageUrl(id: string) {
    try {
        return getImageUrl(id, {
            baseUrl: `${env.NEXT_PUBLIC_CONTEXT_PATH ?? ''}`,
        })
    } catch (_e) {
        return undefined
    }
}

export function getServerIconUrl(id: string) {
    return getIconUrl(id, { baseUrl: `${env.NEXT_PUBLIC_CONTEXT_PATH ?? ''}` })
}
