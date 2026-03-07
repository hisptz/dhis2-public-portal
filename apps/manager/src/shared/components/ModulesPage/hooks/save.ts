import { useParams } from '@tanstack/react-router'
import { useAlert, useDataMutation } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import { DatastoreNamespaces } from '@packages/shared/constants'
import { AppModule } from '@packages/shared/schemas'
import { useRefreshModule } from '../providers/ModuleProvider'

const mutation = {
    type: 'update' as const,
    resource: `dataStore/${DatastoreNamespaces.MODULES}`,
    id: ({ id }: { id: string }) => id,
    data: ({ data }: { data: AppModule }) => data,
}

export function useSaveModule() {
    const { moduleId } = useParams({
        strict: false,
    })
    const refresh = useRefreshModule()
    const { show } = useAlert(
        ({ message }) => message,
        ({ type }) => ({ ...type, duration: 3000 })
    )
    // @ts-expect-error DHIS2 types incorrectly restrict id to string; function id is supported at runtime
    const [mutate, rest] = useDataMutation(mutation, {
        variables: {
            id: moduleId,
        },
        onComplete: async () => {
            show({
                message: i18n.t('Changes saved successfully'),
                type: { success: true },
            })
            await refresh()
        },
        onError: (error) => {
            show({
                message: `${i18n.t('Could not save changes')}: ${error.message}`,
                type: { critical: true },
            })
        },
    })

    const save = async (data: AppModule) => {
        return await mutate({ data })
    }

    return {
        save,
        ...rest,
    }
}
