import { DetailedHTMLProps, forwardRef, HTMLAttributes } from 'react'
import { useController, useWatch } from 'react-hook-form'
import { IconCross24 } from '@dhis2/ui'
import i18n from '@dhis2/d2-i18n'
import {
    Responsive as ResponsiveGridLayout,
    useContainerWidth,
} from 'react-grid-layout'
import {
    FlexibleLayoutConfig,
    VisualizationDisplayItem,
    VisualizationItem,
} from '@packages/shared/schemas'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
import { MainVisualization } from './ModulesPage/components/Visualizations/MainVisualization'
import { fromPairs } from 'lodash'
import {
    ScreenSizeId,
    SUPPORTED_SCREEN_SIZES,
} from '@packages/shared/constants'
import { useManageSectionVisualizations } from './VisualizationModule/hooks/view'

function SectionItem({ item }: { item: VisualizationItem }) {
    return (
        <div className="flex flex-col justify-center items-center h-full w-full gap-2">
            <MainVisualization config={item} />
        </div>
    )
}

const GridItem = forwardRef<
    HTMLDivElement,
    {
        item: VisualizationItem
        onDelete: (id: string) => void
    } & DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>
>(function GridItem(
    {
        item,
        style,
        className,
        children,
        onDelete,
        ...rest
    }: {
        item: VisualizationItem
        onDelete: (id: string) => void
    } & DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>,
    ref
) {
    const handleDeleteClick = () => {
        onDelete(item.id)
    }

    const stopPropagation = (event: React.MouseEvent) => {
        event.stopPropagation()
    }

    const stopPropagationTouch = (event: React.TouchEvent) => {
        event.stopPropagation()
    }
    return (
        <div
            ref={ref}
            style={{ ...style }}
            data-prefix={item.id}
            prefix={item.id}
            className={`border-2 border-gray-400 rounded-md p-2 flex flex-col relative cursor-all-scroll ${className}`}
            {...rest}
        >
            <button
                onMouseDown={stopPropagation}
                onTouchStart={stopPropagationTouch}
                onClick={handleDeleteClick}
                className="absolute top-1 right-1 cursor-pointer"
                style={{
                    background: 'transparent',
                    border: 'none',
                    padding: 0,
                }}
                title={i18n.t('Remove visualization')}
            >
                <IconCross24 />
            </button>
            <SectionItem item={item} />
            {children}
        </div>
    )
})

export function SectionLayoutEditor({
    prefix,
    size,
}: {
    prefix: `config.sections.${number}`
    size: ScreenSizeId
}) {
    const { containerRef, width, mounted } = useContainerWidth()
    const { field } = useController<
        {
            config: {
                sections: {
                    layouts: FlexibleLayoutConfig
                }[]
            }
        },
        `config.sections.${number}.layouts`
    >({
        name: `${prefix}.layouts` as `config.sections.${number}.layouts`,
    })

    const { onRemoveVisualization } = useManageSectionVisualizations({
        prefix,
    })

    const visualizations = useWatch({
        name: `${prefix}.items` as `config.sections.${number}.items`,
    }) as VisualizationDisplayItem[] | undefined

    return (
        <div className="flex flex-col gap-2 w-full" ref={containerRef}>
            <div className="flex-1 flex justify-center w-full">
                <div className="bg-white w-full">
                    {mounted && (
                        <ResponsiveGridLayout
                            breakpoint={size}
                            key={
                                visualizations
                                    ?.map((v) => v.item.id)
                                    .join(',') || 'empty'
                            }
                            breakpoints={
                                fromPairs(
                                    SUPPORTED_SCREEN_SIZES.map((value) => {
                                        return [value.id, value.value]
                                    })
                                ) as { [key in ScreenSizeId]: number }
                            }
                            cols={
                                fromPairs(
                                    SUPPORTED_SCREEN_SIZES.map((value) => {
                                        return [value.id, value.cols]
                                    })
                                ) as { [key in ScreenSizeId]: number }
                            }
                            layouts={field.value as FlexibleLayoutConfig}
                            margin={[8, 8]}
                            className="layout"
                            rowHeight={80}
                            width={width}
                            onLayoutChange={(updatedLayout, actualValue) => {
                                field.onChange(actualValue)
                            }}
                        >
                            {visualizations?.map((item) => (
                                <GridItem
                                    key={item.item?.id}
                                    item={item.item as VisualizationItem}
                                    onDelete={onRemoveVisualization}
                                />
                            ))}
                        </ResponsiveGridLayout>
                    )}
                </div>
            </div>
        </div>
    )
}
