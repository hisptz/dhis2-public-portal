import {
    getDataElementConfigs,
    getDataElementIdsFromMaps,
    getDataElementIdsFromVisualizations,
    getIndicatorConfigs,
    getIndicatorIdsFromMaps,
    getIndicatorIdsFromVisualizations,
    getMaps,
    getMapsConfig,
    getModuleConfigs,
    getVisualizationConfigs,
    getVisualizations,
} from "../../utils/visualizations";
import { compact, uniq, uniqBy } from "lodash";
import {
    getCategoryCombosFromDataElements,
    getIndicatorsSources,
    getLegendSets,
} from "../../utils/indicators";
import logger from "@/logging";
import { getDefaultCategoryValues, getDestinationDefaultCategoryValues } from "../../utils/default-categories";
import { pushToQueue } from "../../rabbit/publisher";
import { exportConfiguration } from "./utils/configuration-export";
import { getMetadataFromDashboards } from "../../utils/dashboard";
import { DatastoreNamespaces } from "@packages/shared/constants";
import { dhis2Client } from "@/clients/dhis2";

export interface ProcessedMetadata {
    legendSets: any;
    visualizations: {
        maps: any[];
        visualizations: any[];
    };
    dataItems: {
        indicators: any[];
        dataElements: any[];
    };
    indicatorTypes: {
        indicatorTypes: any[];
    };
    categories: {
        categories: any[];
        categoryCombos: any[];
        categoryOptions: any[];
        categoryOptionCombos: any[];
    };
}

export interface MetadataDownloadOptions {
    configId: string;
    metadataSource?: 'source' | 'flexiportal-config';
    selectedVisualizations?: Array<{ id: string; name: string }>;
    selectedMaps?: Array<{ id: string; name: string }>;
    selectedDashboards?: Array<{ id: string; name: string }>;
}

export async function downloadAndQueueMetadata(options: MetadataDownloadOptions): Promise<void> {
    try {
        const { configId } = options;
        logger.info(`Starting Options: ${JSON.stringify(options)}`);
        logger.info(`Starting metadata download and queue process for config: ${configId}`);

        const metadata = await downloadMetadata(options);
        const configuration = await exportConfiguration(configId);

        await pushToQueue(configId, 'metadataUpload', {
            metadata,
            configId,
            downloadedAt: new Date().toISOString()
        });
        await pushToQueue(configId, 'metadataUpload', {
            type: 'configuration',
            configuration,
            timestamp: new Date().toISOString()
        });

        logger.info(`Metadata successfully downloaded and queued for upload (config: ${configId})`);
    } catch (error) {
        logger.error(`Error during download and queue process for config ${options.configId}:`, error);
        throw error;
    }
}

