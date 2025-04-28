import { dhis2HttpClient } from "@/utils/api/dhis2";

import { OrganisationUnit, OrgUnitSelection } from "@hisptz/dhis2-utils";
import { camelCase, compact, find, head, isEmpty, uniqBy } from "lodash";
import { DataItemType, ThematicLayerConfig } from "@hisptz/dhis2-analytics";
import { getMapPeriods } from "@/utils/visualizer";
import { MapVisComponent } from "@/components/displayItems/visualizations/MapVisComponent";
import { ChartVisualizationItem, MapConfig } from "@packages/shared/schemas";

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
			fields: "*,mapViews[id,organisationUnitLevels,periods,relativePeriods,itemOrganisationUnitGroups,organisationUnits[id,path],displayName,legendSet[id]dataDimensionItems[*],classes,colorScale,rows[id,dimension,items],columns[id,dimension,items],filters[id,dimension,items]]",
		},
	});

	const mainMapView = find(
		mapConfig.mapViews,
		({ dataDimensionItems }) => !isEmpty(dataDimensionItems),
	);

	const thematicLayers: ThematicLayerConfig[] = compact(
		uniqBy(mapConfig.mapViews, "displayName").map(
			({ id, legendSet, classes, displayName, dataDimensionItems }) => {
				const dataItem = head(dataDimensionItems);

				const dataType = camelCase(
					dataItem?.dataDimensionItemType.toLowerCase() as DataItemType,
				);

				const dataId =
					dataItem?.[
						dataType as
							| "indicator"
							| "dataElement"
							| "programIndicator"
					]?.id;

				if (!dataId) return null;

				return {
					enabled: true,
					control: {
						enabled: true,
						position: "topright",
					},
					id,
					type: "choropleth",
					dataItem: {
						id: dataId,
						type: dataType as DataItemType,
						legendConfig: {
							scale: classes ?? 5,
							colorClass: "YlOrBr",
						},
						legendSet: legendSet ? legendSet?.id : undefined,
						displayName,
					},
				};
			},
		),
	);

	const orgUnitSelection: OrgUnitSelection = {
		orgUnits: mainMapView?.organisationUnits as OrganisationUnit[],
		userOrgUnit: mainMapView?.userOrganisationUnit,
		userSubUnit: mainMapView?.userOrganisationUnitChildren,
		userSubX2Unit: mainMapView?.userOrganisationUnitGrandChildren,
		levels: mainMapView?.organisationUnitLevels?.map((level) =>
			level.toString(),
		),
		groups: mainMapView?.itemOrganisationUnitGroups,
	};

	const periods = getMapPeriods(mainMapView!);

	return (
		<MapVisComponent
			disableActions={disableActions}
			mapConfig={mapConfig}
			config={config}
			thematicLayers={thematicLayers}
			periods={periods}
			orgUnitSelection={orgUnitSelection}
		/>
	);
}
