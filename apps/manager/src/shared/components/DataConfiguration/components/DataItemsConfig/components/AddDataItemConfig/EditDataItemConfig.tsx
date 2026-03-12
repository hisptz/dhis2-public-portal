import { Button, IconEdit16 } from '@dhis2/ui'

import { DataServiceDataSourceItemsConfig } from '@packages/shared/schemas'
import { useBoolean } from 'usehooks-ts'
import { DataItemConfigForm } from './components/DataItemConfigForm'

export function EditDataItemConfig({
    onUpdate,
    config,
    routeId,
}: {
    onUpdate: (data: DataServiceDataSourceItemsConfig) => void
    config: DataServiceDataSourceItemsConfig
    routeId: string | undefined
}) {
    const { value: hide, setTrue: onClose, setFalse: onShow } = useBoolean(true)
    return (
        <>
            {!hide && (
                <DataItemConfigForm
                    hide={hide}
                    data={config}
                    routeId={routeId}
                    onClose={onClose}
                    onSubmit={onUpdate}
                />
            )}
            <Button small onClick={onShow} icon={<IconEdit16 />} />
        </>
    )
}
