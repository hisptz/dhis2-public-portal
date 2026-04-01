import i18n from '@dhis2/d2-i18n'
import { fromPairs } from 'lodash'

export type ScreenSizeId = 'sm' | 'md' | 'lg'

export interface ScreenSize {
    name: string
    value: number
    cols: number
    id: ScreenSizeId
}
export const SUPPORTED_SCREEN_SIZES: ScreenSize[] = [
    { name: i18n.t('Small screens'), value: 996, cols: 6, id: 'sm' },
    { name: i18n.t('Medium screen'), value: 1200, cols: 10, id: 'md' },
    { name: i18n.t('Large screen'), value: 1500, cols: 12, id: 'lg' },
] as const

export function getDefaultLayoutConfig() {
    return fromPairs(SUPPORTED_SCREEN_SIZES.map((screen) => [screen.id, []]))
}
