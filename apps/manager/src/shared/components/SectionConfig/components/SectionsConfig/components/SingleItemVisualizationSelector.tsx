import { useDataQuery } from "@dhis2/app-runtime";
import { useWatch } from "react-hook-form";
import React, { useEffect, useMemo, useState } from "react";
import { RHFSingleSelectField, RHFTextInputField } from "@hisptz/dhis2-ui";
import { capitalize, startCase } from "lodash";
import i18n from "@dhis2/d2-i18n";
import { SingleSelectField, SingleSelectOption } from "@dhis2/ui";
import {
	DisplayItemType,
	SectionModuleConfig,
	VisualizationChartType,
	VisualizationDisplayItemType,
} from "@packages/shared/schemas";

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

export function MapSelector({
	namePrefix,
}: {
	namePrefix: `config.sections.${number}.item`;
}) {
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
			name={`${namePrefix}.item.id`}
		/>
	);
}

export function VisSelector({
	namePrefix,
}: {
	namePrefix: `config.sections.${number}.item`;
}) {
	const [visualizationType, setVisualizationType] = useState<string>();
	const { data, loading, refetch } = useDataQuery<VisualizationQueryResponse>(
		visQuery as any,
	);

	const visId = useWatch<SectionModuleConfig>({
		name: `${namePrefix}.item.id`,
	});

	const visType = useWatch<SectionModuleConfig>({
		name: `${namePrefix}.type`,
	});

	const options = useMemo(
		() =>
			data?.vis?.visualizations.map(({ id, displayName, type }) => ({
				label: visualizationType
					? `${displayName}`
					: `${displayName} (${capitalize(type)})`,
				value: id,
				type: type,
			})) ?? [],
		[data?.vis?.visualizations, visualizationType],
	);

	useEffect(() => {
		if (visualizationType || visType) {
			refetch({
				type:
					visType == DisplayItemType.HIGHLIGHTED_SINGLE_VALUE
						? DisplayItemType.HIGHLIGHTED_SINGLE_VALUE
						: visualizationType,
			});
		}
	}, [refetch, visualizationType, visType]);

	useEffect(() => {
		const selectedVisualization = options.find(
			(option) => option.value === visId,
		);
		if (visualizationType !== selectedVisualization?.type && !loading) {
			setVisualizationType(selectedVisualization?.type);
		}
	}, [loading]);

	return (
		<div
			className={`flex flex-col ${visType === DisplayItemType.HIGHLIGHTED_SINGLE_VALUE ? "gap-2" : "gap-4"}`}
		>
			{visType != DisplayItemType.HIGHLIGHTED_SINGLE_VALUE && (
				<SingleSelectField
					required
					dataTest={"visualization-type-select"}
					label={i18n.t("Visualization type")}
					placeholder={i18n.t("All")}
					onChange={({ selected }) => setVisualizationType(selected)}
					selected={visualizationType}
				>
					{[
						...Object.values(VisualizationChartType).map(
							(type) => ({
								label: capitalize(startCase(type)),
								value: type,
							}),
						),
					].map((option) => (
						<SingleSelectOption
							key={option.value}
							label={option.label}
							value={option.value}
						/>
					))}
				</SingleSelectField>
			)}

			<RHFSingleSelectField
				required
				dataTest={"section-single-item-visualization"}
				disabled={loading}
				label={i18n.t("Visualization")}
				loading={loading}
				options={options}
				name={`${namePrefix}.item.id`}
			/>
			{visType == DisplayItemType.HIGHLIGHTED_SINGLE_VALUE && (
				<RHFTextInputField
					name={`${namePrefix}.item.icon`}
					label={i18n.t("Icon")}
				/>
			)}
		</div>
	);
}

export function SingleItemVisualizationSelector({
	namePrefix,
}: {
	namePrefix: `config.sections.${number}.item`;
}) {
	const visType = useWatch<SectionModuleConfig>({
		name: `${namePrefix}.item.type`,
	});

	if (visType == VisualizationDisplayItemType.MAP) {
		return <MapSelector namePrefix={namePrefix} />;
	}

	if (visType === VisualizationDisplayItemType.CHART) {
		return <VisSelector namePrefix={namePrefix} />;
	}

	return null;
}