export async function downloadMetadata(options: MetadataDownloadOptions): Promise<ProcessedMetadata> {
    try {
        const { configId, metadataSource = 'flexiportal-config' } = options;
        const configUrl = `dataStore/${DatastoreNamespaces.DATA_SERVICE_CONFIG}/${configId}`;
        const { data: config } = await dhis2Client.get(configUrl);
        const routeId = config.source.routeId;

        if (!config?.source?.routeId) {
            throw new Error(`No routeId found in config ${configId}`);
        }
        // Fetch default category values dynamically
        logger.info("Fetching default category system values...");
        const sourceDefaults = await getDefaultCategoryValues(routeId);
        const destinationDefaults = await getDestinationDefaultCategoryValues();

        let visualizations: any[] = [];
        let maps: any[] = [];

        if (metadataSource === 'flexiportal-config') {
            logger.info("Loading Module Configs...");
            const moduleConfigs = await getModuleConfigs(routeId);

            logger.info("Extracting Visualizations from modules...");
            visualizations = [...getVisualizations(moduleConfigs ?? [])];

            logger.info("Extracting Maps from modules...");
            maps = [...getMaps(moduleConfigs ?? [])];

        } else if (metadataSource === 'source') {
            logger.info("Processing selected metadata items...");
            const selectedVisualizationIds = options.selectedVisualizations?.map(v => v.id) || [];

            const selectedMapIds = options.selectedMaps?.map(m => m.id) || [];

            let dashboardExtractedIds: { visualizationIds: string[]; mapIds: string[] } = { visualizationIds: [], mapIds: [] };
            if (options.selectedDashboards && options.selectedDashboards.length > 0) {
                const dashboardIds = options.selectedDashboards.map(d => d.id);
                dashboardExtractedIds = await getMetadataFromDashboards(dashboardIds, routeId);
            }

            const allVisualizationIds = [...new Set([
                ...selectedVisualizationIds,
                ...dashboardExtractedIds.visualizationIds
            ])];

            const allMapIds = [...new Set([
                ...selectedMapIds,
                ...dashboardExtractedIds.mapIds
            ])];

            logger.info(`Total visualizations to process: ${allVisualizationIds.length}`);
            logger.info(`Total maps to process: ${allMapIds.length}`);

            visualizations = allVisualizationIds.map(id => ({ id }));
            maps = allMapIds.map(id => ({ id }));
        }

        logger.info("Fetching Map Configs...");
        const mapsConfig = maps.length > 0 ? (await getMapsConfig(maps, routeId)) ?? [] : [];

        logger.info("Fetching Visualization Configs...");
        const visualizationConfig = visualizations.length > 0 ? await getVisualizationConfigs(visualizations, routeId) : [];

        logger.info("Collecting Indicator IDs...");
        const indicatorIds = [
            ...(getIndicatorIdsFromMaps(mapsConfig ?? []) ?? []),
            ...getIndicatorIdsFromVisualizations(visualizationConfig ?? []),
        ];
        logger.info(`Collected ${indicatorIds.length} unique indicator IDs`, {
            indicatorIds: indicatorIds.slice(0, 10),
            totalCount: indicatorIds.length
        });

        logger.info("Collecting Data Element IDs...");
        const dataElementIds = [
            ...(getDataElementIdsFromMaps(mapsConfig ?? []) ?? []),
            ...getDataElementIdsFromVisualizations(visualizationConfig ?? []),
        ];
        logger.info(`Collected ${dataElementIds.length} unique data element IDs`, {
            dataElementIds: dataElementIds.slice(0, 10),
            totalCount: dataElementIds.length
        });

        logger.info("Fetching Indicators...");
        const indicators = await getIndicatorConfigs(indicatorIds, configId);
        logger.info(`Successfully fetched ${indicators.length} indicators`);

        logger.info("Fetching Data Elements...");
        const dataElements = await getDataElementConfigs(dataElementIds, configId);
        logger.info(`Successfully fetched ${dataElements.length} data elements`);

        logger.info("Getting Indicator Sources...");
        const indicatorMeta = await getIndicatorsSources(indicators, configId);
        dataElements.push(...indicatorMeta.dataElements);

        logger.info("Getting Category Combos...");
        const dataElementMeta = await getCategoryCombosFromDataElements(
            uniqBy(dataElements, "id"),
            configId
        );

        logger.info("Collecting categories...");
        const categories = [...indicatorMeta.categories, ...dataElementMeta.categories];

        logger.info("Collecting category options...");
        const categoryOptions = [
            ...indicatorMeta.categoryOptions,
            ...dataElementMeta.categoryOptions,
        ];

        logger.info("Collecting category combos...");
        const categoryCombos = [
            ...indicatorMeta.categoryCombos,
            ...dataElementMeta.categoryCombos,
        ];

        logger.info("Collecting category option combos...");
        const categoryOptionCombos = [
            ...indicatorMeta.categoryOptionCombos,
            ...dataElementMeta.categoryOptionCombos,
        ];

        logger.info("Collecting legend sets IDs...");
        const legendSetIds: string[] = [
            ...dataElements
                .map(({ legendSets }) => legendSets?.map(({ id }: { id: string }) => id) || [])
                .flat(),
            ...indicators
                .map(({ legendSets }) => legendSets?.map(({ id }: { id: string }) => id) || [])
                .flat(),
            ...compact(visualizationConfig?.map(({ legend }) => legend?.set?.id)),
            ...compact(
                mapsConfig
                    .map(({ mapViews }) =>
                        mapViews?.map(
                            ({ legendSet }: { legendSet: { id: string } }) => legendSet?.id
                        ) || []
                    )
                    .flat()
            ),
        ];

        logger.info("Fetching LegendSets...");
        const legendSets = legendSetIds.length > 0 ? await getLegendSets(uniq(legendSetIds), routeId) : [];
        logger.info(`Total LegendSets fetched: ${legendSets}`);
        // Process and return metadata
        const processedMetadata: ProcessedMetadata = {
            legendSets,
            visualizations: {
                maps: uniqBy(mapsConfig, "id"),
                visualizations: uniqBy(visualizationConfig, "id"),
            },
            dataItems: {
                indicators: uniqBy(indicators, "id").map((entity) => ({
                    ...entity,
                    translations: [],
                    attributeValues: [],
                })),
                dataElements: uniqBy(dataElements, "id")
                    .map((entity) => ({
                        ...entity,
                        translations: [],
                        attributeValues: [],
                    }))
                    .map((dataElement) => {
                        if (
                            dataElement.categoryCombo?.id === sourceDefaults.defaultCategoryComboId
                        ) {
                            return {
                                ...dataElement,
                                categoryCombo: { id: destinationDefaults.defaultCategoryComboId },
                            };
                        }
                        return dataElement;
                    }),
            },
            indicatorTypes: {
                indicatorTypes: indicatorMeta.indicatorTypes,
            },
            categories: {
                categories: uniqBy(categories, "id").filter(
                    (category) => category.id != sourceDefaults.defaultCategoryId
                ),
                categoryCombos: uniqBy(categoryCombos, "id").filter(
                    (combo) => combo.id != sourceDefaults.defaultCategoryComboId
                ),
                categoryOptions: uniqBy(categoryOptions, "id").filter(
                    (option) => option.id != sourceDefaults.defaultCategoryOptionId
                ),
                categoryOptionCombos: uniqBy(categoryOptionCombos, "id").filter(
                    (optionCombo: any) => optionCombo && optionCombo.name && !(optionCombo.name as string).includes("default")
                ),
            },
        };

        logger.info(`Metadata download completed successfully. Source: ${metadataSource}`);
        return processedMetadata;

    } catch (error) {
        logger.error("Error during metadata download:", error);
        throw error;
    }
}
