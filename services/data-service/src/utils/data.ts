import logger from '../logging'
import { AxiosError, AxiosInstance } from 'axios'
import {
    DataServiceAttributeValuesDataItemsSource,
    DataServiceDataItemConfig,
    DataServiceDataSourceItemsConfig,
} from '@packages/shared/schemas'
import { v4 } from 'uuid'
import { Dimensions } from '@/schemas/metadata'
import { isEmpty, isEqual, uniqWith } from 'lodash'
import { categoriesMeta } from '@/variables/meta'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { seq } from 'async'
import { handleError } from '@/utils/error'
import { dhis2Client } from '@/clients/dhis2'

export interface DataResponse {
    dataValues: Array<{
        comment: string
        created: string
        categoryOptionCombo?: string
        dataElement: string
        lastUpdated: string
        orgUnit: string
        period: string
        storedBy: string
        value: string
    }>
}

type DataValuePayload = {
    dataElement: string
    period: string
    orgUnit: string
    value: string
    attributeOptionCombo?: string
}

export async function fetchPagedData({
    dimensions,
    filters,
    client,
    timeout,
}: {
    dimensions: Dimensions
    filters?: Dimensions
    client: AxiosInstance
    timeout?: number
}) {
    try {
        const url = `analytics/dataValueSet.json`
        const queryParams: string[] = []

        Object.keys(dimensions).forEach((key) => {
            if (!isEmpty(dimensions[key])) {
                const dimensionParam = `${key}:${dimensions[key]?.join(';')}`
                queryParams.push(`dimension=${dimensionParam}`)
            }
        })

        if (!isEmpty(filters)) {
            Object.keys(filters).forEach((key) => {
                if (!isEmpty(filters[key])) {
                    const filterParam = `${key}:${filters[key]?.join(';')}`
                    queryParams.push(`filter=${filterParam}`)
                }
            })
        }

        const queryString = queryParams.join('&')
        const fullUrl = queryString ? `${url}?${queryString}` : url
        const response = await client.get<DataResponse>(fullUrl, {
            timeout,
            timeoutErrorMessage: `Data fetch timed out after ${timeout}ms for data items: ${dimensions.dx?.join(',')}, periods: ${dimensions.pe?.join(',')} and org unit ${dimensions.ou?.join(', ')} & filters: ${filters?.dx?.join(',')}`,
        })
        return {
            dataValues: response.data.dataValues?.filter(
                ({ value }) => !isNaN(Number(value))
            ),
        }
    } catch (e) {
        if (e instanceof Error) {
            handleError(e)
        }
    }
}

type Mapping = { id: string; sourceId: string }
type Expanded = { combo: string; id: string; name: string }

async function expandDataElement(
    client: AxiosInstance,
    element: string,
    timeout?: number
): Promise<Expanded[]> {
    if (element.includes('.')) {
        const [de, coc] = element.split('.')
        return [{ combo: element, id: coc, name: '' }]
    }

    const pipeline = seq(
        // Step 1: get categoryCombo id
        (deId: string, cb: any) => {
            client
                .get(`dataElements/${deId}?fields=categoryCombo`, {
                    timeout,
                    timeoutErrorMessage: `Timed out after ${timeout}ms fetching data element ${deId}`,
                })
                .then((res) => {
                    cb(null, {
                        deId,
                        categoryComboId: res.data?.categoryCombo?.id,
                    })
                })
                .catch((err) => cb(err))
        },

        // Step 2: get categoryOptionCombos
        (input: { deId: string; categoryComboId: string }, cb: any) => {
            client
                .get(
                    `categoryCombos/${input.categoryComboId}?fields=id,categoryOptionCombos`,
                    { timeout }
                )
                .then((res) => {
                    cb(null, {
                        deId: input.deId,
                        optionCombos: res.data?.categoryOptionCombos ?? [],
                    })
                })
                .catch((err) => cb(err))
        },

        // Step 3: fetch each categoryOptionCombo details
        (input: { deId: string; optionCombos: { id: string }[] }, cb: any) => {
            ; (async () => {
                try {
                    const results: Expanded[] = []
                    for (const coc of input.optionCombos) {
                        const res = await client.get(
                            `categoryOptionCombos/${coc.id}?fields=id,name`,
                            { timeout }
                        )
                        results.push({
                            combo: `${input.deId}.${res.data.id}`,
                            id: res.data.id,
                            name: res.data.name,
                        })
                    }
                    cb(null, results)
                } catch (err) {
                    cb(err)
                }
            })()
        }
    )

    return new Promise<Expanded[]>((resolve, reject) => {
        pipeline(element, (err: any, result: Expanded[]) => {
            if (err) return reject(err)
            resolve(result)
        })
    })
}

