import i18n from '@dhis2/d2-i18n'
import { RHFSingleSelectField } from '@hisptz/dhis2-ui'
import React from 'react'
import { SectionDisplay, SectionType } from '@packages/shared/schemas'
import { startCase } from 'lodash'

export function SectionTypeSelector({
    displayType,
}: {
    displayType: SectionDisplay
}) {
    const options = Object.values(SectionType).map((type) => {
        return {
            label: i18n.t(startCase(type.toLowerCase())),
            value: type,
        }
    })

    const filteredOptions = options.filter((option) => {
        return displayType == SectionDisplay.HORIZONTAL
            ? option.value == SectionType.SINGLE_ITEM
            : true
    })

    return (
        <RHFSingleSelectField
            required
            dataTest={'section-display-select'}
            label={i18n.t('Type')}
            placeholder={i18n.t('Select type')}
            options={filteredOptions}
            name="type"
        />
    )
}
