import { FormProvider, useForm } from 'react-hook-form'
import { dataServiceConfigSchema } from '@packages/shared/schemas'
import { useMemo } from 'react'
import { z, ZodIssueCode } from 'zod'
import {
    Button,
    ButtonStrip,
    Modal,
    ModalActions,
    ModalContent,
    ModalTitle,
} from '@dhis2/ui'
import i18n from '@dhis2/d2-i18n'
import { RHFTextInputField } from '@hisptz/dhis2-ui'
import { AuthFields } from './AuthFields'
import { TestConnection } from './TestConnection'
import { testDataSource } from '../utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { useCreateDataSource } from '../hooks/save'
import { RHFIDField } from '../../Fields/IDField'
import { FetchError, useDataEngine } from '@dhis2/app-runtime'
import { DatastoreNamespaces } from '@packages/shared/constants'

const dataServiceConfigFormSchema = dataServiceConfigSchema.extend({
    source: dataServiceConfigSchema.shape.source.extend({
        url: z.string().url(),
        pat: z.string().optional(),
        username: z.string().optional(),
        password: z.string().optional(),
    }),
})
export type AddSourceFormValues = z.infer<typeof dataServiceConfigFormSchema>

function useFormValidation() {
    const engine = useDataEngine()
    return useMemo(
        () =>
            dataServiceConfigFormSchema
                .extend({
                    id: z.string().refine(
                        async (value) => {
                            try {
                                await engine.query({
                                    id: {
                                        resource: `dataStore/${DatastoreNamespaces.DATA_SERVICE_CONFIG}/${value}`,
                                    },
                                })
                                return false
                            } catch (error) {
                                if (error instanceof FetchError) {
                                    return error.message.includes('404')
                                } else {
                                    return false
                                }
                            }
                        },
                        {
                            message: i18n.t('This ID is already in use'),
                        }
                    ),
                    source: dataServiceConfigSchema.shape.source
                        .extend({
                            url: z.string().url(),
                            pat: z.string().optional(),
                            username: z.string().optional(),
                            password: z.string().optional(),
                        })
                        .superRefine((data, context) => {
                            if (
                                !(
                                    !!data.pat ||
                                    (!!data.username && !!data.password)
                                )
                            ) {
                                context.addIssue({
                                    code: ZodIssueCode.custom,
                                    message: i18n.t(
                                        'Please provide either a PAT or username and password'
                                    ),
                                    path: ['source', 'pat'],
                                })
                                context.addIssue({
                                    code: ZodIssueCode.custom,
                                    message: i18n.t(
                                        'Please provide either a PAT or username and password'
                                    ),
                                    path: ['source', 'username'],
                                })
                            }
                        }),
                })
                .superRefine(async (data, context) => {
                    try {
                        const response = await testDataSource({
                            url: data.source.url,
                            pat: data.source.pat,
                            username: data.source.username,
                            password: data.source.password,
                        })
                        if (response.status !== 200) {
                            context.addIssue({
                                code: ZodIssueCode.custom,
                                message: i18n.t(
                                    'Could not connect to the DHIS2 instance. Please check the URL, and authentication, and try again.'
                                ),
                                path: ['source', 'url'],
                            })
                        }
                    } catch (error) {
                        context.addIssue({
                            code: ZodIssueCode.custom,
                            message: i18n.t(
                                'Could not connect to the DHIS2 instance. Please check the URL, and authentication, and try again. Error message: {{errorMessage}}',
                                {
                                    errorMessage: error.message,
                                }
                            ),
                            path: ['source', 'url'],
                        })
                    }
                }),
        [engine]
    )
}

export function AddDataSourceForm({
    hide,
    onClose,
}: {
    hide: boolean
    onClose: () => void
}) {
    const addSourceFormSchema = useFormValidation()
    const form = useForm<AddSourceFormValues>({
        resolver: zodResolver(addSourceFormSchema),
        defaultValues: {
            itemsConfig: [],
            visualizations: [],
            source: {
                routeId: '',
            },
        },
    })
    const { save } = useCreateDataSource(onClose)

    return (
        <FormProvider {...form}>
            <Modal position="middle" onClose={onClose} hide={hide}>
                <ModalTitle>
                    {i18n.t('Add data service configuration')}
                </ModalTitle>
                <ModalContent>
                    <form className="flex flex-col gap-2">
                        <RHFTextInputField
                            label={i18n.t('Name')}
                            name="source.name"
                            placeholder={'DHIS2 Playground'}
                            required
                        />
                        <RHFIDField
                            dependsOn={'source.name'}
                            label={i18n.t('ID')}
                            name={'id'}
                        />
                        <RHFTextInputField
                            label={i18n.t('URL')}
                            name="source.url"
                            placeholder={'https://play.dhis2.org'}
                            required
                        />
                        <AuthFields />
                        <TestConnection />
                    </form>
                </ModalContent>
                <ModalActions>
                    <ButtonStrip>
                        <Button type="button" onClick={() => onClose()}>
                            {i18n.t('Cancel')}
                        </Button>
                        <Button
                            loading={
                                form.formState.isSubmitting ||
                                form.formState.isValidating
                            }
                            onClick={(_, e) => form.handleSubmit(save)(e)}
                            primary
                        >
                            {form.formState.isValidating
                                ? i18n.t('Validating...')
                                : form.formState.isSubmitting
                                  ? i18n.t('Saving...')
                                  : i18n.t('Create')}
                        </Button>
                    </ButtonStrip>
                </ModalActions>
            </Modal>
        </FormProvider>
    )
}
