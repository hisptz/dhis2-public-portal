import { AxiosInstance } from 'axios'
import { DataElement } from '@/utils/visualizations'

type ProgramIndicator = {
    id: string
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
    const response = await client.get<{
        indicators: Array<ProgramIndicator>
    }>(`programIndicators`, {
        params: {
            filter: `id:in:[${items.join(',')}]`,
            fields: ':owner,!sharing,!createdBy,!lastUpdatedBy,!created,!lastUpdated',
            paging: false,
        },
    })

    return response.data.indicators
}

type ProgramTrackedEntityAttribute = {
    id: string
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
    const response = await client.get<{
        programTrackedEntityAttributes: Array<ProgramTrackedEntityAttribute>
    }>(`programTrackedEntityAttributes`, {
        params: {
            filter: `id:in:[${items.join(',')}]`,
            fields: ':owner,!sharing,!createdBy,!lastUpdatedBy,!created,!lastUpdated',
            paging: false,
        },
    })

    return response.data.programTrackedEntityAttributes
}

type ProgramDataElement = {
    id: string
    name: string
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
    const response = await client.get<{
        programTrackedEntityAttributes: Array<ProgramDataElement>
    }>(`dataElements`, {
        params: {
            filter: `id:in:[${items.join(',')}]`,
            fields: ':owner,!sharing,!createdBy,!lastUpdatedBy,!created,!lastUpdated',
            paging: false,
        },
    })
    return response.data.programTrackedEntityAttributes
}

export function generateDataElementsForProgramItems(
    programItems: Array<
        ProgramIndicator | ProgramDataElement | ProgramTrackedEntityAttribute
    >,
    defaultCategoryComboId: string
): Array<DataElement> {
    return programItems.map((item) => {
        return {
            id: item.id,
            name: item.name,
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
