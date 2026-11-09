import { NextRequest } from 'next/server'
import { dhis2HttpClient } from '@/utils/api/dhis2'
import { isUid } from '@/utils/api/proxyGuard'

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    if (!isUid(id)) {
        return new Response(null, { status: 404 })
    }
    return await dhis2HttpClient.getIcon(`icons/${id}/icon`)
}
