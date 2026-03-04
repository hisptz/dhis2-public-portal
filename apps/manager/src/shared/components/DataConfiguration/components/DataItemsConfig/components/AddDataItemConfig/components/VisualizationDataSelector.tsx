import { useMemo } from 'react'
import { useController, useFormContext } from 'react-hook-form'
import {
    Field,
    MultiSelectField,
    MultiSelectOption,
    NoticeBox,
    Transfer,
} from '@dhis2/ui'
import { useDataQuery } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import { isEmpty, uniq, uniqBy } from 'lodash'
import {
    getIndicatorIdsFromVisualizations,
    getDataElementIdsFromVisualizations,
    Visualization,
    getIndicatorsSources,
    useIndicatorsConfig,
    useDataElementConfigs,
    D2Map,
    getIndicatorIdsFromMaps,
    getDataElementIdsFromMaps
} from '@/shared/components/DataConfiguration/utils'



const VISUALIZATIONS_QUERY = {
    data: {
        resource: 'visualizations',
        params: {
            fields:
                'id,name,type,dataDimensionItems[*]',
            paging: false,
        },
    },
} as const


const MAPS_QUERY = {
    data: {
        resource: 'maps',
        params: {
            fields:
                'id,name,mapViews[dataDimensionItems[*]]',
            paging: false,
        },
    },
} as const


interface Props {
    nameVisualizations: string
    nameMaps: string
    nameDataElements: string
    labelVisualizations: string
    labelDataElements: string
    required?: boolean
    helpTextVisualizations?: string
    helpTextMaps?: string
    helpTextDataElements?: string
}


