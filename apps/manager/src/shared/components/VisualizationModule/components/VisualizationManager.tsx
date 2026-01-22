import { useCallback, useState } from 'react'
import i18n from '@dhis2/d2-i18n'
import {
    Button,
    ButtonStrip,
    Card,
    Divider,
    IconArrowLeft24,
    SingleSelectField,
    SingleSelectOption,
} from '@dhis2/ui'
import { useFormContext } from 'react-hook-form'
import { VisualizationModule } from '@packages/shared/schemas'
import { useAlert } from '@dhis2/app-runtime'
import { AddVisualization } from './AddVisualization/AddVisualization'
import { DashboardLayoutEditor } from '../../DashboardLayoutEditor'
import { useRouter } from '@tanstack/react-router'
import { useSaveModule } from '../../ModulesPage/hooks/save'
import {
    ScreenSizeId,
    SUPPORTED_SCREEN_SIZES,
} from '@packages/shared/constants'

interface VisualizationLayoutEditorProps {
    prefix?: `config.groups.${number}`
    onCancel: () => void
}

export function VisualizationManager({
    prefix,
    onCancel,
}: VisualizationLayoutEditorProps) {
    const [size, setSize] = useState<ScreenSizeId>(SUPPORTED_SCREEN_SIZES[0].id)
    const { handleSubmit, formState, reset } =
        useFormContext<VisualizationModule>()
    const { show } = useAlert(
        ({ message }) => message,
        ({ type }) => ({ ...type, duration: 3000 })
    )
    const router = useRouter()
    const { save } = useSaveModule()

    const handleFormSubmit = useCallback(
        async (data: VisualizationModule) => {
            try {
                await save(data)
                reset(data, { keepDirty: false, keepTouched: true })
                router.history.back()
            } catch (error) {
                show({
                    message: i18n.t('Failed to save visualization', { error }),
                    type: { critical: true },
                })
            }
        },
        [reset, router.history, save, show]
    )

    const handleFormError = useCallback(
        (errors: any) => {
            console.error('Form validation errors:', errors)
            show({
                message: i18n.t(
                    'Please fix the validation errors before saving'
                ),
                type: { critical: true },
            })
        },
        [show]
    )

    return (
        <div className="w-full h-full flex flex-col gap-4">
            <div className="w-full flex flex-col">
                <div className="mb-2">
                    <Button
                        onClick={() => {
                            router.history.back()
                        }}
                        icon={<IconArrowLeft24 />}
                    >
                        {i18n.t('Back')}
                    </Button>
                </div>
                <div className="flex justify-between gap-8">
                    <h2 className="text-2xl">
                        {i18n.t('Manage visualization')}
                    </h2>
                    <ButtonStrip end>
                        <Button onClick={onCancel}>{i18n.t('Cancel')}</Button>
                        <Button
                            primary
                            loading={formState.isSubmitting}
                            disabled={
                                !formState.isDirty || formState.isSubmitting
                            }
                            onClick={() =>
                                handleSubmit(
                                    handleFormSubmit,
                                    handleFormError
                                )()
                            }
                        >
                            {i18n.t('Save changes')}
                        </Button>
                    </ButtonStrip>
                </div>
                <Divider />
            </div>
            <div className="w-full flex-1 flex flex-col items-center">
                <Card className="p-4 mb-4 max-h-[100px] min-h-[100px]">
                    <div className="flex flex-row gap-8">
                        <div className="max-w-[300px] min-w-[300px]">
                            <SingleSelectField
                                dataTest={'screen-size-select'}
                                selected={size.toString()}
                                onChange={({ selected }) =>
                                    setSize(selected as ScreenSizeId)
                                }
                                label={i18n.t('Select screen size')}
                            >
                                {SUPPORTED_SCREEN_SIZES.map(
                                    ({ name, value, id }) => (
                                        <SingleSelectOption
                                            key={value.toString()}
                                            label={name}
                                            value={id}
                                        />
                                    )
                                )}
                            </SingleSelectField>
                        </div>
                        <div className="flex-col">
                            <h5 className="text-sm pb-5">{i18n.t('')}</h5>
                            <AddVisualization prefix={prefix} />
                        </div>
                    </div>
                </Card>
                <DashboardLayoutEditor size={size} prefix={prefix} />
                <div className="py-4 w-full">
                    <ButtonStrip end>
                        <Button onClick={onCancel}>{i18n.t('Cancel')}</Button>
                        <Button
                            primary
                            loading={formState.isSubmitting}
                            disabled={
                                !formState.isDirty || formState.isSubmitting
                            }
                            onClick={() =>
                                handleSubmit(
                                    handleFormSubmit,
                                    handleFormError
                                )()
                            }
                        >
                            {i18n.t('Save changes')}
                        </Button>
                    </ButtonStrip>
                </div>
            </div>
        </div>
    )
}
