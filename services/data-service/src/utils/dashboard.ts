import { getSourceClientFromConfig } from "../clients/dhis2";
import logger from "@/logging";

export interface DashboardItem {
    id: string;
    name: string;
}

export interface ExtractedMetadataIds {
    visualizationIds: string[];
    mapIds: string[];
}
 
export async function getMetadataFromDashboards(
    dashboardIds: string[],
    configId: string
): Promise<ExtractedMetadataIds> {
    if (!dashboardIds || dashboardIds.length === 0) {
        return { visualizationIds: [], mapIds: [] };
    }

    try {
        logger.info(`Extracting metadata from ${dashboardIds.length} dashboards`);
        
        const client = await getSourceClientFromConfig(configId);
        
        const response = await client.get('/dashboards', {
            params: {
                fields: 'id,name,dashboardItems[id,type,visualization[id],map[id]]',
                filter: `id:in:[${dashboardIds.join(',')}]`,
                paging: false
            }
        });

        const dashboards = response.data?.dashboards || [];
        const visualizationIds: string[] = [];
        const mapIds: string[] = [];

        dashboards.forEach((dashboard: any) => {
            logger.info(`Processing dashboard: ${dashboard.name} (${dashboard.id})`);
            
            dashboard.dashboardItems?.forEach((item: any) => {
                if (item.type === 'VISUALIZATION' && item.visualization?.id) {
                    visualizationIds.push(item.visualization.id);
                } else if (item.type === 'MAP' && item.map?.id) {
                    mapIds.push(item.map.id);
                }
            });
        });

        // Remove duplicates
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