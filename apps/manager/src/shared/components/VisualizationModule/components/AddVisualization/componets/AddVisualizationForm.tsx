import { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'

import {
    Button,
    ButtonStrip,
    CheckboxField,
    Modal,
    ModalActions,
    ModalContent,
    ModalTitle,
} from '@dhis2/ui'
import i18n from '@dhis2/d2-i18n'
import { RHFCheckboxField, RHFSingleSelectField } from '@hisptz/dhis2-ui'
import { VisualizationSelector } from './VisualizationSelector'
import {
    VisualizationDisplayItemType,
    VisualizationItem,
    visualizationItemSchema,
} from '@packages/shared/schemas'
import { RHFTextAreaField } from '../../../../Fields/RHFTextAreaField'
import { DimensionPeriodCategorySelector } from '../../DimensionPeriodCategorySelector'
import { DimensionPeriodSelector } from '../../DimensionPeriodSelector'
import { DimensionPeriodTypeSelector } from '../../DimensionPeriodTypeSelector'
import { RHFMultiOrgUnitFieldSelector } from '../../RHFMultiOrgUnitFieldSelector'
import { MultiOrgUnitLevelSelector } from '@/shared/components/MultiOrgUnitLevelSelector'

export function AddVisualizationForm({
    visualization,
    hide,
    onClose,
    onSubmit,
}: {
    visualization?: VisualizationItem
    hide: boolean
    onClose: () => void
    onSubmit: (visualization: VisualizationItem) => void
}) {
    const form = useForm<VisualizationItem>({
        resolver: zodResolver(visualizationItemSchema),
        defaultValues: visualization,
    })

    const [limitPeriods, setLimitPeriods] = useState(() => {
        const categories = visualization?.periodConfig?.categories
        const periodTypes = visualization?.periodConfig?.periodTypes
        const periods = visualization?.periodConfig?.periods
        const singleSelection = visualization?.periodConfig?.singleSelection
        return !!(
            (categories && categories.length > 0) ||
            (periodTypes && periodTypes.length > 0) ||
            (periods && periods.length > 0) ||
            singleSelection
        )
    })

    const [limitOrgUnits, setLimitOrgUnits] = useState(() => {
        const orgUnitLevels = visualization?.orgUnitConfig?.orgUnitLevels
        const orgUnits = visualization?.orgUnitConfig?.orgUnits
        const singleSelection = visualization?.orgUnitConfig?.singleSelection
        return !!(
            (orgUnitLevels && orgUnitLevels.length > 0) ||
            (orgUnits && orgUnits.length > 0) ||
            singleSelection
        )
    })

    const onAdd = (visualization: VisualizationItem) => {
        onSubmit(visualization)
        onClose()
    }

    const action = visualization ? 'Update' : 'Add'

    return (
        <FormProvider {...form}>
            <Modal position="middle" onClose={onClose} hide={hide}>
                <ModalTitle>
                    {i18n.t('{{action}} visualization', { action })}
                </ModalTitle>
                <ModalContent>
                    <form className="flex flex-col gap-4">
                        <RHFSingleSelectField
                            required
                            dataTest={'visualization-type-select'}
                            label={i18n.t('Type')}
                            options={[
                                {
                                    label: i18n.t('Visualization'),
                                    value: VisualizationDisplayItemType.CHART,
                                },
                                {
                                    label: i18n.t('Map'),
                                    value: VisualizationDisplayItemType.MAP,
                                },
                            ]}
                            name="type"
                        />
                        <VisualizationSelector />
                        <RHFTextAreaField
                            name="caption"
                            label={i18n.t('Caption')}
                        />

                        <CheckboxField
                            checked={limitPeriods}
                            helpText={i18n.t(
                                'Enable to restrict which periods users can select.'
                            )}
                            onChange={({ checked }: { checked: boolean }) => {
                                setLimitPeriods(checked)
                                if (!checked) {
                                    form.setValue(
                                        'periodConfig.categories',
                                        [],
                                        { shouldDirty: true }
                                    )
                                    form.setValue(
                                        'periodConfig.periodTypes',
                                        [],
                                        { shouldDirty: true }
                                    )
                                    form.setValue('periodConfig.periods', [], {
                                        shouldDirty: true,
                                    })
                                    form.setValue(
                                        'periodConfig.singleSelection',
                                        false,
                                        { shouldDirty: true }
                                    )
                                }
                            }}
                            label={i18n.t('Limit period selections')}
                        />

                        {limitPeriods && (
                            <div className="flex flex-col gap-2 pl-4 border-l-2 border-gray-200">
                                <DimensionPeriodCategorySelector
                                    categoriesField="periodConfig.categories"
                                    periodTypesField="periodConfig.periodTypes"
                                    periodsField="periodConfig.periods"
                                    helpText={i18n.t(
                                        'Choose whether to include relative periods, fixed periods, or both.'
                                    )}
                                />

                                <DimensionPeriodTypeSelector
                                    categoriesField="periodConfig.categories"
                                    periodTypesField="periodConfig.periodTypes"
                                    periodsField="periodConfig.periods"
                                    helpText={i18n.t(
                                        'Select the period types users can choose from, e.g. Monthly, Quarterly, Yearly.'
                                    )}
                                />
                                <RHFCheckboxField
                                    name="periodConfig.singleSelection"
                                    label={i18n.t('Single period selection')}
                                    helpText={i18n.t(
                                        'When enabled, users can only select one period at a time.'
                                    )}
                                />
                                <DimensionPeriodSelector
                                    categoriesField="periodConfig.categories"
                                    periodTypesField="periodConfig.periodTypes"
                                    periodsField="periodConfig.periods"
                                    helpText={i18n.t(
                                        'Pin specific periods to restrict what users can select.'
                                    )}
                                />
                            </div>
                        )}

                        <CheckboxField
                            checked={limitOrgUnits}
                            helpText={i18n.t(
                                'Enable to restrict which organisation units users can select.'
                            )}
                            onChange={({ checked }: { checked: boolean }) => {
                                setLimitOrgUnits(checked)
                                if (!checked) {
                                    form.setValue(
                                        'orgUnitConfig.orgUnitLevels',
                                        [],
                                        { shouldDirty: true }
                                    )
                                    form.setValue(
                                        'orgUnitConfig.orgUnits',
                                        [],
                                        { shouldDirty: true }
                                    )
                                    form.setValue(
                                        'orgUnitConfig.singleSelection',
                                        false,
                                        { shouldDirty: true }
                                    )
                                }
                            }}
                            label={i18n.t('Limit organisation unit selections')}
                        />

                        {limitOrgUnits && (
                            <div className="flex flex-col gap-2 pl-4 border-l-2 border-gray-200">
                                <MultiOrgUnitLevelSelector
                                    name="orgUnitConfig.orgUnitLevels"
                                    label={i18n.t('Organisation unit levels')}
                                    helpText={i18n.t(
                                        'Restrict data to specific levels in the organisation unit hierarchy.'
                                    )}
                                />
                                <RHFCheckboxField
                                    name="orgUnitConfig.singleSelection"
                                    label={i18n.t(
                                        'Single organisation unit selection'
                                    )}
                                    helpText={i18n.t(
                                        'When enabled, users can only select one organisation unit at a time.'
                                    )}
                                />
                                <RHFMultiOrgUnitFieldSelector
                                    name="orgUnitConfig.orgUnits"
                                    label={i18n.t('Organisation units')}
                                    helpText={i18n.t(
                                        'Limit access to specific organisation units. Leave empty to allow all units.'
                                    )}
                                    searchable
                                />
                            </div>
                        )}
                    </form>
                </ModalContent>
                <ModalActions>
                    <ButtonStrip>
                        <Button onClick={onClose}>{i18n.t('Cancel')}</Button>
                        <Button
                            dataTest={'button-add-visualization'}
                            primary
                            onClick={(_, e) => form.handleSubmit(onAdd)(e)}
                        >
                            {action}
                        </Button>
                    </ButtonStrip>
                </ModalActions>
            </Modal>
        </FormProvider>
    )
}
