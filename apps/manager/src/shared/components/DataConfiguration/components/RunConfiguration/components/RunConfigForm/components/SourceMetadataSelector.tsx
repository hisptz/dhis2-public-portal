import { useDataQuery } from '@dhis2/app-runtime'
import { Field, Transfer } from '@dhis2/ui'
import { debounce, find, uniqBy } from 'lodash'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Controller } from 'react-hook-form'
import { DataServiceConfig } from '@packages/shared/schemas'
import { DHIS2Resource } from '@hisptz/dhis2-utils'
import { Pager } from '@hisptz/dhis2-ui'

export interface SourceMetadataSelectorProps {
    name: string
    label: string
    required?: boolean
    config: DataServiceConfig
    resourceType: 'visualizations' | 'maps' | 'dashboards'
}

const metadataQuery = {
    metadata: {
        resource: `routes`,
        id: ({
            routeId,
            resourceType,
        }: {
            routeId: string
            resourceType: string
        }) => `/${routeId}/run/${resourceType}`,
        params: ({ page, keyword }: { page: number; keyword?: string }) => {
            return {
                fields: ['id', 'displayName'],
                page,
                pageSize: 50,
                totalPages: true,
                filter: keyword ? [`identifiable:token:${keyword}`] : undefined,
            }
        },
    },
}

type MetadataQueryResponse = {
    metadata: {
        pager: Pager
        visualizations?: Array<DHIS2Resource>
        maps?: Array<DHIS2Resource>
        dashboards?: Array<DHIS2Resource>
    }
}

export function SourceMetadataSelector({
    name,
    label,
    required,
    config,
    resourceType,
}: SourceMetadataSelectorProps) {
    const [options, setOptions] = useState<
        Array<{ label: string; value: string }>
    >([])
    const { data, loading, refetch } = useDataQuery<MetadataQueryResponse>(
        metadataQuery,
        {
            variables: {
                page: 1,
                resourceType,
                routeId: config.source.routeId,
            },
        }
    )

    useEffect(() => {
        if (data) {
            const items: Array<DHIS2Resource> =
                data?.metadata?.[resourceType] ?? []
            const newData: Array<{ label: string; value: string }> = items.map(
                (item) => {
                    return {
                        label: item.displayName ?? '',
                        value: item.id,
                    }
                }
            )
            setOptions((prevState) =>
                uniqBy([...prevState, ...newData], 'value')
            )
        }
    }, [data, resourceType])

    const onNextPage = useCallback(() => {
        const page = data?.metadata?.pager?.page ?? 1
        const totalPages = data?.metadata?.pager?.pageCount ?? 50
        if (page !== totalPages) {
            refetch({
                page: (data?.metadata?.pager?.page ?? 1) + 1,
            })
        }
    }, [refetch, data])

    const onFilter = useCallback(
        (keyword: string) => {
            return refetch({
                keyword,
                page: 1,
            }) as Promise<MetadataQueryResponse>
        },
        [refetch]
    )

    const onFilterChange = debounce(async ({ value }) => {
        const { metadata: metadataResponse } = await onFilter(value)
        const items = metadataResponse?.[resourceType] ?? []
        setOptions(
            uniqBy(
                [
                    ...items.map((item) => ({
                        label: item.displayName!,
                        value: item.id,
                    })),
                ],
                'value'
            )
        )
    }, 1000)

    return (
        <Controller
            render={({ field, fieldState }) => {
                const updatedOptions = useMemo(() => {
                    return uniqBy(
                        [
                            ...(options ?? []),
                            ...(field.value?.map(({ id, name }) => ({
                                label: name,
                                value: id,
                            })) ?? []),
                        ],
                        'value'
                    )
                }, [options, field.value])

                return (
                    <Field
                        validationText={fieldState.error?.message}
                        error={!!fieldState.error}
                        required={required}
                        label={label}
                    >
                        <Transfer
                            onEndReached={onNextPage}
                            filterable
                            loading={loading}
                            options={updatedOptions}
                            onFilterChange={onFilterChange}
                            selected={
                                field?.value?.map(
                                    ({ id }: { id: string }) => id
                                ) ?? []
                            }
                            onChange={({
                                selected,
                            }: {
                                selected: string[]
                            }) => {
                                field.onChange(
                                    selected?.map((value) => ({
                                        id: value,
                                        name: find(updatedOptions, [
                                            'value',
                                            value,
                                        ])?.label,
                                    }))
                                )
                            }}
                        />
                    </Field>
                )
            }}
            name={name}
        />
    )
}
