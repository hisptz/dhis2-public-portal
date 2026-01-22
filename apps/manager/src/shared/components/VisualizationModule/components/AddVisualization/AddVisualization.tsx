import { useBoolean } from 'usehooks-ts'
import { AddVisualizationForm } from './componets/AddVisualizationForm'
import { Button, IconAdd24 } from '@dhis2/ui'
import React from 'react'
import i18n from '@dhis2/d2-i18n'
import {
    useManageSectionVisualizations,
    useManageVisualizations,
} from '../../hooks/view'

export function AddSectionVisualization({
    prefix,
}: {
    prefix: `config.sections.${number}`
}) {
    const { value: hide, setTrue: onHide, setFalse: onShow } = useBoolean(true)

    const { onAddVisualization } = useManageSectionVisualizations({
        prefix,
    })

    return (
        <>
            {!hide && (
                <AddVisualizationForm
                    hide={hide}
                    onClose={onHide}
                    onSubmit={onAddVisualization}
                />
            )}
            <Button onClick={onShow} icon={<IconAdd24 />}>
                {i18n.t('Add a new visualization')}
            </Button>
        </>
    )
}

export function AddVisualization({
    prefix,
}: {
    prefix?: `config.groups.${number}`
}) {
    const { value: hide, setTrue: onHide, setFalse: onShow } = useBoolean(true)

    const { onAddVisualization } = useManageVisualizations({
        prefix,
    })

    return (
        <>
            {!hide && (
                <AddVisualizationForm
                    hide={hide}
                    onClose={onHide}
                    onSubmit={onAddVisualization}
                />
            )}
            <Button onClick={onShow} icon={<IconAdd24 />}>
                {i18n.t('Add a new visualization')}
            </Button>
        </>
    )
}
