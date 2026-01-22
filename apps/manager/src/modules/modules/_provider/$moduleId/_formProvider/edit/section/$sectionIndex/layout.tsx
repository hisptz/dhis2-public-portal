import { createFileRoute, useNavigate, useParams } from '@tanstack/react-router'
import React, { useState } from 'react'
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
import { z } from 'zod'
import { AppModule } from '@packages/shared/schemas'
import { SectionLayoutEditor } from '../../../../../../../../shared/components/SectionLayoutEditor'
import { useSaveModule } from '../../../../../../../../shared/components/ModulesPage/hooks/save'
import { useAlert } from '@dhis2/app-runtime'
import { AddSectionVisualization } from '../../../../../../../../shared/components/VisualizationModule/components/AddVisualization/AddVisualization'
import {
    ScreenSizeId,
    SUPPORTED_SCREEN_SIZES,
} from '@packages/shared/constants'

const searchSchema = z.object({
    subGroupIndex: z.number().optional(),
})

export const Route = createFileRoute(
    '/modules/_provider/$moduleId/_formProvider/edit/section/$sectionIndex/layout'
)({
    component: RouteComponent,
    validateSearch: searchSchema,
    params: {
        parse: (rawParams) => {
            return {
                ...rawParams,
                sectionIndex: parseInt(rawParams.sectionIndex),
            }
        },
        stringify: (params) => {
            return {
                ...params,
                sectionIndex: params.sectionIndex.toString(),
            }
        },
    },
})

function RouteComponent() {
    const { moduleId, sectionIndex } = useParams({
        from: '/modules/_provider/$moduleId/_formProvider/edit/section/$sectionIndex/layout',
    })
    const { resetField } = useFormContext<AppModule>()
    const navigate = useNavigate()

    const goBack = () => {
        navigate({
            to: '/modules/$moduleId/edit/section/$sectionIndex',
            params: { moduleId, sectionIndex },
        })
    }

    const { save } = useSaveModule()
    const { handleSubmit, formState, reset } = useFormContext<AppModule>()
    const { show } = useAlert(
        ({ message }) => message,
        ({ type }) => ({ ...type, duration: 3000 })
    )
    const [size, setSize] = useState<ScreenSizeId>(SUPPORTED_SCREEN_SIZES[0].id)

    const onError = (error) => {
        console.error('Form validation errors:', error)
        show({
            message: i18n.t('Please fix the validation errors before saving'),
            type: { critical: true },
        })
    }

    const onSubmit = async (data: AppModule) => {
        try {
            await save(data)
            reset(data)
            goBack()
        } catch (error) {
            show({
                message: i18n.t('Failed to save section', error),
                type: { critical: true },
            })
        }
    }

    return (
        <div className="w-full h-full flex flex-col gap-4">
            <div className="w-full flex flex-col">
                <div className="mb-2">
                    <Button
                        onClick={() => {
                            goBack()
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
                        <Button
                            onClick={() => {
                                resetField(
                                    `config.sections.${sectionIndex}.layouts`
                                )
                                goBack()
                            }}
                        >
                            {i18n.t('Cancel')}
                        </Button>
                        <Button
                            primary
                            loading={formState.isSubmitting}
                            disabled={
                                !formState.isDirty || formState.isSubmitting
                            }
                            onClick={() => {
                                handleSubmit(onSubmit, onError)()
                            }}
                        >
                            {i18n.t('Save changes')}
                        </Button>
                    </ButtonStrip>
                </div>
                <Divider />
            </div>
            <div className="w-full flex-1">
                <Card className="p-4 mb-4 max-h-[100px]  min-h-[100px] ">
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
                                {SUPPORTED_SCREEN_SIZES.map(({ name, id }) => (
                                    <SingleSelectOption
                                        key={id}
                                        label={name}
                                        value={id}
                                    />
                                ))}
                            </SingleSelectField>
                        </div>
                        <div className="flex-col">
                            <h5 className="text-sm pb-5">{i18n.t('')}</h5>
                            <AddSectionVisualization
                                prefix={`config.sections.${sectionIndex}`}
                            />
                        </div>
                    </div>
                </Card>
                <SectionLayoutEditor
                    size={size}
                    prefix={`config.sections.${sectionIndex}`}
                />
            </div>
            <div className="py-4">
                <ButtonStrip end>
                    <Button
                        onClick={() => {
                            resetField(
                                `config.sections.${sectionIndex}.layouts`
                            )
                            goBack()
                        }}
                    >
                        {i18n.t('Cancel')}
                    </Button>
                    <Button
                        primary
                        loading={formState.isSubmitting}
                        disabled={!formState.isDirty || formState.isSubmitting}
                        onClick={() => {
                            handleSubmit(onSubmit, onError)()
                        }}
                    >
                        {i18n.t('Save changes')}
                    </Button>
                </ButtonStrip>
            </div>
        </div>
    )
}
