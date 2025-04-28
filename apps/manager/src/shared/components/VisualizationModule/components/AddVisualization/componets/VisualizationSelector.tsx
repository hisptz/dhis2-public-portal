import { useDataQuery } from "@dhis2/app-runtime";
import { useWatch } from "react-hook-form";
import React, { useEffect, useMemo, useState } from "react";
import { RHFSingleSelectField } from "@hisptz/dhis2-ui";
import { capitalize } from "lodash";
import i18n from "@dhis2/d2-i18n";
import { SingleSelectField, SingleSelectOption } from "@dhis2/ui";
import { VisualizationItem, VisualizationType } from "@packages/shared/schemas";

const visQuery = {
	vis: {
		resource: "visualizations",
		params: ({ type }: { type: string }) => {
			return {
				fields: ["id", "displayName", "type"],
				order: "name:asc",
				paging: false,
				filter: type ? [`type:eq:${type}`] : undefined,
			};
		},
	},
};

type VisualizationQueryResponse = {
	vis: {
		visualizations: Array<{
			id: string;
			displayName: string;
			type: string;
		}>;
	};
};

const mapQuery = {
	maps: {
		resource: "maps",
		params: ({}) => {
			return {
				fields: ["id", "displayName"],
				paging: false,
			};
		},
	},
};

type MapQueryResponse = {
	maps: {
		maps: Array<{
			id: string;
			displayName: string;
		}>;
	};
};

export function MapSelector() {
	const { data, loading } = useDataQuery<MapQueryResponse>(mapQuery);

	const options = useMemo(
		() =>
			data?.maps?.maps.map(({ id, displayName }) => ({
				label: displayName,
				value: id,
			})) ?? [],
		[data],
	);

	return (
		<RHFSingleSelectField
			label={i18n.t("Map")}
			loading={loading}
			options={options}
			name={"id"}
		/>
	);
}

export function VisSelector() {
	const [visualizationType, setVisualizationType] = useState<string>();
	const { data, loading, refetch } = useDataQuery<VisualizationQueryResponse>(
		visQuery as any,
	);
	const options = useMemo(
		() =>
			data?.vis?.visualizations.map(({ id, displayName, type }) => ({
				label: visualizationType
					? `${displayName}`
					: `${displayName} (${capitalize(type)})`,
				value: id,
			})) ?? [],
		[data],
	);

	useEffect(() => {
		if (visualizationType) {
			refetch({
				type: visualizationType,
			});
		}
	}, [visualizationType]);

	return (
		<div className="flex flex-col gap-4 ">
			<SingleSelectField
				required
				label={i18n.t("Visualization type")}
				placeholder={i18n.t("All")}
				onChange={({ selected }) => setVisualizationType(selected)}
				selected={visualizationType}
			>
				{[
					{
						label: i18n.t("Column"),
						value: "COLUMN",
					},
					{
						label: i18n.t("Bar"),
						value: "BAR",
					},
					{
						label: i18n.t("Line"),
						value: "LINE",
					},
					{
						label: i18n.t("Pie"),
						value: "PIE",
					},
					{
						label: i18n.t("Gauge"),
						value: "GAUGE",
					},
					{
						label: i18n.t("Single value"),
						value: "SINGLE_VALUE",
					},
					{
						label: i18n.t("Column chart"),
						value: "PIVOT_TABLE",
					},
				].map((option) => (
					<SingleSelectOption
						key={option.value}
						label={option.label}
						value={option.value}
					/>
				))}
			</SingleSelectField>
			<RHFSingleSelectField
				required
				disabled={loading}
				label={i18n.t("Visualization")}
				loading={loading}
				options={options}
				name={"id"}
			/>
		</div>
	);
}

export function VisualizationSelector() {
	const visType = useWatch<VisualizationItem>({
		name: "type",
	});

	if (visType == VisualizationType.MAP) {
		return <MapSelector />;
	}

	if (visType === VisualizationType.CHART) {
		return <VisSelector />;
	}

	return null;
}