export function VisualizationDataSelector({
    nameVisualizations,
    nameMaps,
    nameDataElements,
    labelVisualizations,
    labelDataElements,
    required,
    helpTextVisualizations,
    helpTextDataElements,
}: Props) {
    const { control } = useFormContext()

    const {
        field: vizField,
        fieldState: visError,
    } = useController({
        name: nameVisualizations,
        control,
    })

    const {
        field: mapField,
    } = useController({
        name: nameMaps,
        control,
    })

    const {
        field: deField,
        fieldState: deError,
    } = useController({
        name: nameDataElements,
        control,
        rules: {
            validate: (value) => {
                if (!required) return true
                return value?.length > 0 || i18n.t('At least one data element is required')
            },
        },
    })

    const { data: vizData, loading: vizLoading, error: vizErrorQuery } =
        useDataQuery<{ data: { visualizations: Visualization[] } }>(
            VISUALIZATIONS_QUERY
        )

    const { data: mapData, loading: mapLoading, error: mapErrorQuery } =
        useDataQuery<{ data: { maps: D2Map[] } }>(MAPS_QUERY)


    const combinedOptions = useMemo(() => {
        const vizOptions =
            vizData?.data.visualizations?.map((v) => ({
                label: `${v.name} (Visualization)`,
                value: `viz:${v.id}`,
            })) ?? []

        const mapOptions =
            mapData?.data.maps?.map((m) => ({
                label: `${m.name} (Map)`,
                value: `map:${m.id}`,
            })) ?? []

        return [...vizOptions, ...mapOptions]
    }, [vizData, mapData])


    const combinedSelected = useMemo(() => {
        const vizValues =
            vizField.value?.map((id: string) => `viz:${id}`) ?? []

        const mapValues =
            mapField.value?.map((id: string) => `map:${id}`) ?? []

        return [...vizValues, ...mapValues]
    }, [vizField.value, mapField.value])


    const handleCombinedChange = (selected: string[]) => {
        const vizIds: string[] = []
        const mapIds: string[] = []

        selected.forEach((val) => {
            if (val.startsWith('viz:')) {
                vizIds.push(val.replace('viz:', ''))
            }
            if (val.startsWith('map:')) {
                mapIds.push(val.replace('map:', ''))
            }
        })

        vizField.onChange(vizIds)
        mapField.onChange(mapIds)
        deField.onChange([])
    }


    const selectedViz = useMemo(() => {
        if (!vizData?.data.visualizations) return []
        return vizData.data.visualizations.filter((v) =>
            vizField.value?.includes(v.id)
        )
    }, [vizField.value, vizData])

    const selectedMaps = useMemo(() => {
        if (!mapData?.data.maps) return []
        return mapData.data.maps.filter((m) =>
            mapField.value?.includes(m.id)
        )
    }, [mapField.value, mapData])


    const { indicatorIds, baseDataElementIds } = useMemo(() => {
        if (!selectedViz.length && !selectedMaps.length) {
            return { indicatorIds: [], baseDataElementIds: [] }
        }

        return {
            indicatorIds: uniq([
                ...getIndicatorIdsFromVisualizations(selectedViz),
                ...getIndicatorIdsFromMaps(selectedMaps),
            ]),
            baseDataElementIds: uniq([
                ...getDataElementIdsFromVisualizations(selectedViz),
                ...getDataElementIdsFromMaps(selectedMaps),
            ]),
        }
    }, [selectedViz, selectedMaps])

    const { indicators, loading: indicatorsLoading, error: indicatorError } = useIndicatorsConfig(indicatorIds)

    const indicatorSourceIds = useMemo(() => {
        if (isEmpty(indicators)) return []
        const sources = getIndicatorsSources({ indicators })
        return uniq(sources.dataElementIds)
    }, [indicators])

    const allDataElementIds = useMemo(
        () => uniq([...baseDataElementIds, ...indicatorSourceIds]),
        [baseDataElementIds, indicatorSourceIds]
    )

    const { dataElements, loading: dataElementsLoading, error: dataElementError } =
        useDataElementConfigs(allDataElementIds)

    const deOptions = useMemo(() => {
        return uniqBy(dataElements ?? [], 'id').map((de) => ({
            label: de.displayName || de.name || de.id,
            value: de.id,
        }))
    }, [dataElements])


    const metadataLoading = indicatorsLoading || dataElementsLoading;
    const metadataError = indicatorError || dataElementError;


    const sourcesLoading = vizLoading || mapLoading

    if (sourcesLoading && combinedSelected.length > 0) {
        return (
            <NoticeBox title={i18n.t('Loading sources')}>
                {i18n.t('Loading saved visualizations and maps...')}
            </NoticeBox>
        )
    }

    if (vizErrorQuery || mapErrorQuery) {
        return (
            <NoticeBox error title={i18n.t('Failed to load data')}>
                {vizErrorQuery?.message || mapErrorQuery?.message}
            </NoticeBox>
        )
    }


    if (metadataError) {
        return (<NoticeBox error title={i18n.t('Metadata loading failed')}>
            {i18n.t(metadataError.message)}
        </NoticeBox>
        )
    }


    return (
        <>
            <Field
                label={labelVisualizations}
                required={required}
                helpText={helpTextVisualizations}
            >
                <MultiSelectField
                    selected={combinedSelected}
                    loading={vizLoading || mapLoading}
                    error={!!visError.error}
                    validationText={visError?.error?.message}
                    onChange={({ selected }) => {
                        handleCombinedChange(selected)
                    }
                    }
                    filterable
                    placeholder={i18n.t(
                        'Search and select visualizations or maps...'
                    )}
                >
                    {combinedOptions.map((opt) => (
                        <MultiSelectOption
                            key={opt.value}
                            label={opt.label}
                            value={opt.value}
                        />
                    ))}
                </MultiSelectField>
            </Field>

            {combinedSelected.length > 0 && (
                <Field
                    label={labelDataElements}
                    required={required}
                    helpText={helpTextDataElements}
                    error={!!deError.error}
                    validationText={deError?.error?.message}
                >
                    <Transfer
                        filterable
                        enableOrderChange
                        loading={metadataLoading}
                        options={deOptions}
                        selected={deField.value ?? []}
                        onChange={({ selected }) => {
                            deField.onChange(selected)
                        }}
                    />
                </Field>
            )}
        </>
    )
}