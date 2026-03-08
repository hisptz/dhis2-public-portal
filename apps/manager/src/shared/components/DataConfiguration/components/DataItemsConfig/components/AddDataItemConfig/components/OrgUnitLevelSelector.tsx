import { useFormContext, useController } from 'react-hook-form'
import { useDataQuery } from '@dhis2/app-runtime'
import { NoticeBox, SingleSelectField, SingleSelectOption } from '@dhis2/ui'
import i18n from '@dhis2/d2-i18n'

const query = {
    data: {
        resource: 'filledOrganisationUnitLevels',
        params: {
            fields: ['id', 'name', 'level'],
            order: 'level:asc',
        },
    },
}

type Props = {
    name: string
    label?: string
    helpText?: string
    required?: boolean
    disabled?: boolean
}

export const OrgUnitLevelSelector = ({
    name,
    label,
    helpText,
    required,
    disabled,
}: Props) => {
    const { control } = useFormContext()

    const {
        field,
        fieldState: { error },
    } = useController({
        name,
        control,
    })

    const {
        data,
        loading,
        error: queryError,
    } = useDataQuery<{ data: { name: string; level: number; id: string }[] }>(
        query
    )

    const levels = data?.data ?? []

    if (loading && !!field.value) {
        return (
            <NoticeBox title={i18n.t('Loading sources')}>
                {i18n.t('Loading organisation unit levels...')}
            </NoticeBox>
        )
    }

    if (queryError) {
        return (
            <NoticeBox error title={i18n.t('Failed')}>
                {i18n.t(queryError.message)}
            </NoticeBox>
        )
    }

    return (
        <SingleSelectField
            label={label}
            helpText={helpText}
            required={required}
            disabled={disabled || loading}
            loading={loading}
            error={!!error}
            validationText={error?.message}
            selected={
                field.value !== undefined && field.value !== null
                    ? String(field.value)
                    : ''
            }
            onChange={({ selected }) => {
                field.onChange(selected ? Number(selected) : null)
            }}
        >
            {levels?.map((level) => (
                <SingleSelectOption
                    key={level.id}
                    label={`${level.name}`}
                    value={String(level.level)}
                />
            ))}
        </SingleSelectField>
    )
}
