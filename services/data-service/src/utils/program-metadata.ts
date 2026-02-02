import { AxiosInstance } from 'axios'
import { DataElement } from '@/utils/visualizations'
import { isEmpty } from 'lodash'
import { logWorker } from '@/rabbit/utils'

type ProgramIndicator = {
    id: string
    code: string
    name: string
    shortName: string
    legendSets: Array<{ id: string }>
    aggregationType: undefined
    valueType: undefined
}

export async function getProgramIndicatorsConfig({
    items,
    client,
}: {
    items: Array<string>
    client: AxiosInstance
}) {
    if (isEmpty(items)) {
        return []
    }
    logWorker(
        'info',
        `Fetching configurations for ${items.length} indicators...`
    )
    const response = await client.get<{
        programIndicators: Array<ProgramIndicator>
    }>(`programIndicators`, {
        params: {
            filter: `id:in:[${items.join(',')}]`,
            fields: ':owner,!sharing,!createdBy,!lastUpdatedBy,!created,!lastUpdated',
            paging: false,
        },
    })
    logWorker(
        'info',
        `Fetched ${response.data.programIndicators.length} indicators`
    )
    return response.data.programIndicators
}

type ProgramTrackedEntityAttribute = {
    id: string
    code: string
    name: string
    shortName: string
    valueType: string
    aggregationType: string
    legendSets: Array<{ id: string }>
}

export async function getProgramAttributesConfig({
    items,
    client,
}: {
    items: Array<string>
    client: AxiosInstance
}) {
    if (isEmpty(items)) {
        return []
    }
    logWorker(
        'info',
        `Fetching configurations for ${items.length} attributes...`
    )
    const response = await client.get<{
        programTrackedEntityAttributes: Array<ProgramTrackedEntityAttribute>
    }>(`programTrackedEntityAttributes`, {
        params: {
            filter: `id:in:[${items.join(',')}]`,
            fields: ':owner,!sharing,!createdBy,!lastUpdatedBy,!created,!lastUpdated',
            paging: false,
        },
    })
    logWorker(
        'info',
        `Fetched ${response.data.programTrackedEntityAttributes.length} attributes`
    )
    return response.data.programTrackedEntityAttributes
}

type ProgramDataElement = {
    id: string
    name: string
    code: string
    shortName: string
    valueType: string
    aggregationType: string
    legendSets: Array<{ id: string }>
}

export async function getProgramDataElementsConfig({
    items,
    client,
}: {
    items: Array<string>
    client: AxiosInstance
}) {
    if (isEmpty(items)) {
        return []
    }
    logWorker(
        'info',
        `Fetching configurations for ${items.length} data elements...`
    )
    const response = await client.get<{
        programTrackedEntityAttributes: Array<ProgramDataElement>
    }>(`dataElements`, {
        params: {
            filter: `id:in:[${items.join(',')}]`,
            fields: ':owner,!sharing,!createdBy,!lastUpdatedBy,!created,!lastUpdated',
            paging: false,
        },
    })
    logWorker(
        'info',
        `Fetched ${response.data.programTrackedEntityAttributes.length} data elements`
    )
    return response.data.programTrackedEntityAttributes
}

export function generateDataElementsForProgramItems(
    programItems: Array<
        ProgramIndicator | ProgramDataElement | ProgramTrackedEntityAttribute
    >,
    defaultCategoryComboId: string
): Array<DataElement> {
    if (isEmpty(programItems)) {
        return []
    }
    logWorker(
        'info',
        `Generating data elements for ${programItems.length} program items...`
    )
    return programItems.map((item) => {
        return {
            id: item.id,
            name: item.name,
            code: item.code,
            shortName: item.shortName,
            legendSets: item.legendSets ?? [],
            valueType: item.valueType ?? 'NUMBER',
            aggregationType: item.aggregationType ?? 'SUM',
            categoryCombo: {
                id: defaultCategoryComboId,
            },
        }
    })
}
