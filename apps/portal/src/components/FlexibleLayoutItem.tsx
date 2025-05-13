"use client";

import { Box } from "@mantine/core";
import {
	DetailedHTMLProps,
	forwardRef,
	HTMLAttributes,
	ReactNode,
} from "react";

export const FlexibleLayoutItem = forwardRef<
	HTMLDivElement,
	{
		children: ReactNode;
		id: string;
	} & DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>
>(function FlexibleLayoutItem(
	{
		children,
		className,
		style,
		id,
	}: {
		children: React.ReactNode;
		id: string;
	} & DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>,
	ref,
) {
	return (
		<Box
			component="div"
			style={{ ...style }}
			className={className}
			ref={ref}
			key={id}
		>
			{children}
		</Box>
	);
});
