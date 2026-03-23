import { useDataQuery } from '@dhis2/app-runtime'
import _, { compact, flattenDeep, isEmpty, uniq } from 'lodash'
import { useEffect } from 'react'

export type Visualization = {
    id: string
    name: string
    type: string
    dataDimensionItems: Array<{
        dataDimensionItemType: string
        reportingRate?: { id: string; dimensionItem: string }
        indicator?: { id: string }
        dataElement?: { id: string }
        programIndicator?: { id: string }
        programDataElement?: { id: string }
        programAttribute?: { id: string }
    }>
}

export type D2Map = {
    id: string
    name: string
    mapViews: Array<{
        dataDimensionItems: Array<{
            dataDimensionItemType: string
            reportingRate?: { id: string; dimensionItem: string }
            indicator?: { id: string }
            dataElement?: { id: string }
            programIndicator?: { id: string }
            programDataElement?: { id: string }
            programAttribute?: { id: string }
        }>
    }>
}

export const testDataSource = async ({
    url,
    pat,
    username,
    password,
}: {
    url: string
    pat?: string
    username?: string
    password?: string
}) => {
    return await fetch(`${url}/api/me.json`, {
        method: 'GET',
        headers: {
            Authorization: pat
                ? `ApiToken ${pat}`
                : `Basic ${btoa(`${username}:${password}`)}`,
        },
    })
}

type Indicator = {
    id: string
    name: string
    indicatorType: { id: string }
    numerator: string
    denominator: string
}

const INDICATORS_QUERY = {
    data: {
        resource: 'indicators',
        params: ({ ids }: { ids: string }) => ({
            filter: `id:in:[${ids}]`,
            fields: 'id,name,numerator,denominator,indicatorType[id]',
            paging: false,
        }),
    },
} as const

export type DataElement = {
    id: string
    displayName: string
    code: string
    shortName: string
    name: string
}

export type CategoryOptionCombo = {
    id: string
    displayName: string
    name: string
}

const DATAELEMENTS_QUERY = {
    data: {
        resource: 'dataElements',
        params: ({ ids }: { ids: string }) => ({
            filter: `id:in:[${ids}]`,
            fields: 'id,displayName,code,shortName,name',
            paging: false,
        }),
    },
} as const

const CATEGORY_OPTION_COMBO_QUERY = {
    data: {
        resource: 'categoryOptionCombos',
        params: ({ ids }: { ids: string }) => ({
            fields: 'id,displayName',
            paging: false,
            filter: `id:in:[${ids}]`,
        }),
    },
} as const

export function getIndicatorIdsFromVisualizations(
    visualizationConfigs: Visualization[]
) {
    return compact(
        flattenDeep(
            visualizationConfigs.map((config) =>
                config.dataDimensionItems.map(
                    (item: { indicator?: { id: string } }) => item.indicator?.id
                )
            )
        )
    )
}

export function getDataElementIdsFromVisualizations(
    visualizationConfigs: Visualization[]
) {
    return _.compact(
        _.flattenDeep(
            visualizationConfigs.map((config) =>
                config.dataDimensionItems.map(
                    (item: { dataElement?: { id: string } }) =>
                        item.dataElement?.id
                )
            )
        )
    )
}

export function useDataElementConfigs(items: string[]) {
    const ids = uniq(items).join(',')

    const { data, loading, error, refetch } = useDataQuery<{
        data: { dataElements: DataElement[] }
    }>(DATAELEMENTS_QUERY, {
        variables: { ids },
        lazy: isEmpty(items),
    })

    useEffect(() => {
        if (!isEmpty(ids)) {
            refetch({ ids })
        }
    }, [ids])

    return {
        dataElements: data?.data?.dataElements ?? [],
        loading,
        error,
    }
}

export function useSourceDataElementConfigs(
    sourceInstanceId: string | undefined,
    items: string[]
) {
    const ids = uniq(items).join(',')

    const { data, loading, error, refetch } = useDataQuery<{
        data: { dataElements: DataElement[] }
    }>(
        {
            data: {
                resource: 'routes',
                id: ({ sourceInstanceId }: { sourceInstanceId: string }) =>
                    `${sourceInstanceId}/run/dataElements`,
                params: ({ ids }: { ids: string }) => ({
                    fields: 'id,displayName,code,shortName,name',
                    filter: `id:in:[${ids}]`,
                    paging: false,
                }),
            },
        },
        {
            variables: { ids, sourceInstanceId },
            lazy: isEmpty(items) || !sourceInstanceId,
        }
    )

    useEffect(() => {
        if (!isEmpty(ids) && sourceInstanceId) {
            refetch({ ids, sourceInstanceId })
        }
    }, [ids, sourceInstanceId])

    return {
        dataElements: data?.data?.dataElements ?? [],
        loading,
        error,
    }
}

export function useCategoryOptionComboConfigs(items: string[]) {
    const ids = uniq(items).join(',')

    const { data, loading, error, refetch } = useDataQuery<{
        data: { categoryOptionCombos: CategoryOptionCombo[] }
    }>(CATEGORY_OPTION_COMBO_QUERY, {
        variables: { ids },
        lazy: isEmpty(items),
    })

    useEffect(() => {
        if (!isEmpty(ids)) {
            refetch({ ids })
        }
    }, [ids])

    return {
        categoryOptionCombos: data?.data?.categoryOptionCombos ?? [],
        loading,
        error,
    }
}

