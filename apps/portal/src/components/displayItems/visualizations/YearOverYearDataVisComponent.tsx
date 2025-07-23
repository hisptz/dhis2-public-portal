"use client";

import { ActionIcon, Loader, Tooltip } from "@mantine/core";
import { IconArrowsMaximize, IconArrowsMinimize } from "@tabler/icons-react";
import i18n from "@dhis2/d2-i18n";
import {
	AnalyticsData,
	VisualizationItem,
	YearOverYearVisualizationConfig,
} from "@packages/shared/schemas";
import { FullScreen } from "react-full-screen";

import { isEmpty } from "lodash";
import { CaptionPopover } from "@/components/CaptionPopover";
import {
	useContainerSize,
	useDimensionViewControls,
	useVisualizationRefs,
} from "@/hooks/dataVisualization";
import { useYearOverYearAnalytics } from "@packages/shared/hooks";
import {
	VisualizationTitle,
	YearOverYearVisualizer,
} from "@packages/ui/visualizations";
import { ActionMenu } from "./ActionMenu";
import { CustomOrgUnitModal } from "./CustomOrgUnitModal";
import { CustomPeriodModal } from "@/components/displayItems/visualizations/CustomPeriodModal";

import React from "react";

export function YearOverYearDataVisComponent({
	visualizationConfig,
	config,
	showFilter = true,
	disableActions,
	colors,
}: {
	visualizationConfig: YearOverYearVisualizationConfig;
	config: VisualizationItem;
	showFilter?: boolean;
	colors: string[];
	disableActions?: boolean;
}) {
	const { orgUnitConfig, periodConfig } = config;
	const { chartRef, tableRef } = useVisualizationRefs();
	const {
		onCloseOrgUnitSelector,
		showPeriodSelector,
		onClosePeriodSelector,
		showOrgUnitSelector,
		handler,
		showTable,
		onFullScreen,
		actionMenuGroups,
	} = useDimensionViewControls({
		chartRef,
		tableRef,
		showFilter,
		visualizationConfig,
		config,
	});

	const { containerRef } = useContainerSize(chartRef);

	const {
		analytics,
		loading,
		setSelectedPeriods,
		setSelectedOrgUnits,
		selectedPeriods,
		selectedOrgUnits,
	} = useYearOverYearAnalytics({
		visualizationConfig:
			visualizationConfig as YearOverYearVisualizationConfig,
	});

	function transformToYoYAnalytics(
		analyticsMap: Map<string, AnalyticsData>,
	): AnalyticsData {
		const output: AnalyticsData = {
			headers: [
				{ name: "dx", column: "Data", valueType: "TEXT" },
				{ name: "pe", column: "Period", valueType: "TEXT" },
				{ name: "value", column: "Value", valueType: "NUMBER" },
			],
			metaData: {
				items: {},
				dimensions: { dx: [], pe: [], ou: [] },
			},
			rows: [],
		};
		const valueMap: Map<string, Record<string, number>> = new Map();
		const allPeriods = new Set<string>();
		const orgUnitSet = new Set<string>();
		for (const [yearKey, analytics] of analyticsMap.entries()) {
			for (const [pe, value] of analytics.rows) {
				const year = yearKey;
				if (!valueMap.has(year)) valueMap.set(year, {});
				valueMap.get(year)![pe] = parseFloat(value);
				allPeriods.add(pe);
			}
			Object.entries(analytics.metaData.items).forEach(([key, item]) => {
				output.metaData.items[key] ??= item;
			});
			analytics.metaData.dimensions.ou?.forEach((ou) =>
				orgUnitSet.add(ou),
			);
		}
		const sortedPeriods = Array.from(allPeriods).sort();
		sortedPeriods.forEach((pe) => {
			if (!output.metaData.items[pe]) {
				const year = pe.slice(0, 4);
				const monthNum = parseInt(pe.slice(4, 6), 10) - 1;
				const monthName = new Date(2000, monthNum).toLocaleString(
					"en",
					{ month: "long" },
				);
				output.metaData.items[pe] = { name: `${monthName} ${year}` };
			}
		});
		for (const year of valueMap.keys()) {
			for (const pe of sortedPeriods) {
				const val = valueMap.get(year)?.[pe];
				if (val !== undefined) {
					output.rows.push([year, pe, String(val)]);
				}
			}
			output.metaData.items[year] = { name: year };
		}
		output.metaData.dimensions.dx = Array.from(valueMap.keys());
		output.metaData.dimensions.pe = sortedPeriods;
		output.metaData.dimensions.ou = Array.from(orgUnitSet);
		return output;
	}

	const combinedAnalytics = React.useMemo(() => {
		if (analytics instanceof Map) {
			return transformToYoYAnalytics(analytics);
		}
		return analytics;
	}, [analytics]);

	return (
		<>
			<FullScreen className="bg-white w-full h-full" handle={handler}>
				<div
					key={visualizationConfig.name}
					className="flex flex-col gap-2 w-full h-full"
					ref={containerRef}
				>
					<div className="flex flex-row place-content-between">
						<VisualizationTitle title={visualizationConfig.name} />
						{!disableActions && (
							<div className="flex flex-row gap-2 align-middle">
								{handler.active && (
									<Tooltip label={i18n.t("Exit full screen")}>
										<ActionIcon
											variant="subtle"
											onClick={onFullScreen}
										>
											{handler.active ? (
												<IconArrowsMinimize />
											) : (
												<IconArrowsMaximize />
											)}
										</ActionIcon>
									</Tooltip>
								)}
								<Tooltip label={i18n.t("More info")}>
									<CaptionPopover
										label={visualizationConfig.name}
										visualization={config}
									/>
								</Tooltip>
								<Tooltip label={i18n.t("Actions")}>
									<ActionMenu
										actionMenuGroups={actionMenuGroups}
									/>
								</Tooltip>
							</div>
						)}
					</div>
					{loading ? (
						<div className="flex justify-center items-center h-full">
							<Loader size="md" />{" "}
						</div>
					) : combinedAnalytics ? (
						showTable ? (
							<div className="flex-1 h-full"></div>
						) : (
							<div className="flex-1 h-full">
								<YearOverYearVisualizer
									setRef={chartRef}
									analytics={analytics}
									visualization={visualizationConfig}
									colors={colors}
								/>
							</div>
						)
					) : (
						<div />
					)}
				</div>
			</FullScreen>
			{showOrgUnitSelector && (
				<CustomOrgUnitModal
					onReset={() => {
						setSelectedOrgUnits([]);
					}}
					orgUnitState={
						!isEmpty(selectedOrgUnits) ? selectedOrgUnits : []
					}
					onUpdate={(val) => {
						setSelectedOrgUnits(val ?? []);
					}}
					open={showOrgUnitSelector}
					title={visualizationConfig.name}
					handleClose={onCloseOrgUnitSelector}
					limitSelectionToLevels={orgUnitConfig?.orgUnitLevels}
					orgUnitsId={orgUnitConfig?.orgUnits}
				/>
			)}

			{showPeriodSelector && (
				<CustomPeriodModal
					open={showPeriodSelector}
					onReset={() => {
						setSelectedPeriods([]);
					}}
					title={visualizationConfig.name}
					periodState={
						!isEmpty(selectedPeriods) ? selectedPeriods : []
					}
					onUpdate={(val) => {
						setSelectedPeriods(val);
					}}
					handleClose={onClosePeriodSelector}
					categories={periodConfig?.categories}
					periodTypes={periodConfig?.periodTypes}
					periods={periodConfig?.periods}
				/>
			)}
		</>
	);
}
