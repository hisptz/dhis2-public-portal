import i18n from '@dhis2/d2-i18n'
import { useCallback, useMemo } from 'react'
import { useFieldArray, useFormContext } from 'react-hook-form'
import {
    DisplayItem,
    DisplayItemType,
    SectionModuleConfig,
    VisualizationItem,
    VisualizationModule,
} from '@packages/shared/schemas'
import { isEmpty, last, mapValues } from 'lodash-es'
import { useAlert } from '@dhis2/app-runtime'
import {
    getDefaultLayoutConfig,
    SUPPORTED_SCREEN_SIZES,
} from '@packages/shared/constants'

export function useManageSectionVisualizations({
    prefix,
}: {
    prefix: `config.sections.${number}`
}) {
    const { show } = useAlert(
        ({ message }) => message,
        ({ type }) => ({ ...type, duration: 3000 })
    )
    const { getValues, setValue } = useFormContext<
        SectionModuleConfig,
        `config.sections.${number}`
    >()

    const { append, remove } = useFieldArray<
        SectionModuleConfig,
        `config.sections.${number}.items`,
        'fieldId'
    >({
        name: `${prefix}.items`,
        keyName: 'fieldId',
    })

    const addVisualizationToLayout = useCallback(
        (displayItem: DisplayItem) => {
            const layout = !isEmpty(getValues(`${prefix}.layouts`))
                ? getValues(`${prefix}.layouts`)
                : getDefaultLayoutConfig()
            const updatedLayout = mapValues(layout, (value, key) => {
                const layoutMaxCols =
                    SUPPORTED_SCREEN_SIZES.find(({ id }) => id === key)?.cols ||
                    12
                const lastItem = last(value)
                const y = lastItem ? lastItem.y + lastItem.h : 0
                const newItem = {
                    i: displayItem.item.id,
                    x: 0,
                    y,
                    w: layoutMaxCols,
                    h: 8,
                }
                return [...(value ?? []), newItem]
            })
            setValue(`${prefix}.layouts`, updatedLayout)
        },
        [prefix, getValues, setValue]
    )

    const removeVisualizationToLayout = useCallback(
        (id: string) => {
            const layout = getValues(`${prefix}.layouts`)
            const updatedLayout = mapValues(layout, (value, _key) => {
                return value?.filter((item) => item.i !== id)
            })
            setValue(`${prefix}.layouts`, updatedLayout)
        },
        [prefix, getValues, setValue]
    )

    const onAddVisualization = useCallback(
        (visualization: VisualizationItem) => {
            const fields = getValues(`${prefix}.items`)
            if (fields.some((field) => field.item.id === visualization.id)) {
                show({
                    message: i18n.t('This visualization is already added'),
                    type: { critical: true },
                })
                return
            }
            const displayItem: DisplayItem = {
                type: DisplayItemType.VISUALIZATION,
                item: visualization,
            }
            append(displayItem)
            addVisualizationToLayout(displayItem)
        },
        [append, getValues]
    )

    const onRemoveVisualization = useCallback(
        (id: string) => {
            const fields = getValues(`${prefix}.items`)
            removeVisualizationToLayout(id)
            const field = fields.findIndex(({ item }) => item.id === id)
            if (field === -1) {
                console.warn(`Item with id ${id} not found in fields`)
                return
            }
            remove(field)
        },
        [remove, getValues]
    )

    return {
        onAddVisualization,
        onRemoveVisualization,
    }
}

export function useManageVisualizations({
    prefix,
}: {
    prefix?: `config.groups.${number}`
}) {
    const { getValues, setValue } = useFormContext<
        VisualizationModule,
        'config.layouts' | `config.groups.${number}.layouts`
    >()
    const configPath:
        | `config.groups.${number}`
        | `config`
        | `config.sections.${number}` = useMemo(() => {
        if (prefix) {
            return prefix
        }
        return `config` as const
    }, [prefix])

    const { append, remove, update, fields } = useFieldArray<
        VisualizationModule,
        'config.items' | `config.groups.${number}.items`,
        'fieldId'
    >({
        name: `${configPath}.items`,
        keyName: 'fieldId',
    })

    const addVisualizationToLayout = useCallback(
        (displayItem: DisplayItem) => {
            const layout = getValues(`${configPath}.layouts`)
            const updatedLayout = mapValues(layout, (value, key) => {
                const layoutMaxCols =
                    SUPPORTED_SCREEN_SIZES.find(({ id }) => id === key)?.cols ||
                    12
                const lastItem = last(value)
                const y = lastItem ? lastItem.y + lastItem.h : 0
                const newItem = {
                    i: displayItem.item.id,
                    x: 0,
                    y,
                    w: layoutMaxCols,
                    h: 8,
                }
                return [...(value ?? []), newItem]
            })
            setValue(`${configPath}.layouts`, updatedLayout)
        },
        [configPath, getValues, setValue]
    )

    const removeVisualizationToLayout = useCallback(
        (id: string) => {
            const layout = getValues(`${configPath}.layouts`)
            const updatedLayout = mapValues(layout, (value, _key) => {
                return value?.filter((item) => item.i !== id)
            })
            setValue(`${configPath}.layouts`, updatedLayout)
        },
        [configPath, getValues, setValue]
    )

    const onAddVisualization = useCallback(
        (visualization: VisualizationItem) => {
            const displayItem: DisplayItem = {
                type: DisplayItemType.VISUALIZATION,
                item: visualization,
            }

            const existingIndex = fields.findIndex(
                (field) => field.item.id === visualization.id
            )

            if (existingIndex !== -1) {
                update(existingIndex, displayItem)
                return
            }

            append(displayItem)
            addVisualizationToLayout(displayItem)
        },
        [append, update]
    )

    const onRemoveVisualization = useCallback(
        (id: string) => {
            removeVisualizationToLayout(id)
            const field = fields.findIndex(({ item }) => item.id === id)
            if (field === -1) {
                console.warn(`Item with id ${id} not found in fields`)
                return
            }
            remove(field)
        },
        [remove, fields]
    )

    return {
        onAddVisualization,
        onRemoveVisualization,
    }
}
