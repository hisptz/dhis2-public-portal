import i18n from '@dhis2/d2-i18n'
import { useAlert, useDataQuery } from '@dhis2/app-runtime'
import { useMemo } from 'react'

const query = {
    routeTest: {
        resource: `routes`,
        id: ({ id }: { id: string }) => `${id}/run`,
    },
}

export function FormTestConnection({
    routeConfig,
}: {
    routeConfig: { name: string; url: string; id: string }
}) {
    const { show, hide } = useAlert(
        ({ message }) => message,
        ({ type }) => ({ ...type, duration: 3000 })
    )

    const { refetch, loading, fetching } = useDataQuery(query, {
        onComplete: () => {
            show({
                message: i18n.t('Connection successful'),
                type: { success: true },
            })
        },
        onError: (error) => {
            if (
                error.message?.includes('Unexpected end of JSON input') ||
                error.details?.httpStatusCode === 302 ||
                error.message?.includes('302')
            ) {
                show({
                    message: i18n.t('Connection successful'),
                    type: { success: true },
                })
            } else {
                show({
                    message: `${i18n.t('Connection failed')}: ${error.details?.message || error.message
                        }`,
                    type: { critical: true },
                })
            }
        },
        variables: {
            id: routeConfig.id,
        },
        lazy: true,
    })

    const test = async () => {
        hide()
        await refetch()
    }

    const busy = loading || fetching

    const label = useMemo(
        () => (busy ? i18n.t('Testing') : i18n.t('Test Connection')),
        [busy]
    )

    return (

        <span
            onClick={test}
            className={`
                group
                inline-flex items-center gap-1.5
                px-2.5 py-1
                rounded-full
                text-xs font-medium
                cursor-pointer select-none
                border
                transition-all duration-200
                ${busy
                    ? 'bg-green-50 border-green-700 text-green-700 hover:text-green-700 cursor-wait'
                    : 'bg-gray-100 border-gray-300 text-gray-700 hover:border-green-700'
                }
                hover:-translate-y-[1px]
                hover:text-green-700 text-bold
                active:scale-100
            `}
        >

            {busy ? (
                <span
                    className="
                        w-3.5 h-3.5
                        rounded-full
                        border-2 border-gray-300
                        border-t-green-700
                        border-b-
                        animate-spin
                    "
                />
            ) : <></>}

            <span className="tracking-wide">{label}</span>
        </span>




    )
}