export function useSourceCategoryOptionComboConfigs(
    sourceInstanceId: string | undefined,
    items: string[]
) {
    const ids = uniq(items).join(',')

    const { data, loading, error, refetch } = useDataQuery<{
        data: { categoryOptionCombos: CategoryOptionCombo[] }
    }>(
        {
            data: {
                resource: 'routes',
                id: ({ sourceInstanceId }: { sourceInstanceId: string }) =>
                    `${sourceInstanceId}/run/categoryOptionCombos`,
                params: ({ ids }: { ids: string }) => ({
                    fields: 'id,displayName',
                    filter: `id:in:[${ids}]`,
                    paging: false,
                }),
            },
        },
        {
            variables: { ids, sourceInstanceId },
            lazy: isEmpty(items) || !sourceInstanceId,
        }
    )

    useEffect(() => {
        if (!isEmpty(ids) && sourceInstanceId) {
            refetch({ ids, sourceInstanceId })
        }
    }, [ids, sourceInstanceId])

    return {
        categoryOptionCombos: data?.data?.categoryOptionCombos ?? [],
        loading,
        error,
    }
}

export function useIndicatorsConfig(items: string[]) {
    const ids = uniq(items).join(',')

    const { data, loading, error, refetch } = useDataQuery<{
        data: {
            indicators: Indicator[]
        }
    }>(INDICATORS_QUERY, {
        variables: { ids },
        lazy: isEmpty(items),
    })

    useEffect(() => {
        if (!isEmpty(ids)) {
            refetch({ ids })
        }
    }, [ids])

    return {
        indicators: data?.data?.indicators ?? [],
        loading,
        error,
    }
}

export function getIndicatorsSources({
    indicators,
}: {
    indicators: Array<Indicator>
}) {
    const dataElementIds: string[] = []
    const programIndicatorIds: string[] = []
    const dataSetIds: string[] = []

    for (const indicator of indicators) {
        const indicatorSources = getIndicatorSources(indicator)
        dataElementIds.push(...indicatorSources.dataElements)
        programIndicatorIds.push(...indicatorSources.programIndicators)
        dataSetIds.push(...indicatorSources.dataSets)
    }
    return {
        programIndicatorIds,
        dataElementIds,
        dataSetIds,
    }
}

export function getIndicatorSources(indicator: Indicator) {
    const type = indicator.indicatorType.id
    const numeratorDataItems = getDataItemsFromIndicatorExpression(
        indicator.numerator
    )
    const denominatorDataItems = getDataItemsFromIndicatorExpression(
        indicator.denominator
    )
    const dataItems = {
        dataElements: uniq([
            ...numeratorDataItems.dataElements.map(
                ({ dataElement }) => dataElement
            ),
            ...denominatorDataItems.dataElements.map(
                ({ dataElement }) => dataElement
            ),
        ]),
        programIndicators: uniq([
            ...numeratorDataItems.programIndicators.map(
                ({ programIndicator }) => programIndicator
            ),
            ...denominatorDataItems.programIndicators.map(
                ({ programIndicator }) => programIndicator
            ),
        ]),
        dataSets: uniq([
            ...numeratorDataItems.reportingRates.map(({ dataSet }) => dataSet),
            ...denominatorDataItems.reportingRates.map(
                ({ dataSet }) => dataSet
            ),
        ]),
    }

    return {
        indicatorTypes: [type],
        ...dataItems,
    }
}

export function getDataItemsFromIndicatorExpression(expression: string) {
    /*
     * So we basically go through all the expression to figure out all data items found in the source based on type
     * Checking for;
     *  #{val} - Data element
     *  #{val.cat} - Data element with categoryOptionCombo
     *  R{val.REPORTING_RATE|ACTUAL_REPORTS|ACTUAL_REPORTS_ON_TIME|EXPECTED_REPORTS|REPORTING_RATE_ON_TIME} - Reporting rates
     *  I{val} - program indicator
     * We need to use regular expression to achieve getting these
     * */

    const dataElementPattern = /#{([^}]+)}/g
    const programIndicatorPattern = /I{([^}]+)}/g
    const reportingRatePattern = /R{([^}]+)}/g

    const dataElementMatches = [...expression.matchAll(dataElementPattern)]
    const programIndicatorMatches = [
        ...expression.matchAll(programIndicatorPattern),
    ]
    const reportingRateMatches = [...expression.matchAll(reportingRatePattern)]

    const dataElements = dataElementMatches.map((match) => {
        const val = match[1]
        if (val.includes('.')) {
            const [dataElement, categoryOptionCombo] = val.split('.')
            return {
                dataElement,
                categoryOptionCombo,
            }
        }
        return {
            dataElement: val,
            categoryOptionCombo: undefined,
        }
    })

    const programIndicators = programIndicatorMatches.map((match) => {
        return {
            programIndicator: match[1],
        }
    })

    const reportingRates = reportingRateMatches.map((match) => {
        const [dataSet, type] = match[1].split('.')
        return {
            dataSet: dataSet,
            type: type,
        }
    })

    return {
        dataElements,
        programIndicators,
        reportingRates,
    }
}

export function getIndicatorIdsFromMaps(maps: D2Map[]) {
    return compact(
        flattenDeep(
            maps.map((map) =>
                map.mapViews.map((view) =>
                    view.dataDimensionItems.map((item) => item.indicator?.id)
                )
            )
        )
    )
}

export function getDataElementIdsFromMaps(mapsConfig: D2Map[]) {
    return _.compact(
        _.flattenDeep(
            mapsConfig.map((config) =>
                config.mapViews.map((view) =>
                    view.dataDimensionItems.map(
                        (item: { dataElement?: { id: string } }) =>
                            item.dataElement?.id
                    )
                )
            )
        )
    )
}
