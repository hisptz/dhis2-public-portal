'use client'
import {
    Responsive as ResponsiveGridLayout,
    useContainerWidth,
} from 'react-grid-layout'
import { FlexibleLayoutConfig } from '@packages/shared/schemas'
import { Container } from '@mantine/core'
import React from 'react'
import { fromPairs } from 'lodash'
import {
    ScreenSizeId,
    SUPPORTED_SCREEN_SIZES,
} from '@packages/shared/constants'

export function FlexibleLayoutContainer({
    layouts,
    children,
}: {
    layouts: FlexibleLayoutConfig
    children: React.ReactNode
}) {
    const { width, mounted, containerRef } = useContainerWidth()

    return (
        <Container
            p={0}
            m={0}
            ref={containerRef}
            fluid
            className="w-full h-full"
        >
            {mounted && (
                <ResponsiveGridLayout
                    dragConfig={{
                        enabled: false,
                        bounded: false,
                    }}
                    resizeConfig={{
                        enabled: false,
                    }}
                    margin={[8, 8]}
                    cols={
                        fromPairs(
                            SUPPORTED_SCREEN_SIZES.map((value) => {
                                return [value.id, value.cols]
                            })
                        ) as { [key in ScreenSizeId]: number }
                    }
                    breakpoints={
                        fromPairs(
                            SUPPORTED_SCREEN_SIZES.map((value) => {
                                return [value.id, value.value]
                            })
                        ) as { [key in ScreenSizeId]: number }
                    }
                    layouts={layouts}
                    className="layout"
                    maxRows={24}
                    width={width}
                    rowHeight={80}
                >
                    {children}
                </ResponsiveGridLayout>
            )}
        </Container>
    )
}
