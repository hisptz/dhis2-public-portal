import logger from "@/logging";
import { uploadMetadataFile } from "@/clients/dhis2";
import { ProcessedMetadata } from "./metadata-download";
import { processConfigurationFromQueue } from "./utils/configuration-import";
import * as fs from "node:fs";
import { updateProgress, completeJob } from "@/utils/progress-tracker";

export async function uploadMetadataFromQueue(jobData: any): Promise<void> {
  try {
    const { metadata, configId, type, configuration, totalItems = 0 } = jobData;

    if (!configId) {
      throw new Error(`No configId provided in job data. Job data keys: ${Object.keys(jobData || {}).join(', ')}`);
    }

    if (type === 'configuration') {
      logger.info(`Processing configuration upload for config: ${configId}`);

      if (!configuration) {
        throw new Error(`No configuration provided in job data for config: ${configId}`);
      }

      await processConfigurationFromQueue(configId, jobData);
      return;
    }

    logger.info(`Processing metadata upload for config: ${configId}`);

    if (!metadata) {
      throw new Error(`No metadata provided in job data for config: ${configId}. Job data keys: ${Object.keys(jobData || {}).join(', ')}`);
    }

    if (!validateMetadata(metadata)) {
      throw new Error(`Invalid metadata structure for config: ${configId}`);
    }

    await uploadMetadata(metadata, configId, totalItems);

    await completeJob(configId, 'metadata-upload');
    logger.info(`Metadata upload job completed successfully for config: ${configId}`);

  } catch (error: any) {
    logger.error(`Error processing upload job:`, {
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name,
      }
    });
    throw error;
  }
}


async function uploadCategoriesMetadata(categories: any, tempDir: string): Promise<void> {
  const maxItemsPerUpload = 500; 

  const totalCategories = categories.categories?.length || 0;
  const totalCategoryOptions = categories.categoryOptions?.length || 0;
  const totalCategoryCombos = categories.categoryCombos?.length || 0;
  const totalCategoryOptionCombos = categories.categoryOptionCombos?.length || 0;

  const totalItems = totalCategories + totalCategoryOptions + totalCategoryCombos + totalCategoryOptionCombos;

  if (totalItems <= maxItemsPerUpload) {
    const categoriesPath = `${tempDir}/categories.json`;
    await fs.promises.writeFile(
      categoriesPath,
      JSON.stringify(categories, null, 2),
      'utf8'
    );
    await uploadMetadataFile(categoriesPath);
  } else {
    if (categories.categories?.length > 0) {
      const categoriesPath = `${tempDir}/categories-only.json`;
      await fs.promises.writeFile(
        categoriesPath,
        JSON.stringify({ categories: categories.categories }, null, 2),
        'utf8'
      );
      await uploadMetadataFile(categoriesPath);
    }

    // Upload category options
    if (categories.categoryOptions?.length > 0) {
      const categoryOptionsPath = `${tempDir}/categoryOptions.json`;
      await fs.promises.writeFile(
        categoryOptionsPath,
        JSON.stringify({ categoryOptions: categories.categoryOptions }, null, 2),
        'utf8'
      );
      await uploadMetadataFile(categoryOptionsPath);
    }

    // Upload category combos
    if (categories.categoryCombos?.length > 0) {
      const categoryCombosPath = `${tempDir}/categoryCombos.json`;
      await fs.promises.writeFile(
        categoryCombosPath,
        JSON.stringify({ categoryCombos: categories.categoryCombos }, null, 2),
        'utf8'
      );
      await uploadMetadataFile(categoryCombosPath);
    }

    // Upload category option combos
    if (categories.categoryOptionCombos?.length > 0) {
      const categoryOptionCombosPath = `${tempDir}/categoryOptionCombos.json`;
      await fs.promises.writeFile(
        categoryOptionCombosPath,
        JSON.stringify({ categoryOptionCombos: categories.categoryOptionCombos }, null, 2),
        'utf8'
      );
      await uploadMetadataFile(categoryOptionCombosPath);
    }
  }
}

