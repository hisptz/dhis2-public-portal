import { useDataEngine } from '@dhis2/app-runtime'
import { useCallback } from 'react'
import { StaticItemConfig, StaticModule } from '@packages/shared/schemas'
import { useModule } from '../../../../ModulesPage/providers/ModuleProvider'

const getMutation = ({ namespace, id }: { namespace: string; id: string }) => ({
    type: 'create' as const,
    resource: `dataStore/${namespace}/${id}`,
    data: ({ data }: { data: StaticItemConfig }) => data,
})

export function useCreateItem() {
    const engine = useDataEngine()
    const module = useModule() as StaticModule
    const createItem = useCallback(
        async (data: StaticItemConfig) => {
            await engine.mutate(
                getMutation({
                    namespace: module?.config?.namespace,
                    id: data.id,
                }),
                {
                    variables: {
                        data,
                    },
                }
            )
        },
        [engine, module?.config?.namespace]
    )

    return {
        createItem,
    }
}

const getUpdateMutation = ({
    namespace,
    id,
}: {
    namespace: string
    id: string
}) => ({
    type: 'update' as const,
    resource: `dataStore/${namespace}`,
    id,
    data: ({ data }: { data: StaticItemConfig }) => data,
})

export function useUpdateItem() {
    const engine = useDataEngine()
    const module = useModule() as StaticModule
    const updateItem = useCallback(
        async (data: StaticItemConfig) => {
            await engine.mutate(
                getUpdateMutation({
                    namespace: module?.config?.namespace,
                    id: data.id,
                }),
                {
                    variables: {
                        data,
                    },
                }
            )
        },
        [engine, module?.config?.namespace]
    )

    return {
        updateItem,
    }
}
