import {
    useCategoryOptionComboConfigs,
    useDataElementConfigs,
    useSourceCategoryOptionComboConfigs,
    useSourceDataElementConfigs,
} from '@/shared/components/DataConfiguration/utils'
import { Field, InputField, Button, Chip } from '@dhis2/ui'
import { uniq } from 'lodash'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import i18n from '@dhis2/d2-i18n'
import { useFormContext, useController } from 'react-hook-form'
import { DataItemMapping } from '@packages/shared/schemas'

type ValidationState =
    | { phase: 'idle' }
    | { phase: 'validating'; sourceId: string; destId: string }
    | { phase: 'done'; sourceId: string; destId: string }
    | { phase: 'error'; sourceId: string; destId: string }

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
    const { field, fieldState } = useController({ name, control })

    const mappings: DataItemMapping[] = field.value ?? []

    const [sourceId, setSourceId] = useState('')
    const [destId, setDestId] = useState('')
    const [sourceIdError, setSourceIdError] = useState('')
    const [destIdError, setDestIdError] = useState('')
    const [validation, setValidation] = useState<ValidationState>({
        phase: 'idle',
    })

    const parseDataItemId = (value: string) => {
        const trimmed = value.trim()
        if (!trimmed.includes('.')) return null
        const [dataElementId, comboId] = trimmed.split('.')
        if (!dataElementId || !comboId) return null
        return { dataElementId, comboId }
    }

    const pendingSrc =
        validation.phase !== 'idle'
            ? parseDataItemId(validation.sourceId)
            : null

    const pendingDst =
        validation.phase !== 'idle' ? parseDataItemId(validation.destId) : null

    const {
        dataElements: pendingSrcDataElements,
        loading: pendingSrcDeLoading,
        error: pendingSrcDeError,
    } = useSourceDataElementConfigs(
        routeId,
        pendingSrc ? [pendingSrc.dataElementId] : []
    )

    const {
        categoryOptionCombos: pendingSrcCombos,
        loading: pendingSrcComboLoading,
        error: pendingSrcComboError,
    } = useSourceCategoryOptionComboConfigs(
        routeId,
        pendingSrc ? [pendingSrc.comboId] : []
    )

    const {
        dataElements: pendingDstDataElements,
        loading: pendingDstDeLoading,
        error: pendingDstDeError,
    } = useDataElementConfigs(pendingDst ? [pendingDst.dataElementId] : [])

    const {
        categoryOptionCombos: pendingDstCombos,
        loading: pendingDstComboLoading,
        error: pendingDstComboError,
    } = useCategoryOptionComboConfigs(pendingDst ? [pendingDst.comboId] : [])

    const pendingLoading =
        pendingSrcDeLoading ||
        pendingSrcComboLoading ||
        pendingDstDeLoading ||
        pendingDstComboLoading

    const pendingError =
        pendingSrcDeError ||
        pendingSrcComboError ||
        pendingDstDeError ||
        pendingDstComboError

    const pendingLoadingSeenTrue = useRef(false)

    const prevValidationRef = useRef<{
        sourceId: string
        destId: string
        hadError: boolean
    } | null>(null)

    useEffect(() => {
        if (validation.phase === 'validating') {
            const prev = prevValidationRef.current
            const sameIds =
                prev?.sourceId === validation.sourceId &&
                prev?.destId === validation.destId

            if (sameIds && !prev?.hadError) {
                setValidation((prev) =>
                    prev.phase === 'validating'
                        ? { ...prev, phase: pendingError ? 'error' : 'done' }
                        : prev
                )
            } else {
                pendingLoadingSeenTrue.current = false
                prevValidationRef.current = {
                    sourceId: validation.sourceId,
                    destId: validation.destId,
                    hadError: false,
                }
            }
        }
    }, [validation.phase])

    useEffect(() => {
        if (validation.phase === 'validating' && pendingLoading) {
            pendingLoadingSeenTrue.current = true
        }
    }, [validation.phase, pendingLoading])

    useEffect(() => {
        if (
            validation.phase !== 'validating' ||
            !pendingLoadingSeenTrue.current ||
            pendingLoading
        ) {
            return
        }

        setValidation((prev) => {
            if (prev.phase !== 'validating') return prev
            return pendingError
                ? { ...prev, phase: 'error' }
                : { ...prev, phase: 'done' }
        })
    }, [validation.phase, pendingLoading, pendingError])

    useEffect(() => {
        if (validation.phase !== 'error') return

        if (prevValidationRef.current) {
            prevValidationRef.current.hadError = true
        }

        const srcError = pendingSrcDeError || pendingSrcComboError
        const dstError = pendingDstDeError || pendingDstComboError

        if (srcError && dstError) {
            setSourceIdError(
                i18n.t(srcError.message ?? 'Could not reach source instance')
            )
            setDestIdError(
                i18n.t(
                    dstError.message ?? 'Could not reach destination instance'
                )
            )
        } else if (srcError) {
            setSourceIdError(
                i18n.t(srcError.message ?? 'Could not reach source instance')
            )
        } else if (dstError) {
            setDestIdError(
                i18n.t(
                    dstError?.message ?? 'Could not reach destination instance'
                )
            )
        }

        setValidation({ phase: 'idle' })
    }, [validation.phase])

    useEffect(() => {
        if (validation.phase !== 'done') return

        const { sourceId: src, destId: dst } = validation

        const parsedSrc = parseDataItemId(src)!
        const parsedDst = parseDataItemId(dst)!

        const srcDe = pendingSrcDataElements.find(
            (d) => d.id === parsedSrc.dataElementId
        )
        const srcCombo = pendingSrcCombos.find(
            (c) => c.id === parsedSrc.comboId
        )
        const dstDe = pendingDstDataElements.find(
            (d) => d.id === parsedDst.dataElementId
        )
        const dstCombo = pendingDstCombos.find(
            (c) => c.id === parsedDst.comboId
        )

        const srcResolved =
            !!(srcDe?.displayName || srcDe?.name) &&
            !!(srcCombo?.displayName || srcCombo?.name)

        const dstResolved =
            !!(dstDe?.displayName || dstDe?.name) &&
            !!(dstCombo?.displayName || dstCombo?.name)

        if (!srcResolved) {
            setSourceIdError(i18n.t('ID does not exist in source instance'))
        }
        if (!dstResolved) {
            setDestIdError(i18n.t('ID does not exist in destination instance'))
        }

        if (srcResolved && dstResolved) {
            field.onChange([...mappings, { sourceId: src, id: dst }])
            setSourceId('')
            setDestId('')
            prevValidationRef.current = null
        }

        setValidation({ phase: 'idle' })
    }, [validation.phase])

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

        mappings.forEach((m) => {
            const [srcDe, srcCombo] = m.sourceId.split('.')
            const [dstDe, dstCombo] = m.id.split('.')
            if (srcDe) sourceDataElementIds.push(srcDe)
            if (srcCombo) sourceComboIds.push(srcCombo)
            if (dstDe) destDataElementIds.push(dstDe)
            if (dstCombo) destComboIds.push(dstCombo)
        })

        return {
            sourceDataElementIds: uniq(sourceDataElementIds),
            sourceComboIds: uniq(sourceComboIds),
            destDataElementIds: uniq(destDataElementIds),
            destComboIds: uniq(destComboIds),
        }
    }, [mappings])

    const { dataElements: sourceDataElements } = useSourceDataElementConfigs(
        routeId,
        sourceDataElementIds
    )
    const { categoryOptionCombos: sourceCategoryOptionCombos } =
        useSourceCategoryOptionComboConfigs(routeId, sourceComboIds)
    const { dataElements } = useDataElementConfigs(destDataElementIds)
    const { categoryOptionCombos } = useCategoryOptionComboConfigs(destComboIds)

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

    const addMapping = () => {
        const src = sourceId.trim()
        const dst = destId.trim()

        setSourceIdError('')
        setDestIdError('')

        if (!src) {
            setSourceIdError(i18n.t('Source id is required'))
            return
        }
        if (!dst) {
            setDestIdError(i18n.t('Destination id is required'))
            return
        }

        const parsedSrc = parseDataItemId(src)
        const parsedDst = parseDataItemId(dst)

        if (!parsedSrc && !parsedDst) {
            setSourceIdError(
                i18n.t('Expected: DataElement.CategoryOptionCombo')
            )
            setDestIdError(i18n.t('Expected: DataElement.CategoryOptionCombo'))
            return
        }
        if (!parsedSrc) {
            setSourceIdError(
                i18n.t('Expected: DataElement.CategoryOptionCombo')
            )
            return
        }
        if (!parsedDst) {
            setDestIdError(i18n.t('Expected: DataElement.CategoryOptionCombo'))
            return
        }

        const exists = mappings.some((m) => m.sourceId === src && m.id === dst)
        if (exists) {
            setSourceIdError(i18n.t('Mapping already exists'))
            setDestIdError(i18n.t('Mapping already exists'))
            return
        }

        setValidation({ phase: 'validating', sourceId: src, destId: dst })
    }

    const removeMapping = (mapping: DataItemMapping) => {
        field.onChange(
            mappings.filter(
                (m) => !(m.sourceId === mapping.sourceId && m.id === mapping.id)
            )
        )
    }

    const isValidating = validation.phase !== 'idle'

    return (
        <Field
            helpText={helpText}
            error={!!fieldState.error}
            validationText={fieldState?.error?.message}
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
                        disabled={
                            isValidating || !sourceId.trim() || !destId.trim()
                        }
                        loading={isValidating}
                    >
                        {isValidating ? i18n.t('Validating...') : i18n.t('Add')}
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
