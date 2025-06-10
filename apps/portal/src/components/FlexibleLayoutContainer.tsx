"use client";
import { Responsive as ResponsiveGridLayout } from "react-grid-layout";
import { FlexibleLayoutConfig } from "@packages/shared/schemas";
import { Container } from "@mantine/core";
import React, { RefObject, useRef } from "react";
import { useResizeObserver } from "usehooks-ts";

export function FlexibleLayoutContainer({
	layouts,
	children,
}: {
	layouts: FlexibleLayoutConfig;
	children: React.ReactNode;
}) {
	const ref = useRef<HTMLDivElement>(null);
	const { width } = useResizeObserver({
		ref: ref as RefObject<HTMLDivElement>,
	});

	return (
		<Container p={0} m={0} ref={ref} fluid className="w-full h-full">
			<ResponsiveGridLayout
				isDraggable={false}
				margin={[8, 8]}
				cols={{
					lg: 12,
					md: 10,
					sm: 6,
					xs: 4,
					xxs: 1,
				}}
				breakpoints={{
					lg: 1200,
					md: 996,
					sm: 768,
					xs: 480,
					xxs: 120,
				}}
				layouts={layouts}
				className="layout"
				allowOverlap={false}
				maxRows={24}
				width={width}
				rowHeight={80}
				isResizable={false}
			>
				{children}
			</ResponsiveGridLayout>
		</Container>
	);
}
