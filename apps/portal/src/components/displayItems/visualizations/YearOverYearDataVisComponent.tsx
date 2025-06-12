"use client";

import { ActionIcon, Loader, Tooltip } from "@mantine/core";
import { IconArrowsMaximize, IconArrowsMinimize } from "@tabler/icons-react";
import i18n from "@dhis2/d2-i18n";
import {
	VisualizationConfig,
	VisualizationDisplayItemType,
	VisualizationItem,
} from "@packages/shared/schemas";
import { FullScreen } from "react-full-screen";

import { useSearchParams } from "next/navigation";
import { isEmpty } from "lodash";
import { CaptionPopover } from "@/components/CaptionPopover";
import {
	useContainerSize,
	useDimensionViewControls,
	useVisualizationLegendSet,
	useVisualizationRefs,
} from "@/hooks/dataVisualization";
import { useYearOverYearAnalytics } from "@packages/shared/hooks";
import {
	ChartSelector,
	TableVisualizer,
	VisualizationTitle,
} from "@packages/ui/visualizations";
import { ActionMenu } from "./ActionMenu";
import { CustomOrgUnitModal } from "./CustomOrgUnitModal";
import { CustomPeriodModal } from "@/components/displayItems/visualizations/CustomPeriodModal";

export function YearOverYearDataVisComponent({
	visualizationConfig,
	config,
	showFilter = true,
	disableActions,
	colors,
}: {
	visualizationConfig: VisualizationConfig;
	config: VisualizationItem;
	showFilter?: boolean;
	colors: string[];
	disableActions?: boolean;
}) {
	const { type, orgUnitConfig, periodConfig } = config;
	const { chartRef, tableRef, setSingleValueRef } = useVisualizationRefs();
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
		loading: analyticsLoading,
		setSelectedPeriods,
		setSelectedOrgUnits,
		selectedPeriods,
		selectedOrgUnits,
	} = useYearOverYearAnalytics({ visualizationConfig });

	const { loading: legendSetLoading, legendSet } =
		useVisualizationLegendSet(visualizationConfig);

	const loading = analyticsLoading || legendSetLoading;

	const searchParams = useSearchParams();

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
							<Loader color="blue" size={30} />{" "}
						</div>
					) : analytics ? (
						showTable ? (
							<div className="flex-1 h-full">
								<TableVisualizer
									fullScreen={handler.active}
									setRef={tableRef}
									analytics={analytics}
									visualization={visualizationConfig}
								/>
							</div>
						) : (
							<div className="flex-1 h-full">
								{type ===
									VisualizationDisplayItemType.CHART && (
									<ChartSelector
										colors={colors}
										setRef={chartRef}
										analytics={analytics}
										visualization={visualizationConfig}
										fullScreen={handler.active}
										tableRef={tableRef}
									/>
								)}
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
						!isEmpty(selectedOrgUnits)
							? selectedOrgUnits
							: (searchParams.get("ou")?.split(",") ?? [])
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
						!isEmpty(selectedPeriods)
							? selectedPeriods
							: (searchParams.get("pe")?.split(",") ?? [])
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
