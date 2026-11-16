import { NextRequest, NextResponse } from 'next/server'
import { dhis2HttpClient } from '@/utils/api/dhis2'
import { resolveProxyTarget } from '@/utils/api/proxyGuard'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    const { path } = await params
    const target = resolveProxyTarget(path, request.nextUrl.searchParams)

    if (!target) {
        return NextResponse.json({ message: 'Not found' }, { status: 404 })
    }

    try {
        const response = await dhis2HttpClient.get(target)
        return NextResponse.json(response)
    } catch {
        // Do not forward DHIS2 error details to the client
        return NextResponse.json({ message: 'Request failed' }, { status: 502 })
    }
}
