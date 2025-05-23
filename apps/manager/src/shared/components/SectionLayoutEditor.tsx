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
			<SectionItem item={item} />
			{children}
			{/* <span className="react-resizable-handle" /> */}
		</div>
	);
});

const widths = [
	{
		name: "small screen",
		value: 996,
	},
	{
		name: "medium screen",
		value: 1200,
	},
	{
		name: "large screen",
		value: 1500,
	},
];

export function SectionLayoutEditor({
	prefix,
}: {
	prefix: `config.sections.${number}`;
}) {
	const [size, setSize] = useState<number>(1200);
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
						{visualizations?.map((item) => (
							<GridItem
								key={item.item?.id}
								item={item.item as VisualizationItem}
							/>
						))}
					</ResponsiveGridLayout>
				</div>
			</div>
		</div>
	);
}
