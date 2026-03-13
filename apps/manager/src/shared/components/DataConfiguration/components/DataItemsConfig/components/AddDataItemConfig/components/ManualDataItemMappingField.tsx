import {
    useCategoryOptionComboConfigs,
    useDataElementConfigs,
    useSourceCategoryOptionComboConfigs,
    useSourceDataElementConfigs,
} from '@/shared/components/DataConfiguration/utils'
import { Field, InputField, Button, Chip } from '@dhis2/ui'
import { uniq } from 'lodash'
import { useCallback, useMemo, useState } from 'react'
import i18n from '@dhis2/d2-i18n'
import { useFormContext, useController } from 'react-hook-form'
import { DataItemMapping } from '@packages/shared/schemas'

export function ManualDataItemMappingField({
    name,
    helpText,
    routeId,
}: {
    name: string
    routeId: string | undefined
    helpText?: string
}) {
    const { control } = useFormContext()

    const { field, fieldState } = useController({
        name,
        control,
    })

    const mappings: DataItemMapping[] = field.value ?? []

    const [sourceId, setSourceId] = useState('')
    const [destId, setDestId] = useState('')
    const [sourceIdError, setSourceIdError] = useState('')
    const [destIdError, setDestIdError] = useState('')

    const parseDataItemId = (value: string) => {
        const trimmed = value.trim()

        if (!trimmed.includes('.')) {
            return null
        }

        const [dataElementId, comboId] = trimmed.split('.')

        if (!dataElementId || !comboId) {
            return null
        }

        return { dataElementId, comboId }
    }

    const addMapping = () => {
        const src = sourceId.trim()
        const dst = destId.trim()

        setSourceIdError('')
        setDestIdError('')

        if (!src) {
            setSourceIdError('Source id is required')
            return
        }

        if (!dst) {
            setDestIdError('Destination id is required')
            return
        }

        const parsedSrc = parseDataItemId(src)
        const parsedDst = parseDataItemId(dst)

        if (!parsedSrc && !parsedDst) {
            setSourceIdError(
                'Invalid format. Expected: DataElement.CategoryOptionCombo'
            )
            setDestIdError(
                'Invalid format. Expected: DataElement.CategoryOptionCombo'
            )
            return
        }

        if (!parsedSrc) {
            setSourceIdError(
                'Invalid format. Expected: DataElement.CategoryOptionCombo'
            )
            return
        }

        if (!parsedDst) {
            setDestIdError(
                'Invalid format. Expected: DataElement.CategoryOptionCombo'
            )
            return
        }

        const exists = mappings.some((m) => m.sourceId === src && m.id === dst)

        if (exists) {
            setSourceIdError('Mapping already exists')
            setDestIdError('Mapping already exists')
            return
        }

        field.onChange([...mappings, { sourceId: src, id: dst }])

        setSourceId('')
        setDestId('')
    }

    const removeMapping = (mapping: DataItemMapping) => {
        field.onChange(
            mappings.filter(
                (m) => !(m.sourceId === mapping.sourceId && m.id === mapping.id)
            )
        )
    }

    const {
        sourceDataElementIds,
        sourceComboIds,
        destDataElementIds,
        destComboIds,
    } = useMemo(() => {
        const sourceDataElementIds: string[] = []
        const sourceComboIds: string[] = []
        const destDataElementIds: string[] = []
        const destComboIds: string[] = []

        const parse = (value: string) => {
            const [de, combo] = value.split('.')
            return { de, combo }
        }

        mappings.forEach((m) => {
            const src = parse(m.sourceId)
            const dst = parse(m.id)

            if (src.de) sourceDataElementIds.push(src.de)
            if (src.combo) sourceComboIds.push(src.combo)

            if (dst.de) destDataElementIds.push(dst.de)
            if (dst.combo) destComboIds.push(dst.combo)
        })

        return {
            sourceDataElementIds: uniq(sourceDataElementIds),
            sourceComboIds: uniq(sourceComboIds),
            destDataElementIds: uniq(destDataElementIds),
            destComboIds: uniq(destComboIds),
        }
    }, [mappings])

    const {
        dataElements: sourceDataElements,
        loading: sourceDataElementsLoading,
        error: sourceDataElementsError,
    } = useSourceDataElementConfigs(routeId, sourceDataElementIds)

    const {
        categoryOptionCombos: sourceCategoryOptionCombos,
        loading: sourceCombosLoading,
        error: sourceCombosError,
    } = useSourceCategoryOptionComboConfigs(routeId, sourceComboIds)

    const {
        dataElements,
        loading: destDataElementsLoading,
        error: destDataElementsError,
    } = useDataElementConfigs(destDataElementIds)

    const {
        categoryOptionCombos,
        loading: destCombosLoading,
        error: destCombosError,
    } = useCategoryOptionComboConfigs(destComboIds)

    const sourceDataElementMap = useMemo(
        () =>
            Object.fromEntries(
                (sourceDataElements ?? []).map((d) => [d.id, d])
            ),
        [sourceDataElements]
    )

    const sourceComboMap = useMemo(
        () =>
            Object.fromEntries(
                (sourceCategoryOptionCombos ?? []).map((c) => [c.id, c])
            ),
        [sourceCategoryOptionCombos]
    )

    const destDataElementMap = useMemo(
        () => Object.fromEntries((dataElements ?? []).map((d) => [d.id, d])),
        [dataElements]
    )

    const destComboMap = useMemo(
        () =>
            Object.fromEntries(
                (categoryOptionCombos ?? []).map((c) => [c.id, c])
            ),
        [categoryOptionCombos]
    )

    const resolveSourceLabel = useCallback(
        (itemId: string) => {
            const [deId, comboId] = itemId.split('.')

            const de = sourceDataElementMap[deId]
            const combo = sourceComboMap[comboId]

            const deName = de?.displayName || de?.name || deId
            const comboName = combo?.displayName || combo?.name || comboId

            return comboId ? `${deName} (${comboName})` : deName
        },
        [sourceDataElementMap, sourceComboMap]
    )

    const resolveDestLabel = useCallback(
        (itemId: string) => {
            const [deId, comboId] = itemId.split('.')

            const de = destDataElementMap[deId]
            const combo = destComboMap[comboId]

            const deName = de?.displayName || de?.name || deId
            const comboName = combo?.displayName || combo?.name || comboId

            return comboId ? `${deName} (${comboName})` : deName
        },
        [destDataElementMap, destComboMap]
    )

    const metadataLoading =
        sourceDataElementsLoading ||
        sourceCombosLoading ||
        destDataElementsLoading ||
        destCombosLoading

    const metadataError =
        sourceDataElementsError ||
        sourceCombosError ||
        destDataElementsError ||
        destCombosError

    const addDisabled = metadataLoading || !sourceId.trim() || !destId.trim()

    return (
        <Field
            helpText={helpText}
            error={!!fieldState.error || !!metadataError}
            validationText={
                fieldState?.error?.message || metadataError?.message
            }
        >
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr auto',
                    gap: 8,
                    alignItems: 'end',
                    marginBottom: 4,
                }}
            >
                <InputField
                    value={sourceId}
                    error={!!sourceIdError}
                    label="Source"
                    validationText={sourceIdError}
                    placeholder="Source Id"
                    onChange={({ value }) => {
                        setSourceIdError('')
                        setSourceId(value as string)
                    }}
                />

                <InputField
                    value={destId}
                    error={!!destIdError}
                    label="Destination"
                    validationText={destIdError}
                    placeholder="Destination Id"
                    onChange={({ value }) => {
                        setDestIdError('')
                        setDestId(value as string)
                    }}
                />

                <div style={{ paddingBottom: 2 }}>
                    <Button
                        type="button"
                        onClick={addMapping}
                        disabled={addDisabled}
                        loading={metadataLoading}
                    >
                        {metadataLoading ? i18n.t('Loading') : i18n.t('Add')}
                    </Button>
                </div>
            </div>

            {mappings.length > 0 && (
                <>
                    <span style={{ fontSize: 12, color: '#6e7a8a' }}>
                        {mappings.length} {i18n.t('mappings')}
                    </span>
                    <div
                        style={{
                            maxHeight: 200,
                            overflowY: 'auto',
                            display: 'flex',
                            flexWrap: 'wrap',
                            padding: 6,
                            border: '1px solid #d5dde5',
                            borderRadius: 4,
                            background: '#fff',
                        }}
                    >
                        {mappings.map((m) => (
                            <Chip
                                dense
                                key={`${m.sourceId}-${m.id}`}
                                onRemove={() => removeMapping(m)}
                            >
                                {resolveSourceLabel(m.sourceId)} :{' '}
                                {resolveDestLabel(m.id)}
                            </Chip>
                        ))}
                    </div>
                </>
            )}
        </Field>
    )
}
