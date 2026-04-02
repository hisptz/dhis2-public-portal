import { useEffect, useState } from 'react'
import { RHFCheckboxField, RHFTextInputField } from '@hisptz/dhis2-ui'
import i18n from '@dhis2/d2-i18n'
import { RHFRichTextAreaField } from '../../Fields/RHFRichTextAreaField'
import { useController, useFormContext, useWatch } from 'react-hook-form'
import { CheckboxField, Divider, Field, Radio } from '@dhis2/ui'
import { ItemsDisplay, VisualizationModule } from '@packages/shared/schemas'
import { startCase } from 'lodash'
import { RHFTextAreaField } from '../../Fields/RHFTextAreaField'
import { DimensionPeriodSelector } from './DimensionPeriodSelector'
import { DimensionPeriodTypeSelector } from './DimensionPeriodTypeSelector'
import { RHFMultiOrgUnitFieldSelector } from './RHFMultiOrgUnitFieldSelector'
import { MultiOrgUnitLevelSelector } from '../../DataConfiguration/components/DataItemsConfig/components/AddDataItemConfig/components/MultiOrgUnitLevelSelector'
import { DimensionPeriodCategorySelector } from './DimensionPeriodCategorySelector'

export function DashboardGeneralConfig() {
    const { field, fieldState } = useController<
        VisualizationModule,
        'config.groupDisplay'
    >({
        name: 'config.groupDisplay',
    })
    const { setValue, getValues } = useFormContext()

    const [limitOrgUnits, setLimitOrgUnits] = useState(() => {
        const orgUnitLevels = getValues('config.orgUnitConfig.orgUnitLevels')
        const orgUnits = getValues('config.orgUnitConfig.orgUnits')
        const singleSelection = getValues(
            'config.orgUnitConfig.singleSelection'
        )
        return !!(
            (orgUnitLevels && orgUnitLevels.length > 0) ||
            (orgUnits && orgUnits.length > 0) ||
            singleSelection
        )
    })

    const [limitPeriods, setLimitPeriods] = useState(() => {
        const categories = getValues('config.periodConfig.categories')
        const periodTypes = getValues('config.periodConfig.periodTypes')
        const periods = getValues('config.periodConfig.periods')
        const singleSelection = getValues('config.periodConfig.singleSelection')
        return !!(
            (categories && categories.length > 0) ||
            (periodTypes && periodTypes.length > 0) ||
            (periods && periods.length > 0) ||
            singleSelection
        )
    })

    useEffect(() => {
        const currentGrouped = getValues('config.grouped')
        if (
            currentGrouped === undefined ||
            currentGrouped === null ||
            currentGrouped === ''
        ) {
            setValue('config.grouped', false)
        }
    }, [setValue, getValues])

    const isGrouped = useWatch<VisualizationModule, 'config.grouped'>({
        name: 'config.grouped',
    })

    return (
        <div className="flex flex-col gap-2">
            <RHFTextInputField required name="label" label={i18n.t('Label')} />
            <RHFTextInputField
                required
                name="config.title"
                label={i18n.t('Title')}
            />
            {!isGrouped && (
                <div>
                    <RHFTextAreaField
                        autoGrow
                        rows={4}
                        name="config.shortDescription"
                        label={i18n.t('Short description')}
                    />
                    <RHFRichTextAreaField
                        name="config.description"
                        label={i18n.t('Description')}
                        dataTest="module-description"
                    />
                </div>
            )}
            <RHFCheckboxField
                name="config.showFilter"
                helpText={i18n.t(
                    'Enable to show filters(i.e period selector & location selector) for visualizations.'
                )}
                label={i18n.t('Display filters')}
            />
            <RHFCheckboxField
                name="config.grouped"
                helpText={i18n.t(
                    'Enable to organize visualizations into group like dashboards. Useful for separating different sets of visualizations.'
                )}
                label={i18n.t('Categorize visualizations into groups')}
            />

            <Divider />
            <h3 className="text-2xl">{i18n.t('Periods')}</h3>

            <CheckboxField
                checked={limitPeriods}
                helpText={i18n.t(
                    'Enable to restrict which periods users can select.'
                )}
                onChange={({ checked }: { checked: boolean }) => {
                    setLimitPeriods(checked)
                    if (!checked) {
                        setValue('config.periodConfig.categories', [], {
                            shouldDirty: true,
                        })
                        setValue('config.periodConfig.periodTypes', [], {
                            shouldDirty: true,
                        })
                        setValue('config.periodConfig.periods', [], {
                            shouldDirty: true,
                        })
                        setValue('config.periodConfig.singleSelection', false, {
                            shouldDirty: true,
                        })
                    }
                }}
                label={i18n.t('Limit period selections')}
            />

            {limitPeriods && (
                <>
                    <DimensionPeriodCategorySelector
                        categoriesField="config.periodConfig.categories"
                        periodTypesField="config.periodConfig.periodTypes"
                        periodsField="config.periodConfig.periods"
                        helpText={i18n.t(
                            'Choose whether to include relative periods, fixed periods, or both.'
                        )}
                    />

                    <DimensionPeriodTypeSelector
                        categoriesField="config.periodConfig.categories"
                        periodTypesField="config.periodConfig.periodTypes"
                        periodsField="config.periodConfig.periods"
                        helpText={i18n.t(
                            'Select the period types users can choose from, e.g. Monthly, Quarterly, Yearly.'
                        )}
                    />
                    <RHFCheckboxField
                        name="config.periodConfig.singleSelection"
                        label={i18n.t('Single period selection')}
                        helpText={i18n.t(
                            'When enabled, users can only select one period at a time.'
                        )}
                    />
                    <DimensionPeriodSelector
                        categoriesField="config.periodConfig.categories"
                        periodTypesField="config.periodConfig.periodTypes"
                        periodsField="config.periodConfig.periods"
                        helpText={i18n.t(
                            'Pin specific periods to restrict what users can select.'
                        )}
                    />
                </>
            )}

            <Divider />
            <h3 className="text-2xl">{i18n.t('Organisation units')}</h3>
            <CheckboxField
                checked={limitOrgUnits}
                helpText={i18n.t(
                    'Enable to restrict which organisation units users can select.'
                )}
                onChange={({ checked }: { checked: boolean }) => {
                    setLimitOrgUnits(checked)
                    if (!checked) {
                        setValue('config.orgUnitConfig.orgUnitLevels', [], {
                            shouldDirty: true,
                        })
                        setValue('config.orgUnitConfig.orgUnits', [], {
                            shouldDirty: true,
                        })
                        setValue(
                            'config.orgUnitConfig.singleSelection',
                            false,
                            { shouldDirty: true }
                        )
                    }
                }}
                label={i18n.t('Limit organisation unit selections')}
            />

            {limitOrgUnits && (
                <>
                    <MultiOrgUnitLevelSelector
                        name="config.orgUnitConfig.orgUnitLevels"
                        label={i18n.t('Organisation unit levels')}
                        helpText={i18n.t(
                            'Restrict data to specific levels in the organisation unit hierarchy.'
                        )}
                    />
                    <RHFCheckboxField
                        name="config.orgUnitConfig.singleSelection"
                        label={i18n.t('Single organisation unit selection')}
                        helpText={i18n.t(
                            'When enabled, users can only select one organisation unit at a time.'
                        )}
                    />
                    <RHFMultiOrgUnitFieldSelector
                        name="config.orgUnitConfig.orgUnits"
                        label={i18n.t('Organisation units')}
                        helpText={i18n.t(
                            'Limit access to specific organisation units. Leave empty to allow all units.'
                        )}
                        searchable
                    />
                </>
            )}
            <Divider />

            {isGrouped && (
                <div className="my-2">
                    <Field
                        {...field}
                        validationText={fieldState?.error?.message}
                        name="config.groupDisplay"
                        error={!!fieldState.error}
                        label={i18n.t('Group selector')}
                    >
                        <div className="flex gap-4 items-center">
                            {Object.values(ItemsDisplay).map((type) => (
                                <Radio
                                    onChange={({ checked }) => {
                                        if (checked) {
                                            field.onChange(type)
                                        }
                                    }}
                                    checked={field.value === type}
                                    label={i18n.t(
                                        startCase(type.toLowerCase())
                                    )}
                                    value={type}
                                />
                            ))}
                        </div>
                    </Field>
                </div>
            )}
        </div>
    )
}
