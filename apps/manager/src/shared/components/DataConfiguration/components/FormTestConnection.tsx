import { Button, ButtonStrip } from '@dhis2/ui'
import i18n from '@dhis2/d2-i18n'
import { useAlert, useDataQuery } from '@dhis2/app-runtime'

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
					message: `${i18n.t("Connection failed")}: ${error.details?.message || error.message}`,
					type: { critical: true },
				});
            }
        },
        variables: {
            id: routeConfig.id,
        },
        lazy: true,
    })

    const test = async () => {
        hide();
        await refetch()
    }

    return (
        <ButtonStrip>
            <Button
                onClick={() => {
                    test()
                }}
                loading={loading || fetching}
            >
                {loading || fetching
                    ? i18n.t('Testing...')
                    : i18n.t('Test connection')}
            </Button>
        </ButtonStrip>
    )
}
