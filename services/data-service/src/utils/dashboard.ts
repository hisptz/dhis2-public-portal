import { createSourceClient } from "../clients/dhis2";
import logger from "@/logging";
import { fetchItemsInParallel } from "./parallel-fetch";

 
export interface ExtractedMetadataIds {
    visualizationIds: string[];
    mapIds: string[];
}

export async function getMetadataFromDashboards(
    dashboardIds: string[],
    routeId: string
): Promise<ExtractedMetadataIds> {
    if (!dashboardIds || dashboardIds.length === 0) {
        return { visualizationIds: [], mapIds: [] };
    }

    try {
        logger.info(`Extracting metadata from ${dashboardIds.length} dashboards`);

        const client = await createSourceClient(routeId);
        const dashboards = await fetchItemsInParallel(
            client,
            'dashboards',
            dashboardIds,
            'id,name,dashboardItems',
            5
        );

        const visualizationIds: string[] = [];
        const mapIds: string[] = [];

        dashboards.forEach((dashboard: any) => {
            dashboard.dashboardItems?.forEach((item: any) => {
                if (item.type === 'VISUALIZATION' && item.visualization?.id) {
                    visualizationIds.push(item.visualization.id);
                } else if (item.type === 'MAP' && item.map?.id) {
                    mapIds.push(item.map.id);
                }
            });
        });

        const uniqueVisualizationIds = [...new Set(visualizationIds)];
        const uniqueMapIds = [...new Set(mapIds)];
        logger.info(`Extracted ${uniqueVisualizationIds.length} visualizations and ${uniqueMapIds.length} maps from dashboards`);
        return {
            visualizationIds: uniqueVisualizationIds,
            mapIds: uniqueMapIds
        };
    } catch (error) {
        logger.error('Error extracting metadata from dashboards:', error);
        throw error;
    }
}