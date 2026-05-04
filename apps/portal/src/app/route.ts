import { getAppConfigWithNamespace } from '@/utils/config'
import { AppMenuConfig } from '@packages/shared/schemas'
import { DatastoreNamespaces } from '@packages/shared/constants'
import { sortBy } from 'lodash-es'
import { redirect } from 'next/navigation'
import { env } from '@/utils/env'
import { dhis2HttpClient } from '@/utils/api/dhis2'

export async function GET() {
    const clientVerificationStatus = await dhis2HttpClient.verifyClient()

    if (clientVerificationStatus.status === 'ERROR') {
        return redirect(
            `${env.NEXT_PUBLIC_CONTEXT_PATH ?? ''}/connection-error`
        )
    }

    const menuConfig = await getAppConfigWithNamespace<AppMenuConfig>({
        namespace: DatastoreNamespaces.MAIN_CONFIG,
        key: 'menu',
    })

    if (!menuConfig) {
        return redirect(`${env.NEXT_PUBLIC_CONTEXT_PATH ?? ''}/no-config`)
    }

    const firstMenu = sortBy(menuConfig?.items, 'sortOrder')[0]

    if (firstMenu.type === 'module') {
        return redirect(
            `${env.NEXT_PUBLIC_CONTEXT_PATH ?? ''}/modules/${firstMenu.path}`
        )
    }
    const url = `${env.NEXT_PUBLIC_CONTEXT_PATH ?? ''}/modules/${firstMenu.path}/${firstMenu.items[0].path}`
    return redirect(url)
}
