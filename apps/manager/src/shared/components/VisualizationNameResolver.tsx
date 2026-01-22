import { useDataQuery } from '@dhis2/app-runtime'
import { CircularLoader } from '@dhis2/ui'

const visQuery = {
    vis: {
        resource: 'identifiableObjects',
        id: ({ id }) => id,
        params: {
            fields: ['id', 'displayName', 'type'],
        },
    },
}
type Response = {
    vis: {
        id: string
        displayName: string
        type: string
    }
}

export function VisualizationNameResolver({ id }: { id: string }) {
    const { data, loading, error } = useDataQuery<Response>(visQuery, {
        variables: {
            id,
        },
        lazy: !id,
    })

    if (loading) {
        return <CircularLoader extrasmall />
    }
    if (error) {
        return <>{id}</>
    }
    return <>{data?.vis?.displayName ?? id}</>
}
