import { version } from '../../../../package.json'
import { NextResponse } from 'next/server'

export function GET() {
    return NextResponse.json({ version })
}
