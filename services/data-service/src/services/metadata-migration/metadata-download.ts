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


export async function downloadAndQueueMetadata(configId: string): Promise<void> {
  try {
    logger.info(`Starting metadata download and queue process for config: ${configId}`);
    const metadata = await downloadMetadata(configId);
    await pushToQueue(configId, 'metadataUpload', { 
      metadata,
      configId,
      downloadedAt: new Date().toISOString()
    });
    logger.info(`Metadata successfully downloaded and queued for upload (config: ${configId})`);
  } catch (error) {
    logger.error(`Error during download and queue process for config ${configId}:`, error);
    
    // Push error to failed queue
    try {
      await pushToQueue(configId, 'failed', { 
        operation: 'metadata-download',
        configId,
        failedAt: new Date().toISOString()
      }, error);
    } catch (queueError) {
      logger.error('Failed to push error to failed queue:', queueError);
    }
    
    throw error;
  }
}

export async function downloadMetadata(configId?: string): Promise<ProcessedMetadata> {
  try {
    // Fetch default category values dynamically
    logger.info("Fetching default category system values...");
    const sourceDefaults = await getDefaultCategoryValues();
    const destinationDefaults = await getDestinationDefaultCategoryValues();

    logger.info("Loading Module Configs...");
    const moduleConfigs = await getModuleConfigs();

    logger.info("Extracting Visualizations...");
    const visualizations = [...getVisualizations(moduleConfigs ?? [])];

    logger.info("Extracting Maps...");
    const maps = [...getMaps(moduleConfigs ?? [])];

    logger.info("Fetching Map Configs...");
    const mapsConfig = (await getMapsConfig(maps)) ?? [];

    logger.info("Fetching Visualization Configs...");
    const visualizationConfig = await getVisualizationConfigs(visualizations);

    logger.info("Collecting Indicator IDs...");
    const indicatorIds = [
      ...(getIndicatorIdsFromMaps(mapsConfig ?? []) ?? []),
      ...getIndicatorIdsFromVisualizations(visualizationConfig ?? []),
    ];

    logger.info("Collecting Data Element IDs...");
    const dataElementIds = [
      ...(getDataElementIdsFromMaps(mapsConfig ?? []) ?? []),
      ...getDataElementIdsFromVisualizations(visualizationConfig ?? []),
    ];

    logger.info("Fetching Indicators...");
    const indicators = await getIndicatorConfigs(indicatorIds);

    logger.info("Fetching Data Elements...");
    const dataElements = await getDataElementConfigs(dataElementIds);

    logger.info("Getting Indicator Sources...");
    const indicatorMeta = await getIndicatorsSources(indicators);
    dataElements.push(...indicatorMeta.dataElements);

    logger.info("Getting Category Combos...");
    const dataElementMeta = await getCategoryCombosFromDataElements(
      uniqBy(dataElements, "id")
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
        .map(({ legendSets }) => legendSets.map(({ id }: { id: string }) => id))
        .flat(),
      ...indicators
        .map(({ legendSets }) => legendSets.map(({ id }: { id: string }) => id))
        .flat(),
      ...compact(visualizationConfig?.map(({ legend }) => legend?.set?.id)),
      ...compact(
        mapsConfig
          .map(({ mapViews }) =>
            mapViews.map(
              ({ legendSet }: { legendSet: { id: string } }) => legendSet?.id
            )
          )
          .flat()
      ),
    ];

    logger.info("Fetching LegendSets...");
    const legendSets = await getLegendSets(uniq(legendSetIds));

    // Process and return metadata instead of writing files
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
          (optionCombo: any) => !(optionCombo.name as string).includes("default")
        ),
      },
    };

    logger.info("Metadata download and processing completed successfully");
    return processedMetadata;

  } catch (error) {
    logger.error("Error during metadata download:", error);
    throw error;
  }
}


