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
import {   VisualizationItem, VisualizationModule } from "@packages/shared/schemas";
 
 
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
			className={`border-2 border-gray-400 rounded-md p-2 flex flex-col ${className ?? ""}`}
			{...rest}
		>
 			<DashboardItem item={item} />
			{children}
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
	prefix: `config` | `config.groups.${number}`;
}) {
	const [size, setSize] = useState<number>(1200);
	const ref = useRef<HTMLDivElement>(null);

	const { field: layoutField } = useController<
		VisualizationModule,
		`${typeof prefix}.layouts`
	>({
		name: `${prefix}.layouts`,
	});

	const items = useWatch<
		VisualizationModule,
		`${typeof prefix}.items`
	>({
		name: `${prefix}.items`,
	});

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
				<div className="bg-white" style={{ width: size }}>
					<ResponsiveGridLayout
 						layouts={layoutField.value as any}
						margin={[8, 8]}
						className="layout"
						allowOverlap={false}
						rowHeight={80}
						width={size}
						isDraggable
						isDroppable
						isResizable
						onLayoutChange={(updatedLayout, actualLayoutsForAllBreakpoints) => {
							layoutField.onChange(actualLayoutsForAllBreakpoints);
						}}
					>
 						{items?.map((item) => (
 							<GridItem key={item.item.id} item={item.item as VisualizationItem} />
						))}
					</ResponsiveGridLayout>
				</div>
			</div>
		</div>
	);
}