export async function processDataItems({
    mappings,
    sourceClient,
    destinationClient,
    timeout,
}: {
    mappings: Mapping[]
    sourceClient: AxiosInstance
    destinationClient: AxiosInstance
    timeout?: number
}) {
    try {
        const results: Mapping[] = []

        for (const { id, sourceId } of mappings) {
            const idExpanded = id.includes('.')
            const sourceExpanded = sourceId.includes('.')

            // Case 1: both already expanded -> keep as-is
            if (idExpanded && sourceExpanded) {
                results.push({ id, sourceId })
                continue
            }

            // Case 2: expand whichever is not expanded
            const idCombos = await expandDataElement(
                destinationClient,
                id,
                timeout
            )
            const sourceCombos = await expandDataElement(
                sourceClient,
                sourceId,
                timeout
            )

            for (const idCoc of idCombos) {
                // Priority 1: match by ID
                const matchById = sourceCombos.find((s) => s.id === idCoc.id)
                if (matchById) {
                    results.push({
                        id: idCoc.combo,
                        sourceId: matchById.combo,
                    })
                    continue // skip name check
                }

                // Priority 2: match by name
                const matchByName = sourceCombos.find(
                    (s) => s.name && s.name === idCoc.name
                )
                if (matchByName) {
                    results.push({
                        id: idCoc.combo,
                        sourceId: matchByName.combo,
                    })
                }
            }
        }

        return uniqWith(results, isEqual)
    } catch (e) {
        if (e instanceof AxiosError) {
            console.error(`Axios Error fetching data: ${e.message}`)
            console.error(
                `Axios Status code: ${e.response?.status} - ${e.response?.statusText}`
            )
            throw e
        } else {
            if (e instanceof Error) {
                console.error(`Error fetching data: ${e.message}`)
            } else {
                console.error(`Error fetching data: Unknown error`)
                console.error(`Error: ${JSON.stringify(e)}`)
            }
            throw e
        }
    }
}





export async function createMapping({
    dataElements,
}: {
    dataElements: string[]
}): Promise<Mapping[]> {

    if (!dataElements?.length) {
        return []
    }

    const idsFilter = `id:in:[${dataElements.join(',')}]`

    const response = await dhis2Client.get('/dataElements', {
        params: {
            fields: 'id,code,name',
            filter: idsFilter,
            paging: false,
        },
    })

    const elements = response.data?.dataElements ?? []

    const mapping: Mapping[] = elements.map(
        (el: { id: string; code?: string | null }) => ({
            id: el.id,
            sourceId: el.code?.trim() ? el.code : el.id,
        })
    )

    return mapping
}
/*
 * Processes data into values that include attributeOptionCombo
 *
 *
 * */
export async function processAttributeComboData({
    data,
    dataItemsConfig,
    categoryOptionId,
}: {
    data: DataResponse
    dataItemsConfig: DataServiceAttributeValuesDataItemsSource
    categoryOptionId: string
}): Promise<DataResponse> {
    const categoryMeta = categoriesMeta[dataItemsConfig.attributeId]

    const categoryOptionConfig = categoryMeta.categoryOptions.find(
        ({ id }) => id === categoryOptionId
    )

    if (categoryOptionConfig === undefined) {
        throw new Error(
            `Category option ${categoryOptionId} not found or is not a part of the category ${categoryMeta.id}`
        )
    }
    const dataValues = data.dataValues
        .map((value) => {
            return categoryOptionConfig.categoryOptionCombos.map(
                (categoryOptionCombo) => {
                    return {
                        ...value,
                        attributeOptionCombo: categoryOptionCombo.id,
                    }
                }
            )
        })
        .flat()

    return {
        dataValues,
    }
}

export async function processData({
    data,
    dataItems,
}: {
    data: DataResponse
    dataItems?: Array<DataServiceDataItemConfig>
}) {
    return {
        dataValues: data.dataValues.map((value) => {
            const config = dataItems?.find(({ sourceId }) => {
                if (sourceId === value.dataElement) return true

                if (sourceId.includes('.')) {
                    const [de, coc] = sourceId.split('.')
                    return (
                        de === value.dataElement &&
                        coc === value.categoryOptionCombo
                    )
                }

                return false
            })

            const newValue = { ...value }

            if (config) {
                if (config.id.includes('.')) {
                    const [newDe, newCoc] = config.id.split('.')
                    newValue.dataElement = newDe
                    newValue.categoryOptionCombo = newCoc
                } else {
                    newValue.dataElement = config.id
                }
            }

            return newValue
        }),
    }
}

export async function saveDataFile({
    data,
}: {
    data: DataValuePayload[]
    itemsConfig: DataServiceDataSourceItemsConfig
}): Promise<string> {
    const fileLocation = `outputs/data/${v4()}.json`
    const payload = {
        dataValues: data,
    }

    const dir = path.dirname(fileLocation)
    await fs.promises.mkdir(dir, { recursive: true })

    await fs.promises.writeFile(
        fileLocation,
        JSON.stringify(payload, null, 2),
        'utf8'
    )

    logger.info(`Data saved to ${fileLocation}`)
    logger.info(`Queuing file for upload: ${fileLocation}`)
    return fileLocation
}
