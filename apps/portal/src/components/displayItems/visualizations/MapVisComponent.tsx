"use client";

import { ActionIcon, Tooltip } from "@mantine/core";
import i18n from "@dhis2/d2-i18n";
import {
	IconClock,
	IconDownload,
	IconMaximize,
	IconMinimize,
	IconMapPin,
	IconMap,
	IconTable,
} from "@tabler/icons-react";
import { FullScreen, useFullScreenHandle } from "react-full-screen";
import { MapView } from "@/components/displayItems/visualizations/MapView";
import { OrgUnitSelection } from "@hisptz/dhis2-utils";
import { RefObject, useCallback, useMemo, useRef, useState } from "react";
import L, { Map as LeafletMap } from "leaflet";
import "leaflet-easyprint";
import { CustomOrgUnitModal } from "./CustomOrgUnitModal";
import { CustomPeriodModal } from "./CustomPeriodModal";
import { useBoolean, useResizeObserver } from "usehooks-ts";
import { MapTableComponent } from "@/components/displayItems/visualizations/MapTableComponent";
import {
	ActionMenu,
	ActionMenuGroup,
} from "@/components/displayItems/visualizations/ActionMenu";
import { downloadExcelFromTable } from "@/utils/table";
import { CaptionPopover } from "@/components/CaptionPopover";
import { MapConfig, VisualizationItem } from "@packages/shared/schemas";
import { VisualizationTitle } from "@/components/displayItems/visualizations/VisualizationTitle";

