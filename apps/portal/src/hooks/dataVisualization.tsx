import { useBoolean, useResizeObserver } from "usehooks-ts";
import { RefObject, useMemo, useRef, useState } from "react";
import HighchartsReact from "highcharts-react-official";
import i18n from "@dhis2/d2-i18n";
import {
	IconChartBar,
	IconClock,
	IconDownload,
	IconMapPin,
	IconMaximize,
	IconMinimize,
	IconTable,
} from "@tabler/icons-react";
import { downloadExcelFromTable } from "@/utils/table";
import {
	VisualizationConfig,
	VisualizationItem,
} from "@packages/shared/schemas";
import Highcharts from "highcharts";
import { isEmpty } from "lodash";
import { useFullScreenHandle } from "react-full-screen";
import { ActionMenuGroup } from "@/components/displayItems/visualizations/ActionMenu";

export function useDimensionViewControls({
	visualizationConfig,
	chartRef,
	tableRef,
	config,
	showFilter,
}: {
	visualizationConfig: VisualizationConfig;
	config: VisualizationItem;
	chartRef: RefObject<HighchartsReact.RefObject | null>;
	tableRef: RefObject<HTMLTableElement | null>;
	showFilter?: boolean;
}) {
	const { type } = config ?? {};
	//
	const handler = useFullScreenHandle();
	const {
		value: showOrgUnitSelector,
		setTrue: onShowOrgUnitSelector,
		setFalse: onCloseOrgUnitSelector,
	} = useBoolean(false);

	const {
		value: showPeriodSelector,
		setTrue: onShowPeriodSelector,
		setFalse: onClosePeriodSelector,
	} = useBoolean(false);
	const { value: showTable, toggle: toggleShowTable } = useBoolean(false);

	const onDownload = () => {
		const label = `${visualizationConfig.name.toLowerCase()}`;
		if (showTable) {
			downloadExcelFromTable(tableRef.current!, label);
			return;
		} else {
			(
				chartRef.current
					?.chart as unknown as HighchartsReact.RefObject & {
					exportChart: (
						options: Highcharts.ExportingOptions,
						chartOptions: Highcharts.Options,
					) => void;
				}
			)?.exportChart(
				{
					filename: label,
				},
				{
					title: {
						text: visualizationConfig.name,
					},
				},
			);
		}
	};

	const vis = useMemo(
		() => (showTable ? i18n.t("Chart") : i18n.t("Table")),
		[showTable],
	);

	const canShowTable = useMemo(
		() =>
			!isEmpty(visualizationConfig.rows) &&
			!isEmpty(visualizationConfig.columns),
		[visualizationConfig.rows, visualizationConfig.columns],
	);

	const onFullScreen = () => {
		if (handler.active) {
			handler.exit();
			chartRef.current!.chart.redraw();
		} else {
			handler.enter();
			chartRef.current!.chart.redraw();
		}
	};

	const actionMenuGroups: ActionMenuGroup[] = useMemo(() => {
		const menus: ActionMenuGroup[] = [
			{
				actions: [
					{
						label: i18n.t("Download"),
						onClick: onDownload,
						icon: <IconDownload />,
					},
				],
			},
		];

		if (showFilter) {
			menus.unshift({
				label: i18n.t("Filters"),
				actions: [
					{
						label: i18n.t("Location"),
						icon: <IconMapPin />,
						onClick: onShowOrgUnitSelector,
					},
					{
						label: i18n.t("Period"),
						icon: <IconClock />,
						onClick: onShowPeriodSelector,
					},
				],
			});
		}

		const viewMenu: ActionMenuGroup = canShowTable
			? {
					label: i18n.t("View"),
					actions: [
						{
							label: i18n.t("Show {{vis}}", { vis }),
							icon: showTable ? <IconChartBar /> : <IconTable />,
							onClick: toggleShowTable,
						},
						{
							label: i18n.t("Full page"),
							icon: handler.active ? (
								<IconMinimize />
							) : (
								<IconMaximize />
							),
							onClick: onFullScreen,
						},
					],
				}
			: {
					label: i18n.t("View"),
					actions: [
						{
							label: i18n.t("Full page"),
							icon: handler.active ? (
								<IconMinimize />
							) : (
								<IconMaximize />
							),
							onClick: onFullScreen,
						},
					],
				};

		return [viewMenu, ...menus];
	}, [
		onShowOrgUnitSelector,
		onShowPeriodSelector,
		onDownload,
		canShowTable,
		vis,
		showTable,
		toggleShowTable,
		handler.active,
		onFullScreen,
		showFilter,
	]);

	return {
		handler,
		showTable,
		onFullScreen,
		showOrgUnitSelector,
		showPeriodSelector,
		actionMenuGroups,
		onShowOrgUnitSelector,
		onShowPeriodSelector,
		onCloseOrgUnitSelector,
		onClosePeriodSelector,
	};
}

export function useContainerSize(
	chartRef: RefObject<HighchartsReact.RefObject | null>,
) {
	const containerRef = useRef<HTMLDivElement | null>(null);

	useResizeObserver({
		ref: containerRef as RefObject<HTMLDivElement>,
		onResize: ({ width, height }) => {
			if (chartRef.current?.chart) {
				if (width && height) {
					chartRef.current?.chart.setSize(width, height - 64, true);
				}
			}
		},
	});

	return {
		containerRef,
	};
}

export function useVisualizationRefs() {
	const chartRef = useRef<HighchartsReact.RefObject>(null);
	const tableRef = useRef<HTMLTableElement>(null);
	const [, setSingleValueRef] = useState<HTMLDivElement | null>(null);

	return {
		chartRef,
		tableRef,
		setSingleValueRef,
	};
}
