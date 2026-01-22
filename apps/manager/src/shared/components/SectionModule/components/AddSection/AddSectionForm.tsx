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
import { FormProvider, useForm, useFormContext } from 'react-hook-form'
import React from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import {
    BaseSectionConfig,
    baseSectionSchema,
    SectionModuleConfig,
    SectionType,
} from '@packages/shared/schemas'
import { SectionIDField } from './SectionIDField'
import { FetchError, useAlert } from '@dhis2/app-runtime'
import { SectionTypeSelector } from './SectionTypeSelector'
import { getDefaultLayoutConfig } from '@packages/shared/constants'
import { set } from 'lodash'

export function AddSectionForm({
    sortOrder,
    hide,
    onClose,
    onAdd,
}: {
    sortOrder: number
    hide: boolean
    onClose: () => void
    onAdd: (section: BaseSectionConfig) => void
}) {
    // Gets this value from the parent form
    const { getValues } = useFormContext<SectionModuleConfig>()
    const displayType = getValues('sectionDisplay')
    const { show } = useAlert(
        ({ message }) => message,
        ({ type }) => ({ ...type, duration: 3000 })
    )
    const form = useForm<BaseSectionConfig>({
        resolver: zodResolver(baseSectionSchema),
        defaultValues: {
            sortOrder,
        },
    })

    const onSubmit = async (data: BaseSectionConfig) => {
        try {
            if (data.type === SectionType.FLEXIBLE_LAYOUT) {
                set(data, 'layouts', getDefaultLayoutConfig())
            }
            onAdd(data)
        } catch (e) {
            if (e instanceof FetchError || e instanceof Error) {
                show({
                    message: `${i18n.t('Could not create new item')}: ${e.message ?? e.toString()}`,
                    type: { critical: true },
                })
            }
        }
    }

    return (
        <FormProvider {...form}>
            <Modal
                position="middle"
                onClose={form.formState.isSubmitting ? undefined : onClose}
                hide={hide}
            >
                <ModalTitle>{i18n.t('Create Section')}</ModalTitle>
                <ModalContent>
                    <form className="flex flex-col gap-4">
                        <SectionIDField />
                        <RHFTextInputField
                            required
                            dataTest={'add-section-label'}
                            name="label"
                            label={i18n.t('Label')}
                        />
                        <SectionTypeSelector displayType={displayType} />
                    </form>
                </ModalContent>
                <ModalActions>
                    <ButtonStrip>
                        <Button
                            disabled={form.formState.isSubmitting}
                            onClick={onClose}
                        >
                            {i18n.t('Cancel')}
                        </Button>
                        <Button
                            dataTest={'add-section-button'}
                            loading={form.formState.isSubmitting}
                            primary
                            onClick={(_, e) => form.handleSubmit(onSubmit)(e)}
                        >
                            {form.formState.isSubmitting ||
                            form.formState.isSubmitting
                                ? i18n.t('Creating...')
                                : i18n.t('Create section')}
                        </Button>
                    </ButtonStrip>
                </ModalActions>
            </Modal>
        </FormProvider>
    )
}
