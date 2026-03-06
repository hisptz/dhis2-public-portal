declare module '*.css'
declare module 'react-pdf-thumbnail'
declare module 'leaflet-easyprint' {} // side-effect import
declare module '*.svg' {
    import { FC, SVGProps } from 'react'
    const content: FC<SVGProps<SVGElement>>
    export default content
}

declare module '*.svg?url' {
    const content: string
    export default content
}

declare module '@dhis2/multi-calendar-dates' {
    export interface FixedPeriod {
        id: string
        displayName: string
        startDate: string
        endDate: string
    }
    export function generateFixedPeriods(options: {
        year: number
        calendar: string
        periodType?: string
    }): FixedPeriod[]
    export function createFixedPeriodFromPeriodId(options: {
        periodId: string
        calendar: string
    }): FixedPeriod | null
}

import type { Map } from 'leaflet'

interface EasyPrintPlugin {
    printMap(size: string, filename: string): void
    _map: Map
}

interface EasyPrintOptions {
    sizeModes?: string[]
    hidden?: boolean
    exportOnly?: boolean
    spinnerBgColor?: string
    customSpinnerClass?: string
    customWindowTitle?: string
    hideClasses?: string[]
}

declare module 'leaflet' {
    function easyPrint(
        options: EasyPrintOptions
    ): EasyPrintPlugin & { addTo(map: Map): EasyPrintPlugin }
}
