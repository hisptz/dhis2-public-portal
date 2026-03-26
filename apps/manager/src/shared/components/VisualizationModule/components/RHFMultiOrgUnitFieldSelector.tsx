import i18n from '@dhis2/d2-i18n'
import { useDataQuery } from '@dhis2/app-runtime'
import { Field, Button } from '@dhis2/ui'
import { OrgUnitSelectorModal } from '@hisptz/dhis2-ui'
import { useMemo, useState } from 'react'
import { useFormContext, useController } from 'react-hook-form'
import { IconDimensionOrgUnit16 } from '@dhis2/ui'

const query = {
    data: {
        resource: 'organisationUnits',
        params: ({ ids }: { ids: string[] }) => ({
            filter: `id:in:[${ids.join(',')}]`,
            fields: ['id', 'displayName', 'path'],
        }),
    },
}

type Props = {
    name: string
    label?: string
    required?: boolean
    helpText?: string
    placeholder?: string
    singleSelection?: boolean
    filterByGroups?: string[]
    limitSelectionToLevels?: number[]
    searchable?: boolean
    showGroups?: boolean
    showLevels?: boolean
    showUserOptions?: boolean
}

type orgUnit = {
    id: string
    displayName: string
    path: string
}

type OrgUnitSelection = {
    orgUnits: orgUnit[]
}

export function RHFMultiOrgUnitFieldSelector({
    name,
    label,
    required,
    helpText,
    placeholder,
    singleSelection,
    filterByGroups,
    limitSelectionToLevels,
    searchable,
    showGroups,
    showLevels,
    showUserOptions,
}: Props) {
    const { control } = useFormContext()
    const [modalOpen, setModalOpen] = useState(false)
    const [selectedOrgUnits, setSelectedOrgUnits] = useState<
        OrgUnitSelection | undefined
    >()

    const {
        field: { value, onChange },
        fieldState: { error },
    } = useController({
        name,
        control,
        rules: {
            required: required ? i18n.t('This field is required') : false,
        },
    })
    const existingIds: string[] = useMemo(() => {
        if (
            Array.isArray(value) &&
            value.length > 0 &&
            typeof value[0] === 'string' &&
            !selectedOrgUnits
        ) {
            return value
        }
        return []
    }, [value])

    const { loading: loadingOrgUnits } = useDataQuery<{
        data: { organisationUnits: orgUnit[] }
    }>(query, {
        lazy: existingIds.length === 0,
        variables: { ids: existingIds },
        onComplete: (data) => {
            const orgUnits = data?.data?.organisationUnits ?? []
            if (orgUnits.length > 0) {
                setSelectedOrgUnits({ orgUnits })
            }
        },
    })

    const handleUpdate = (
        newValue: OrgUnitSelection | Record<string, unknown>
    ) => {
        const orgUnits = (newValue.orgUnits as orgUnit[]) ?? []
        setSelectedOrgUnits(newValue as OrgUnitSelection)
        onChange(orgUnits.map((ou) => ou.id))
        setModalOpen(false)
    }

    const handleClearAll = () => {
        setSelectedOrgUnits(undefined)
        onChange([])
    }

    return (
        <>
            {modalOpen && (
                <OrgUnitSelectorModal
                    hide={!modalOpen}
                    onClose={() => setModalOpen(false)}
                    onUpdate={(
                        val: OrgUnitSelection | Record<string, unknown>
                    ) => handleUpdate(val)}
                    value={selectedOrgUnits as Record<string, unknown>}
                    searchable={searchable}
                    singleSelection={singleSelection}
                    filterByGroups={filterByGroups}
                    limitSelectionToLevels={limitSelectionToLevels}
                    showLevels={showLevels}
                    showGroups={showGroups}
                    showUserOptions={showUserOptions}
                />
            )}

            <Field
                label={label}
                helpText={helpText}
                required={required}
                error={!!error}
                validationText={error?.message}
            >
                <div className="flex flex-col gap-2">
                    <div className="inline-flex">
                        <Button
                            loading={loadingOrgUnits}
                            icon={<IconDimensionOrgUnit16 />}
                            onClick={() => setModalOpen(true)}
                        >
                            {placeholder ??
                                i18n.t(
                                    !!selectedOrgUnits &&
                                        selectedOrgUnits?.orgUnits.length > 0
                                        ? 'Change organisation unit'
                                        : 'Select organisation unit'
                                )}
                        </Button>
                    </div>

                    {!!selectedOrgUnits &&
                        selectedOrgUnits?.orgUnits.length > 0 && (
                            <div className="flex gap-1 items-baseline text-xs flex-wrap">
                                <span className="text-gray-700 shrink-0">
                                    {i18n.t('Selected:')}
                                </span>
                                <span className="text-gray-700">
                                    {selectedOrgUnits?.orgUnits
                                        .map((ou) => ou.displayName)
                                        .join(', ')}
                                </span>
                                <span
                                    className="text-xs underline cursor-pointer text-gray-700 shrink-0 ml-1"
                                    onClick={handleClearAll}
                                >
                                    {i18n.t('Clear')}
                                </span>
                            </div>
                        )}
                </div>
            </Field>
        </>
    )
}
