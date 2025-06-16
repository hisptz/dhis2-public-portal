"use client";

import {
	AnalyticsData,
	MapConfig,
	MapLayerType,
} from "@packages/shared/schemas";
import { flattenDeep, head } from "lodash";
import { OrgUnitSelection } from "@hisptz/dhis2-utils";
import { getOrgUnitsSelection } from "@/utils/orgUnits";

// @ts-ignore
import { useDataQuery } from "@dhis2/app-runtime";
import { Loader } from "@mantine/core";
import i18n from "@dhis2/d2-i18n";
import dynamic from "next/dynamic";
import { RefObject, useMemo } from "react";
import { getOrgUnitSelectionFromIds } from "@packages/ui/visualizations";

const NoSSRDHIS2Table = dynamic(
	() =>
		import("@hisptz/dhis2-analytics").then(({ DHIS2PivotTable }) => ({
			default: DHIS2PivotTable,
		})),
	{
		ssr: false,
		loading: () => {
			return (
				<div className="w-full h-full flex items-center justify-center min-h-[400px]">
					<Loader size="md" />
				</div>
			);
		},
	},
);

const query: any = {
	data: {
		resource: "analytics",
		params: ({
			dx,
			ou,
			pe,
		}: {
			dx: string[];
			ou: string[];
			pe: string[];
		}) => {
			return {
				dimension: `dx:${dx.join(";")},ou:${ou.join(";")}`,
				filter: `pe:${pe.join(";")}`,
				includeMetadataDetails: "true",
			};
		},
	},
};

type ResponseType = {
	data: AnalyticsData;
};

export function MapTableComponent({
	mapConfig,
	setRef,
	orgUnitSelection,
	periodSelection,
	fullScreen,
}: {
	mapConfig: MapConfig;
	setRef: RefObject<HTMLTableElement | null>;
	orgUnitSelection?: OrgUnitSelection;
	fullScreen: boolean;
	periodSelection?: {
		periods: string[];
	};
}) {
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

	const dx = flattenDeep(
		mapConfig.mapViews.map((view) =>
			view.columns.map(({ items }) => items.map(({ id }) => id)),
		),
	);

	const ou = getOrgUnitsSelection(activeOrgUnitSelection);
	const pe = activePeriodSelection.periods;
	const { loading, data, error } = useDataQuery<ResponseType>(query, {
		variables: {
			ou,
			pe,
			dx,
		},
	});

	if (loading) {
		return (
			<div className="flex justify-center items-center h-full">
				<Loader size="md" />{" "}
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex justify-center items-center h-full">
				<span>
					{i18n.t("Error getting data")}:{error.message}
				</span>
			</div>
		);
	}

	return (
		<NoSSRDHIS2Table
			setRef={setRef as any}
			tableProps={{
				scrollHeight: fullScreen ? `calc(100dvh - 96px)` : `600px`,
			}}
			analytics={data?.data as any}
			config={{
				options: {
					fixColumnHeaders: true,
					fixRowHeaders: true,
				},
				layout: {
					columns: [
						{
							dimension: "dx",
						},
					],
					filter: [
						{
							dimension: "pe",
						},
					],
					rows: [
						{
							dimension: "ou",
						},
					],
				},
			}}
		/>
	);
}
