import { dhis2HttpClient } from "@/utils/api/dhis2";
import { ChartVisualizationItem, MapConfig } from "@packages/shared/schemas";
import { MapVisComponent } from "@/components/displayItems/visualizations/MapVisComponent";

export interface MainVisualizationProps {
	config: ChartVisualizationItem;
	disableActions?: boolean;
}

export async function MapVisualization({
	config,
	disableActions,
}: MainVisualizationProps) {
	const { id } = config;

	const mapConfig = await dhis2HttpClient.get<MapConfig>(`maps/${id}`, {
		params: {
			fields: [
				"id",
				"user",
				"displayName~rename(name)",
				"description",
				"longitude",
				"latitude",
				"zoom",
				"basemap",
				"publicAccess",
				"created",
				"lastUpdated",
				"access",
				"update",
				"manage",
				"delete",
				"href",
				"mapViews[*,columns[dimension,filter,items[dimensionItem~rename(id),dimensionItemType,displayName~rename(name)]],rows[dimension,filter,items[dimensionItem~rename(id),dimensionItemType,displayName~rename(name)]],filters[dimension,filter,items[dimensionItem~rename(id),dimensionItemType,displayName~rename(name)]],organisationUnits[id,path],dataDimensionItems,program[id,displayName~rename(name)],programStage[id,displayName~rename(name)],legendSet[id,displayName~rename(name)],trackedEntityType[id,displayName~rename(name)],organisationUnitSelectionMode,!href,!publicAccess,!rewindRelativePeriods,!userOrganisationUnit,!userOrganisationUnitChildren,!userOrganisationUnitGrandChildren,!externalAccess,!access,!relativePeriods,!columnDimensions,!rowDimensions,!filterDimensions,!user,!organisationUnitGroups,!itemOrganisationUnitGroups,!userGroupAccesses,!indicators,!dataElements,!dataElementOperands,!dataElementGroups,!dataSets,!periods,!organisationUnitLevels,!sortOrder,!topLimit]",
			].join(","),
		},
	});

	if (!mapConfig) {
		console.error(`Could not get map details for map ${config.id}`);
		throw Error("Could not get map details");
	}

	return (
		<MapVisComponent
			disableActions={disableActions}
			mapConfig={mapConfig}
			config={config}
		/>
	);
}
