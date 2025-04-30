import {
	DHIS2Map,
	MapProps,
	ThematicLayerConfig,
} from "@hisptz/dhis2-analytics";
import { Map as LeafletMap } from "leaflet";
import { MapConfig, MapLayerType } from "@packages/shared/schemas";
import React, { useMemo } from "react";
import { forEach, head, set } from "lodash";
import { OrgUnitSelection } from "@hisptz/dhis2-utils";

export interface MapViewProps {
	setRef: (map: LeafletMap) => void;
	mapConfig: MapConfig;
	periodSelection?: MapProps["periodSelection"];
	orgUnitSelection?: MapProps["orgUnitSelection"];
}

export function getOrgUnitSelectionFromIds(ous: string[]) {
	const orgUnitSelection: OrgUnitSelection = {
		orgUnits: [],
	};
	forEach(ous, (ou) => {
		if (ou === "USER_ORGUNIT") {
			set(orgUnitSelection, ["userOrgUnit"], true);
		} else if (ou === "USER_ORGUNIT_CHILDREN") {
			set(orgUnitSelection, ["userSubUnit"], true);
		} else if (ou === "USER_ORGUNIT_GRANDCHILDREN") {
			set(orgUnitSelection, ["userSubX2Unit"], true);
		} else {
			const orgUnits = [...(orgUnitSelection.orgUnits ?? [])];
			orgUnits.push({
				id: ou,
				children: [],
				path: "",
			});
			set(orgUnitSelection, ["orgUnits"], orgUnits);
		}
	});
	return orgUnitSelection;
}

export function MapVisualizer({
	mapConfig,
	setRef,
	periodSelection,
	orgUnitSelection,
}: MapViewProps) {
	const thematicLayers = useMemo(() => {
		return mapConfig.mapViews
			.filter((view) => view.layer.includes(MapLayerType.THEMATIC))
			.map((view) => {
				const dataItem = head(head(view.columns)!.items);
				return {
					id: view.id,
					type: view.thematicMapType.toLowerCase(),
					dataItem: {
						id: dataItem!.id,
						type: dataItem!.dimensionItemType,
						legendSet: view.legendSet?.id,
						displayName: view.id,
						legendConfig: {
							scale: view.classes,
							colorClass: view.colorScale,
						},
					},
					name: view.id,
					control: {
						enabled: true,
						position: "topright",
					},
					radius: view.radiusHigh,
				} as ThematicLayerConfig;
			});
	}, [mapConfig]);
	const boundaryLayer = useMemo(() => {
		return head(
			mapConfig.mapViews
				.filter((view) => view.layer === MapLayerType.ORG_UNIT)
				.map((view) => {
					return {
						id: view.id,
						enabled: true,
					} as MapProps["boundaryLayer"];
				}),
		);
	}, [mapConfig]);

	const activePeriodSelection = useMemo(() => {
		if (periodSelection) {
			return periodSelection;
		}
		//This is a hack for now as there may be differences in map view periods
		const periods = head(
			mapConfig.mapViews.filter((view) =>
				view.layer.includes(MapLayerType.THEMATIC),
			),
		)!
			.filters.map(({ items }) => items.map(({ id }) => id))
			.flat();
		return {
			periods,
		};
	}, [mapConfig.mapViews, periodSelection]);

	const activeOrgUnitSelection = useMemo(() => {
		if (orgUnitSelection) {
			return orgUnitSelection;
		}
		const orgUnitConfig = head(
			mapConfig.mapViews.filter((view) =>
				view.layer.includes(MapLayerType.THEMATIC),
			),
		)!
			.rows.map(({ items }) => items.map(({ id }) => id))
			.flat();

		return getOrgUnitSelectionFromIds(orgUnitConfig);
	}, [mapConfig.mapViews, orgUnitSelection]);

	return (
		<DHIS2Map
			mapOptions={{
				trackResize: true,
				zoomControl: true,
				scrollWheelZoom: false,
				bounceAtZoomLimits: true,
				boxZoom: true,
				zoom: mapConfig.zoom ?? 1,
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
			legends={{
				collapsible: false,
				enabled: true,
				position: "topright",
			}}
			setRef={setRef}
			periodSelection={activePeriodSelection}
			boundaryLayer={boundaryLayer}
			orgUnitSelection={activeOrgUnitSelection}
			thematicLayers={thematicLayers}
			analyticsOptions={{
				displayProperty: "SHORTNAME",
			}}
		/>
	);
}
