import i18n from '@dhis2/d2-i18n'
import { Button, ButtonStrip, Divider, IconLayoutColumns24 } from '@dhis2/ui'
import { DashboardVisualizations } from './components/DashboardVisualizations'
import { useFieldArray, useWatch } from 'react-hook-form'
import {
    DisplayItem,
    DisplayItemType,
    VisualizationItem,
    VisualizationModule,
} from '@packages/shared/schemas'
import { useNavigate, useParams } from '@tanstack/react-router'
import { VisualizationNameResolver } from '../../../VisualizationNameResolver'
import { capitalize } from 'lodash'

export function ModuleVisualizationsConfig() {
    const { moduleId } = useParams({
        from: '/modules/_provider/$moduleId/_formProvider/edit/',
    })
    const navigate = useNavigate()
    const hasGroups = useWatch<VisualizationModule, 'config.grouped'>({
        name: 'config.grouped',
    })

    const { fields } = useFieldArray<VisualizationModule, 'config.items'>({
        name: 'config.items',
        keyName: 'fieldId' as unknown as 'id',
    })

    if (hasGroups) {
        return null
    }

    const rows = fields
        .filter((field) => field.type === DisplayItemType.VISUALIZATION)
        .map((field) => {
            const visualizationField = field as DisplayItem & {
                type: DisplayItemType.VISUALIZATION
                item: VisualizationItem
            }
            const visId = visualizationField.item.id
            return {
                ...visualizationField.item,
                type: capitalize(visualizationField.item.type),
                id: visId,
                name: <VisualizationNameResolver id={field.item.id} />,
            }
        })

    return (
        <div className="flex-1 w-full flex flex-col gap-2">
            <div className="flex items-center justify-between">
                <h3 className="text-2xl">{i18n.t('Visualizations')}</h3>
                <ButtonStrip end>
                    <Button
                        onClick={() =>
                            navigate({
                                to: '/modules/$moduleId/edit/layout',
                                params: { moduleId },
                            })
                        }
                        icon={<IconLayoutColumns24 />}
                    >
                        {i18n.t('Manage visualizations')}
                    </Button>
                </ButtonStrip>
            </div>
            <Divider />
            <DashboardVisualizations visualizations={rows} />
        </div>
    )
}
