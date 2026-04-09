import { SimpleTable } from '@hisptz/dhis2-ui'
import i18n from '@dhis2/d2-i18n'
import { DisplayItem, DisplayItemType } from '@packages/shared/schemas'
import { capitalize, first } from 'lodash-es'
import { VisualizationNameResolver } from '../../../../VisualizationNameResolver'

export function SectionVisualizations({
    visualizations,
}: {
    visualizations: Array<DisplayItem & { actions: React.ReactNode }>
}) {
    const columns = [
        {
            label: i18n.t('Name'),
            key: 'name',
        },
        {
            label: i18n.t('Type'),
            key: 'type',
        },
        ...(first(visualizations)?.type ===
        DisplayItemType.HIGHLIGHTED_SINGLE_VALUE
            ? [{ label: i18n.t('Icon'), key: 'icon' }]
            : []),
        {
            label: i18n.t('Caption'),
            key: 'caption',
        },
        {
            label: i18n.t('Actions'),
            key: 'actions',
        },
    ]
    const rows = visualizations
        .filter(
            (vis) =>
                vis.type === DisplayItemType.VISUALIZATION ||
                vis.type === DisplayItemType.HIGHLIGHTED_SINGLE_VALUE
        )
        .map((vis) => {
            if (vis.type === DisplayItemType.VISUALIZATION) {
                return {
                    id: vis.item.id,
                    name: <VisualizationNameResolver id={vis.item.id} />,
                    type: capitalize(vis.item.type),
                    caption: vis.item.caption || 'N/A',
                    actions: vis.actions,
                }
            } else {
                return {
                    id: vis.item.id,
                    name: <VisualizationNameResolver id={vis.item.id} />,
                    type: capitalize(vis.type),
                    icon:
                        vis.type === DisplayItemType.HIGHLIGHTED_SINGLE_VALUE
                            ? (vis.item.icon ?? '')
                            : '',
                    caption: 'Single Value',
                    actions: vis.actions,
                }
            }
        })

    return <SimpleTable columns={columns} rows={rows} />
}
