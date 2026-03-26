import { FormProvider, useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'

import {
    Button,
    ButtonStrip,
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
import { MultiOrgUnitLevelSelector } from '@/shared/components/DataConfiguration/components/DataItemsConfig/components/AddDataItemConfig/components/MultiOrgUnitLevelSelector'
import { DimensionPeriodCategorySelector } from '../../DimensionPeriodCategorySelector'
import { DimensionPeriodSelector } from '../../DimensionPeriodSelector'
import { DimensionPeriodTypeSelector } from '../../DimensionPeriodTypeSelector'
import { RHFMultiOrgUnitFieldSelector } from '../../RHFMultiOrgUnitFieldSelector'

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

                        <DimensionPeriodSelector
                            periodTypesField="periodConfig.periodTypes"
                            periodsField="periodConfig.periods"
                            helpText={i18n.t(
                                'Pin specific periods to restrict what users can select.'
                            )}
                        />
                        <RHFCheckboxField
                            name="periodConfig.singleSelection"
                            label={i18n.t('Single period selection')}
                            helpText={i18n.t(
                                'When enabled, users can only select one period at a time.'
                            )}
                        />
                        <MultiOrgUnitLevelSelector
                            name="orgUnitConfig.orgUnitLevels"
                            label={i18n.t('Organisation unit levels')}
                            helpText={i18n.t(
                                'Restrict data to specific levels in the organisation unit hierarchy.'
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
                        <RHFTextAreaField
                            name="caption"
                            label={i18n.t('Caption')}
                        />
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
