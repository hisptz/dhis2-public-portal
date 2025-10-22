import logger from "@/logging";
import { uploadMetadataFile } from "@/clients/dhis2";
import { ProcessedMetadata } from "./metadata-download";
import * as fs from "node:fs";
import * as path from "node:path";

/**
 * Uploads processed metadata to the destination DHIS2 instance
 * @param metadata - The processed metadata to upload
 * @param configId - The configuration ID for tracking
 */
export async function uploadMetadata(metadata: ProcessedMetadata, configId?: string): Promise<void> {
  // Declare tempDir at function scope so it's accessible in catch block
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

    // Write categories
    logger.info("Writing Categories, CategoryCombos, CategoryOptions & CategoryOptionCombos to temporary file...");
    const categoriesPath = `${tempDir}/categories.json`;
    await fs.promises.writeFile(
      categoriesPath,
      JSON.stringify(metadata.categories, null, 2),
      'utf8'
    );

    // Upload files in the correct order (dependencies first)
    logger.info("Starting upload of metadata files...");
    
    // Upload legend sets first (they don't depend on anything)
    await uploadMetadataFile(legendSetsPath);
    
    // Upload indicator types (needed for indicators)
    await uploadMetadataFile(indicatorTypesPath);
    
    // Upload categories (needed for data elements)
    await uploadMetadataFile(categoriesPath);
    
    // Upload data items (indicators and data elements)
    await uploadMetadataFile(dataItemsPath);
    
    // Upload visualizations last (they depend on data items)
    await uploadMetadataFile(visualizationsPath);

    // Clean up temporary files
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
    // Clean up temp files on error
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

/**
 * Uploads metadata from a queue message
 * This function is designed to be called by queue consumers
 * @param jobData - The job data from the queue containing metadata and configId
 */
export async function uploadMetadataFromQueue(jobData: any): Promise<void> {
  try {
    const { metadata, configId, downloadedAt } = jobData;
    
    logger.info(`Processing metadata upload job for config: ${configId}`, {
      hasMetadata: !!metadata,
      downloadedAt,
      jobDataKeys: Object.keys(jobData || {}),
    });
    
    if (!metadata) {
      throw new Error(`No metadata provided in job data for config: ${configId}. Job data keys: ${Object.keys(jobData || {}).join(', ')}`);
    }

    if (!configId) {
      throw new Error(`No configId provided in job data. Job data keys: ${Object.keys(jobData || {}).join(', ')}`);
    }

    // Validate metadata structure
    if (!validateMetadata(metadata)) {
      throw new Error(`Invalid metadata structure for config: ${configId}`);
    }
    
    await uploadMetadata(metadata, configId);
    
    logger.info(`Metadata upload job completed successfully for config: ${configId}`);
    
  } catch (error: any) {
    logger.error(`Error processing metadata upload job:`, {
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name,
      },
      jobData: {
        configId: jobData?.configId,
        hasMetadata: !!jobData?.metadata,
        downloadedAt: jobData?.downloadedAt,
        jobDataKeys: Object.keys(jobData || {}),
      }
    });
    throw error;
  }
}

/**
 * Validates that the metadata structure is correct before upload
 * @param metadata - The metadata to validate
 * @returns boolean indicating if metadata is valid
 */
export function validateMetadata(metadata: any): metadata is ProcessedMetadata {
  try {
    // Check if all required properties exist
    const requiredProps = ['legendSets', 'visualizations', 'dataItems', 'indicatorTypes', 'categories'];
    
    for (const prop of requiredProps) {
      if (!(prop in metadata)) {
        logger.error(`Missing required property: ${prop}`);
        return false;
      }
    }

    // Check nested structure for visualizations
    if (!metadata.visualizations.maps || !metadata.visualizations.visualizations) {
      logger.error("Invalid visualizations structure");
      return false;
    }

    // Check nested structure for dataItems
    if (!metadata.dataItems.indicators || !metadata.dataItems.dataElements) {
      logger.error("Invalid dataItems structure");
      return false;
    }

    // Check nested structure for categories
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
