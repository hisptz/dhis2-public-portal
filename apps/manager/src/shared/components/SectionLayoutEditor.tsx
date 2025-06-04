import React, {
	DetailedHTMLProps,
	forwardRef,
	HTMLAttributes,
	useRef,
} from "react";
import { useController, useWatch } from "react-hook-form";
import {
	IconCross24,
} from "@dhis2/ui";
import i18n from "@dhis2/d2-i18n";
import { Responsive as ResponsiveGridLayout } from "react-grid-layout";
import {
	FlexibleLayoutConfig,
	VisualizationDisplayItem,
	VisualizationItem,
} from "@packages/shared/schemas";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { MainVisualization } from "./ModulesPage/components/Visualizations/MainVisualization";

function SectionItem({ item }: { item: VisualizationItem }) {

	return (
		<div className="flex flex-col justify-center items-center h-full w-full gap-2">
			<MainVisualization
				config={item}
			/>
		</div>
	);
}

const GridItem = forwardRef<
	HTMLDivElement,
	{
		item: VisualizationItem;
		onDelete: (id: string) => void;
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
		item: VisualizationItem;
		onDelete: (id: string) => void;
	} & DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>,
	ref,
) {
	const handleDeleteClick = () => {
		onDelete(item.id);
	};

	const stopPropagation = (event: React.MouseEvent) => {
		event.stopPropagation();
	};

	const stopPropagationTouch = (event: React.TouchEvent) => {
		event.stopPropagation();
	};
	return (
		<div
			ref={ref}
			style={{ ...style }}
			data-prefix={item.id}
			prefix={item.id}
			className={`border-2 border-gray-400 rounded-md p-2 flex flex-col relative ${className}`}
			{...rest}
		>
			<button
				onMouseDown={stopPropagation}
				onTouchStart={stopPropagationTouch}
				onClick={handleDeleteClick}
				className="absolute top-1 right-1 bg-amber-500"
				style={{ background: "transparent", border: "none", padding: 0 }}
				title={i18n.t("Remove visualization")}>
				<IconCross24 />
			</button>
			<SectionItem item={item} />
			{children}
		</div>
	);
});

export function SectionLayoutEditor({
	prefix,
	size,
	onDelete,
}: {
	prefix: `config.sections.${number}`;
	size?: number;
	onDelete: (id: string) => void;
}) {
	const ref = useRef<HTMLDivElement>(null);

	const { field } = useController<
		{
			config: {
				sections: {
					layouts: FlexibleLayoutConfig;
				}[];
			};
		},
		`config.sections.${number}.layouts`
	>({
		name: `${prefix}.layouts`,
	});

	const visualizations: VisualizationDisplayItem[] = useWatch({
		name: `${prefix}.items`,
	});

	return (
		<div className="flex flex-col gap-2" ref={ref}>
			<div className="flex-1 flex justify-center w-full">
				<div className="bg-white w-full" style={{ width: size }}>
					<ResponsiveGridLayout
					key={visualizations?.map(v => v.item.id).join(",") || "empty"}
						breakpoints={{
							lg: 1200,
							md: 996,
							sm: 768,
							xs: 480,
							xxs: 120,
						}}
						cols={{
							lg: 12,
							md: 10,
							sm: 6,
							xs: 4,
							xxs: 1,
						}}
						layouts={field.value as FlexibleLayoutConfig}
						margin={[8, 8]}
						className="layout"
						allowOverlap={false}
						rowHeight={80}
						width={size}
						autoSize
						isDraggable
						isDroppable
						isResizable
						compactType={null}
						onLayoutChange={(updatedLayout, actualValue) => {
							field.onChange(actualValue);
						}}
					>
						{visualizations?.map((item) => (
							<GridItem
								key={item.item?.id}
								item={item.item as VisualizationItem}
								onDelete={onDelete}
							/>
						))}
					</ResponsiveGridLayout>
				</div>
			</div>
		</div>
	);
}