export function MapVisComponent({
	orgUnitSelection,
	thematicLayers,
	periods,
	mapConfig,
	config,
	disableActions,
}: {
	orgUnitSelection: OrgUnitSelection;
	thematicLayers: any[];
	periods: string[];
	mapConfig: MapConfig;
	config: VisualizationItem;
	disableActions?: boolean;
}) {
	const { orgUnitConfig, periodConfig } = config;
	const { value: showTable, toggle: toggleShowTable } = useBoolean(false);
	const handler = useFullScreenHandle();
	const mapContainer = useRef<HTMLDivElement | null>(null);

	const [map, setMap] = useState<LeafletMap | null>(null);
	const mapRef = useCallback((map: LeafletMap) => {
		setMap(map);
	}, []);

	const updateMap = () => {
		if (map) {
			map.invalidateSize();
			map.fitBounds(map.getBounds());
			map.panInsideBounds(map.getBounds());
		}
	};

	useResizeObserver({
		ref: mapContainer as unknown as RefObject<HTMLDivElement>,
		onResize: () => {
			updateMap();
		},
	});

	const printPlugin: {
		printMap: (size: string, filename: string) => void;
		_map: LeafletMap;
	} | null = useMemo(() => {
		if (map) {
			map.scrollWheelZoom.disable();
			return (L as any)
				.easyPrint({
					sizeModes: ["A4Portrait", "A4Landscape"],
					hidden: true,
					exportOnly: true,
					spinnerBgColor: "#FFFFFF",
					customSpinnerClass: "color-primary",
					customWindowTitle: `${mapConfig.name}`,
					hideClasses: ["leaflet-control", "leaflet-bar"],
				})
				.addTo(map);
		}
		return null;
	}, [map]);

	const tableRef = useRef<HTMLTableElement>(null);

	const onDownload = () => {
		const label = `${mapConfig.name.toLowerCase()}`;
		if (showTable) {
			downloadExcelFromTable(tableRef.current!, label);
			return;
		}
		if (printPlugin) {
			const label = `${mapConfig.name.toLowerCase()}`;
			printPlugin?.printMap("A4Landscape page", label.toLowerCase());
		}
	};

	const {
		value: orgUnits,
		setTrue: showOrgUnits,
		setFalse: hideOrgUnits,
	} = useBoolean(false);

	const {
		value: period,
		setTrue: showPeriods,
		setFalse: hidePeriods,
	} = useBoolean(false);

	const [periodState, setPeriodState] = useState<string[]>(periods);
	const [orgUnitSelectionState, setOrgUnitSelectionState] =
		useState<OrgUnitSelection>(orgUnitSelection);

	const onFullScreen = async () => {
		if (handler.active) {
			await handler.exit();
		} else {
			await handler.enter();
		}
		updateMap();
	};

	const vis = useMemo(
		() => (showTable ? i18n.t("Map") : i18n.t("Table")),
		[showTable],
	);
	const actionMenuGroups: ActionMenuGroup[] = useMemo(() => {
		const menus = [
			{
				label: i18n.t("View"),
				actions: [
					{
						label: i18n.t("Show {{vis}}", {
							vis: vis,
						}),
						icon: showTable ? <IconMap /> : <IconTable />,
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
			},
			{
				label: i18n.t("Filters"),
				actions: [
					{
						label: i18n.t("Location"),
						icon: <IconMapPin />,
						onClick: showOrgUnits,
					},
					{
						label: i18n.t("Period"),
						icon: <IconClock />,
						onClick: showPeriods,
					},
				],
			},
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

		return [...menus];
	}, [
		vis,
		showTable,
		toggleShowTable,
		handler.active,
		onFullScreen,
		showOrgUnits,
		showPeriods,
		onDownload,
	]);

	return (
		<>
			<FullScreen
				onChange={() => {
					updateMap();
				}}
				className="bg-white w-full h-full"
				handle={handler}
			>
				<div className="flex flex-col gap-2 p-4  w-full h-full ">
					<div className="flex flex-row place-content-between">
						<VisualizationTitle title={mapConfig.name} />
						{!disableActions && (
							<div className="flex flex-row gap-2">
								{handler.active && (
									<Tooltip label={i18n.t("Exit full screen")}>
										<ActionIcon onClick={onFullScreen}>
											{handler.active ? (
												<IconMinimize />
											) : (
												<IconMaximize />
											)}
										</ActionIcon>
									</Tooltip>
								)}
								<Tooltip label={i18n.t("More info")}>
									<CaptionPopover
										label={mapConfig.name}
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
					<div ref={mapContainer} className="flex-1 h-full">
						{showTable ? (
							<div className="flex-1 h-full">
								<MapTableComponent
									fullScreen={handler.active}
									orgUnitSelection={orgUnitSelectionState}
									periodSelection={{
										periods: periodState,
									}}
									setRef={tableRef}
									mapConfig={mapConfig}
								/>
							</div>
						) : (
							<MapView
								mapOptions={{
									trackResize: true,
									zoomControl: true,
									scrollWheelZoom: false,
									bounceAtZoomLimits: true,
									boxZoom: true,
									zoom: 1,
									style: {
										height: "100%",
										width: "100%",
										background: "#FFFFFF",
									},
								}}
								base={{
									enabled: false,
									url: "",
									attribution: "",
								}}
								setRef={mapRef}
								orgUnitSelection={orgUnitSelectionState}
								thematicLayers={thematicLayers}
								legends={{
									collapsible: false,
									enabled: true,
									position: "topright",
								}}
								periodSelection={{
									periods: periodState,
								}}
								boundaryLayer={{
									enabled: true,
								}}
								controls={[
									{
										type: "scale",
										position: "bottomleft",
										options: {
											imperial: false,
											metric: true,
										},
									},
									{
										type: "compass",
										position: "bottomleft",
									},
								]}
							/>
						)}
					</div>
				</div>
			</FullScreen>
			{orgUnits && (
				<CustomOrgUnitModal
					onReset={() => setOrgUnitSelectionState(orgUnitSelection)}
					orgUnitState={orgUnitSelectionState.orgUnits?.map(
						(ou) => ou.id,
					)}
					onUpdate={(val) => {
						setOrgUnitSelectionState({
							orgUnits: val?.map((ou: string) => ({
								id: ou,
								children: [],
							})),
							levels: [],
							groups: [],
						});
					}}
					open={orgUnits}
					title={mapConfig.name}
					handleClose={hideOrgUnits}
					limitSelectionToLevels={orgUnitConfig?.orgUnitLevels}
					orgUnitsId={orgUnitConfig?.orgUnits}
				/>
			)}

			{period && (
				<CustomPeriodModal
					onReset={() => setPeriodState(periods)}
					periodState={periodState}
					onUpdate={(val) => {
						setPeriodState(val);
					}}
					open={period}
					title={mapConfig.name}
					handleClose={hidePeriods}
					categories={periodConfig?.categories}
					periodTypes={periodConfig?.periodTypes}
					periods={periodConfig?.periods}
				/>
			)}
		</>
	);
}
