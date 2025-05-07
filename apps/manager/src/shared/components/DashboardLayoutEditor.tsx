import React, {
	DetailedHTMLProps,
	forwardRef,
	HTMLAttributes,
	useRef,
	useState,
} from "react";
import { useController, useWatch } from "react-hook-form";
import {
	CircularLoader,
	SingleSelectField,
	SingleSelectOption,
} from "@dhis2/ui";

import i18n from "@dhis2/d2-i18n";
import { Responsive as ResponsiveGridLayout } from "react-grid-layout";
import { capitalize } from "lodash";
import { useDashboardItemConfig } from "../hooks/dashboardItem";
import { DisplayItem, DisplayItemType, FlexibleLayoutConfig, VisualizationItem, VisualizationModule } from "@packages/shared/schemas";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

function DashboardItem({ item }: { item: VisualizationItem }) {
	const { loading, config } = useDashboardItemConfig(item);

	if (loading) {
		return (
			<div className="flex justify-center items-center h-full w-full">
				<CircularLoader small />
			</div>
		);
	}

	return (
		<div className="flex flex-col justify-center items-center h-full w-full gap-2">
			<h2 className="text-2xl text-center">
				{config?.displayName ?? "Could not get name"}
			</h2>
			<span>{capitalize(item.type).replace("_", " ")}</span>
		</div>
	);
}


const GridItem = forwardRef<
	HTMLDivElement,
	{
		item: VisualizationItem;
	} & DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>
>(function GridItem(
	{
		item,
		style,
		className,
		children,
		...rest
	}: {
		item: VisualizationItem;
	} & DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>,
	ref,
) {
	return (
		<div
			ref={ref}
			style={{ ...style }}
			data-prefix={item.id}
			prefix={item.id}
			className={`border-2 border-gray-400 rounded-md p-2 flex flex-col ${className}`}
			{...rest}
		>
			<DashboardItem item={item} />
			{children}
			{/* <span className="react-resizable-handle" /> */}
		</div>
	);
});

const widths = [
	{
		name: "sm",
		value: 996,
	},
	{
		name: "md",
		value: 1200,
	},
	{
		name: "lg",
		value: 1500,
	},
];

export function DashboardLayoutEditor({
	prefix,
}: {
	prefix?: `config.groups.${number}`;
}) {
	const [size, setSize] = useState<number>(1200);
	const ref = useRef<HTMLDivElement>(null);

	const { field } = useController<
		VisualizationModule,
		"config.layouts" | `config.groups.${number}.layouts`
	>({
		name: !prefix ? "config.layouts" : `${prefix}.layouts`,
	});
	const visualizations = useWatch<
		VisualizationModule,
		"config.items" | `config.groups.${number}.items`
	>({
		name: !prefix ? "config.items" : `${prefix}.items`,
	});

	const visualizationItems = visualizations?.filter(
		(item): item is DisplayItem & { type: DisplayItemType.VISUALIZATION; item: VisualizationItem } =>
			item.type === DisplayItemType.VISUALIZATION
	) || [];


	return (
		<div className="flex flex-col gap-2" ref={ref}>
			<div className="p-4 max-w-[300px]">
				<SingleSelectField
					selected={size.toString()}
					onChange={({ selected }) => setSize(parseInt(selected))}
					label={i18n.t("Size")}
				>
					{widths.map(({ name, value }) => (
						<SingleSelectOption
							key={value.toString()}
							label={name}
							value={value.toString()}
						/>
					))}
				</SingleSelectField>
			</div>
			<div className="flex-1 flex justify-center w-full">
				<div className="bg-white w-full" style={{ width: size }}>
					<ResponsiveGridLayout
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
						onLayoutChange={(updatedLayout, actualValue) => {
							field.onChange(actualValue);
						}}
					>
						{visualizationItems?.map((item) => (
							<GridItem key={item.item.id} item={item.item as VisualizationItem} />
						))}
					</ResponsiveGridLayout>
				</div>
			</div>
		</div>
	);
}