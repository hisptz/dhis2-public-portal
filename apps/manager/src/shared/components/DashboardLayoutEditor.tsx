import React, {
    DetailedHTMLProps,
    forwardRef,
    HTMLAttributes,
    memo,
    useCallback,
    useMemo,
} from 'react'
import i18n from '@dhis2/d2-i18n'
import { useController, useWatch } from 'react-hook-form'
import { IconCross24 } from '@dhis2/ui'
import {
    Responsive as ResponsiveGridLayout,
    useContainerWidth,
    verticalCompactor,
} from 'react-grid-layout'
import { debounce, fromPairs } from 'lodash'
import {
    VisualizationItem,
    VisualizationModule,
} from '@packages/shared/schemas'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
import { MainVisualization } from './ModulesPage/components/Visualizations/MainVisualization'
import { ErrorBoundary } from 'react-error-boundary'
import { VisualizationError } from './ModulesPage/components/Visualizations/components/VisualizationError'
import { useManageVisualizations } from './VisualizationModule/hooks/view'
import {
    ScreenSizeId,
    SUPPORTED_SCREEN_SIZES,
} from '@packages/shared/constants'

function DashboardItemComponent({ item }: { item: VisualizationItem }) {
    return (
        <div className="flex flex-col justify-center items-center h-full w-full overflow-y-auto gap-2">
            <ErrorBoundary FallbackComponent={VisualizationError}>
                <MainVisualization config={item} />
            </ErrorBoundary>
        </div>
    )
}

const DashboardItem = memo(DashboardItemComponent)

const GridItem = forwardRef<
    HTMLDivElement,
    {
        item: VisualizationItem
        onDelete: (id: string) => void
    } & DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>
>(function GridItem(
    {
        item,
        onDelete,
        style,
        className,
        children,
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
            <DashboardItem item={item} />
            {children}
        </div>
    )
})

export function DashboardLayoutEditor({
    prefix,
    size,
}: {
    prefix?: `config.groups.${number}`
    size: ScreenSizeId
}) {
    const { width, containerRef, mounted } = useContainerWidth()

    const { onRemoveVisualization } = useManageVisualizations({
        prefix,
    })

    const { field } = useController<
        VisualizationModule,
        'config.layouts' | `config.groups.${number}.layouts`
    >({
        name: !prefix ? 'config.layouts' : `${prefix}.layouts`,
    })

    const visualizations = useWatch<
        VisualizationModule,
        'config.items' | `config.groups.${number}.items`
    >({
        name: !prefix ? 'config.items' : `${prefix}.items`,
    })

    const debouncedLayoutChange = useMemo(
        () =>
            debounce((updatedLayout, actualValue) => {
                field.onChange(actualValue)
            }, 100),
        [field]
    )

    const handleLayoutChange = useCallback(
        (updatedLayout, actualValue) => {
            debouncedLayoutChange(updatedLayout, actualValue)
        },
        [debouncedLayoutChange]
    )

    return (
        <div className="flex flex-col gap-2 w-full">
            <div className="flex-1 flex justify-center w-full">
                <div ref={containerRef} className="bg-white w-full">
                    {mounted && (
                        <ResponsiveGridLayout
                            breakpoint={size}
                            compactor={verticalCompactor}
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
                            layouts={field.value}
                            margin={[8, 8]}
                            className="layout"
                            rowHeight={80}
                            width={width}
                            onLayoutChange={handleLayoutChange}
                        >
                            {visualizations?.map((item) => (
                                <GridItem
                                    key={item.item.id}
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
