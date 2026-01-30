import { chunk, compact, uniq } from 'lodash'
import { mapSeries } from 'async'
import { createSourceClient, dhis2Client } from '@/clients/dhis2'
import logger from '@/logging'
import { fetchItemsInParallel } from './parallel-fetch'
import { AxiosInstance } from 'axios'
import { DataElement } from '@/utils/visualizations'

type Indicator = {
    id: string
    indicatorType: { id: string }
    numerator: string
    denominator: string
    legendSets: Array<{ id: string }>
}

export async function getIndicatorsConfig({
    items,
    client,
}: {
    items: Array<string>
    client: AxiosInstance
}) {
    const indicators = await client.get<{
        indicators: Array<Indicator>
    }>(`indicators`, {
        params: {
            filter: `id:in:[${items.join(',')}]`,
            fields: ':owner,!sharing,!createdBy,!lastUpdatedBy,!created,!lastUpdated',
            paging: false,
        },
    })

    return indicators.data.indicators
}

export async function getDataElementsFromServer(
    dataElementIds: string[],
    routeId?: string
) {
    if (!dataElementIds || dataElementIds.length === 0) {
        logger.warn('No data element IDs provided — skipping fetch')
        return []
    }

    logger.info(`Fetching ${dataElementIds.length} data elements from server`, {
        routeId,
        dataElementCount: dataElementIds.length,
        sampleIds: dataElementIds.slice(0, 5),
    })

    const client = routeId ? await createSourceClient(routeId) : dhis2Client

    const dataElements = await fetchItemsInParallel(
        client,
        'dataElements',
        dataElementIds,
        ':owner,!sharing,!createdBy,!lastUpdatedBy,!created,!lastUpdated',
        5
    )

    logger.info(
        `getDataElementsFromServer completed: ${dataElements.length} data elements fetched`
    )
    return dataElements
}

export async function getDataElements(
    dataElementIds: string[],
    routeId?: string
) {
    if (dataElementIds.length > 100) {
        const chunks = chunk(dataElementIds, 100)
        const dataElements = await mapSeries(
            chunks,
            async (chunk: string[]) => {
                return getDataElementsFromServer(chunk, routeId)
            }
        )
        return dataElements.flat()
    }
    return getDataElementsFromServer(dataElementIds, routeId)
}

export async function getCategories({
    items,
    client,
}: {
    items: string[]
    client: AxiosInstance
}) {
    //We first need to get the category combo, then the categories making up the category combos
    const categories: Array<{
        id: string
        categoryOptions: Array<{ id: string }>
    }> = []
    const categoryOptions: Array<{ id: string }> = []
    const categoryCombos: Array<{
        id: string
        categoryOptionCombos: Array<{ id: string }>
    }> = []
    const categoryOptionCombos: Array<{ id: string }> = []

    for (const item of items) {
        const response = await client.get<{
            categoryCombos: Array<{
                id: string
                categoryOptionCombos: Array<{ id: string }>
            }>
            categories: Array<{
                id: string
                categoryOptions: Array<{ id: string }>
            }>
            categoryOptions: Array<{ id: string }>
            categoryOptionCombos: Array<{ id: string }>
        }>(`categories/${item}/metadata.json`)

        const data = response.data
        categories.push(...data.categories)
        categoryOptions.push(...data.categoryOptions)
        categoryCombos.push(...data.categoryCombos)
        categoryOptionCombos.push(...data.categoryOptionCombos)
    }

    return {
        categories,
        categoryOptions,
        categoryCombos,
        categoryOptionCombos,
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

export async function getIndicatorTypes({
    items,
    client,
}: {
    client: AxiosInstance
    items: string[]
}) {
    const response = await client.get<{
        indicatorTypes: Array<{ id: string }>
    }>(`indicatorTypes`, {
        params: {
            filter: `id:in:[${items.join(',')}]`,
            fields: ':owner,!sharing,!createdBy,!lastUpdatedBy,!created,!lastUpdated',
        },
    })

    return response.data.indicatorTypes
}

export async function getIndicatorsSources({
    indicators,
}: {
    indicators: Array<Indicator>
}) {
    const dataElementIds: string[] = []
    const programIndicatorIds: string[] = []
    const dataSetIds = []

    logger.info('Extracting data items from indicator expressions...')
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

export function sanitizeIndicatorsWithDatasetReferences({
    indicators,
    datasetDataElements,
}: {
    indicators: Array<Indicator>
    datasetDataElements: Array<DataElement>
}) {
    const reportingRatePattern = /R{([^}]+)}/g
    return indicators.map(({ numerator, denominator, ...indicator }) => {
        const hasDatasetReference =
            numerator.includes('R{') || denominator.includes('R{')
        if (hasDatasetReference) {
            const matches = [
                ...numerator.matchAll(reportingRatePattern),
                ...denominator.matchAll(reportingRatePattern),
            ]
            const applicableReportingRates = compact(
                matches
                    .map((match) => match[1])
                    .map((match) =>
                        datasetDataElements.find(({ code }) => code === match)
                    )
            )
            let updatedNumerator = numerator
            let updatedDenominator = denominator
            for (const reportingRate of applicableReportingRates) {
                updatedNumerator = updatedNumerator.replaceAll(
                    reportingRate.code,
                    `#{${reportingRate.id}}`
                )
                updatedDenominator = updatedDenominator.replaceAll(
                    reportingRate.code,
                    `#{${reportingRate.id}}`
                )
            }
            return {
                ...indicator,
                numerator: updatedNumerator,
                denominator: updatedDenominator,
            }
        }
        return {
            ...indicator,
            numerator,
            denominator,
        }
    })
}