export async function uploadMetadata(metadata: ProcessedMetadata, configId?: string, totalItems: number = 5): Promise<void> {
   let tempDir: string | undefined;

  try {
    logger.info(`Starting metadata upload${configId ? ` for config ${configId}` : ''}...`);

    // Create temporary files for upload
    const timestamp = Date.now();
    tempDir = `outputs/temp-${timestamp}`;

    // Write legend sets
    logger.info("Writing Legend Sets to temporary file...");
    const legendSetsPath = `${tempDir}/legendSets.json`;
    await fs.promises.mkdir(tempDir, { recursive: true });
    await fs.promises.writeFile(
      legendSetsPath,
      JSON.stringify(metadata.legendSets, null, 2),
      'utf8'
    );

    // Write visualizations & maps
    logger.info("Writing Visualizations & Maps to temporary file...");
    const visualizationsPath = `${tempDir}/visualizations.json`;
    await fs.promises.writeFile(
      visualizationsPath,
      JSON.stringify(metadata.visualizations, null, 2),
      'utf8'
    );

    // Write indicators & data elements
    logger.info("Writing Indicators & Data Elements to temporary file...");
    const dataItemsPath = `${tempDir}/dataItems.json`;
    await fs.promises.writeFile(
      dataItemsPath,
      JSON.stringify(metadata.dataItems, null, 2),
      'utf8'
    );

    // Write indicator types
    logger.info("Writing Indicator Types to temporary file...");
    const indicatorTypesPath = `${tempDir}/indicatorTypes.json`;
    await fs.promises.writeFile(
      indicatorTypesPath,
      JSON.stringify(metadata.indicatorTypes, null, 2),
      'utf8'
    );

    // Upload files in the correct order (dependencies first)
    logger.info("Starting upload of metadata files...");

    let currentStep = 0;

    // Upload legend sets first (they don't depend on anything)
    currentStep++;
    if (configId) await updateProgress(configId, 'metadata-upload', totalItems, currentStep);
    await uploadMetadataFile(legendSetsPath);

    // Upload indicator types (needed for indicators)
    currentStep++;
    if (configId) await updateProgress(configId, 'metadata-upload', totalItems, currentStep);
    await uploadMetadataFile(indicatorTypesPath);

    // Upload categories (needed for data elements) - split if too large
    logger.info("Uploading Categories, CategoryCombos, CategoryOptions & CategoryOptionCombos...");
    currentStep++;
    if (configId) await updateProgress(configId, 'metadata-upload', totalItems, currentStep);
    await uploadCategoriesMetadata(metadata.categories, tempDir);

    // Upload data items (indicators and data elements)
    currentStep++;
    if (configId) await updateProgress(configId, 'metadata-upload', totalItems, currentStep);
    await uploadMetadataFile(dataItemsPath);

    // Upload visualizations last (they depend on data items)
    currentStep++;
    if (configId) await updateProgress(configId, 'metadata-upload', totalItems, currentStep);
    await uploadMetadataFile(visualizationsPath);

    logger.info("Cleaning up temporary files...");
    try {
      await fs.promises.rm(tempDir, { recursive: true, force: true });
      logger.info("Temporary files cleaned up successfully");
    } catch (cleanupError) {
      logger.warn("Failed to clean up temporary files:", cleanupError);
    }

    logger.info(
      `Metadata upload completed successfully${configId ? ` for config ${configId}` : ''}!`
    );

  } catch (error) {
    if (tempDir) {
      logger.info("Cleaning up temporary files after error...");
      try {
        await fs.promises.rm(tempDir, { recursive: true, force: true });
        logger.info("Cleaned up temp files after error");
      } catch (cleanupError) {
        logger.warn("Failed to clean up temp files after error:", cleanupError);
      }
    }

    logger.error(`Error during metadata upload${configId ? ` for config ${configId}` : ''}:`, error);
    throw error;
  }
}


export function validateMetadata(metadata: any): metadata is ProcessedMetadata {
  try {
    const requiredProps = ['legendSets', 'visualizations', 'dataItems', 'indicatorTypes', 'categories'];

    for (const prop of requiredProps) {
      if (!(prop in metadata)) {
        logger.error(`Missing required property: ${prop}`);
        return false;
      }
    }

    if (!metadata.visualizations.maps || !metadata.visualizations.visualizations) {
      logger.error("Invalid visualizations structure");
      return false;
    }

    if (!metadata.dataItems.indicators || !metadata.dataItems.dataElements) {
      logger.error("Invalid dataItems structure");
      return false;
    }

    const categoryProps = ['categories', 'categoryCombos', 'categoryOptions', 'categoryOptionCombos'];
    for (const prop of categoryProps) {
      if (!(prop in metadata.categories)) {
        logger.error(`Missing category property: ${prop}`);
        return false;
      }
    }

    logger.info("Metadata validation passed");
    return true;

  } catch (error) {
    logger.error("Error during metadata validation:", error);
    return false;
  }
}
