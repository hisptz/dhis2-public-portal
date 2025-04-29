"use client";

import {
	DetailedHTMLProps,
	forwardRef,
	HTMLAttributes,
	ReactNode,
} from "react";
import { VisualizationItem } from "@packages/shared/schemas";

export const GridCardContainer = forwardRef<
	HTMLDivElement,
	{
		children: ReactNode;
		item: VisualizationItem;
	} & DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>
>(function GridCardContainer(
	{
		children,
		item,
		style,
		className,
	}: {
		children: ReactNode;
		item: VisualizationItem;
	} & DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>,
	ref,
) {
	return (
		<div
			style={{ ...style }}
			className={className}
			ref={ref}
			key={`${item.id}-card`}
		>
			{children}
		</div>
	);
});
