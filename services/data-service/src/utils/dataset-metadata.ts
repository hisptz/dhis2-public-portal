import { AxiosInstance } from 'axios'
import { capitalize, flattenDeep, isEmpty, truncate } from 'lodash'
import { uid } from '@hisptz/dhis2-utils'
import { DataElement } from '@/utils/visualizations'
import { logWorker } from '@/rabbit/utils'

enum ReportingRateType {
    REPORTING_RATE = 'REPORTING_RATE',
    ACTUAL_REPORTS = 'ACTUAL_REPORTS',
    ACTUAL_REPORTS_ON_TIME = 'ACTUAL_REPORTS_ON_TIME',
    EXPECTED_REPORT = 'EXPECTED_REPORTS',
    REPORTING_RATE_ON_TIME = 'REPORTING_RATE_ON_TIME',
}

type Dataset = {
    id: string
    name: string
    legendSets: Array<{ id: string }>
}

export async function getDatasetsConfig({
    client,
    items,
}: {
    client: AxiosInstance
    items: string[]
}) {
    if (isEmpty(items)) {
        return []
    }
    logWorker('info', `Fetching configurations for ${items.length} datasets...`)
    const response = await client.get<{
        dataSets: Array<Dataset>
    }>(`dataSets`, {
        params: {
            filter: `id:in:[${items.join(',')}]`,
            fields: ':owner,!sharing,!createdBy,!lastUpdatedBy,!created,!lastUpdated',
            paging: false,
        },
    })
    logWorker('info', `Fetched ${response.data.dataSets.length} datasets`)
    return response.data.dataSets
}

export function generateDataElementsForDatasetItems(
    datasetItems: Array<Dataset>,
    defaultCategoryComboId: string
): Array<DataElement> {
    if (isEmpty(datasetItems)) {
        return []
    }
    logWorker(
        'info',
        `Generating data elements for ${datasetItems.length} datasets...`
    )
    return flattenDeep(
        datasetItems.map((item) => {
            return Object.keys(ReportingRateType).map((key) => {
                const reportingRateLabel = capitalize(key.replace(/_/g, ' '))
                return {
                    id: uid(),
                    code: `${item.id}.${key}`,
                    valueType: 'NUMBER',
                    aggregationType: 'SUM',
                    legendSets: item.legendSets ?? [],
                    name: `${item.name} - ${reportingRateLabel}`,
                    shortName: truncate(
                        `${item.name} - ${reportingRateLabel}`,
                        {
                            length: 48,
                            omission: '',
                        }
                    ),
                    categoryCombo: {
                        id: defaultCategoryComboId,
                    },
                }
            })
        })
    )
}
