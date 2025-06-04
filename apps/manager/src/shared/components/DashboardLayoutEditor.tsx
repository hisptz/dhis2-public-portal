import React, {
	DetailedHTMLProps,
	forwardRef,
	HTMLAttributes,
	useCallback,
	useMemo,
	useRef,
} from "react";
import { useController, useWatch } from "react-hook-form";
import { IconCross24 } from "@dhis2/ui";
import { Responsive as ResponsiveGridLayout } from "react-grid-layout";
import { debounce } from "lodash";
import { FlexibleLayoutConfig, VisualizationItem, VisualizationModule } from "@packages/shared/schemas";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { MainVisualization } from "./ModulesPage/components/Visualizations/MainVisualization";

function DashboardItem({ item }: { item: VisualizationItem }) {
	return (
		<div className="flex flex-col justify-center items-center h-full w-full overflow-y-auto gap-2">
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
		onDelete,
		style,
		className,
		children,
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
				title="Remove visualization">
				<IconCross24 />
			</button>
			<DashboardItem item={item} />
			{children}
		</div>
	);
});

export function DashboardLayoutEditor({
	prefix,
	size,
	onDelete,
}: {
	prefix?: `config.groups.${number}`;
	size?: number;
	onDelete: (id: string) => void;

}) {
	const ref = useRef<HTMLDivElement>(null);

	const { field } = useController<
		VisualizationModule,
		"config.layouts" | `config.groups.${number}.layouts`
	>({
		name: !prefix ? "config.layouts" : `${prefix}.layouts`,
	});
	console.log("field value:", field.value);


	const visualizations = useWatch<
		VisualizationModule,
		"config.items" | `config.groups.${number}.items`
	>({
		name: !prefix ? "config.items" : `${prefix}.items`,
	});

	const debouncedLayoutChange = useMemo(
		() =>
			debounce((updatedLayout, actualValue) => {
				field.onChange(actualValue);
			}, 100),
		[field]
	);

	const handleLayoutChange = useCallback(
		(updatedLayout, actualValue) => {
			debouncedLayoutChange(updatedLayout, actualValue);
		},
		[debouncedLayoutChange]
	);

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
						useCSSTransforms={true}
						compactType={null}
						onLayoutChange={handleLayoutChange}
					>
						{visualizations?.map((item) => (
							<GridItem
								key={item.item.id}
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