import logger from "@/logging";
import { dhis2Client } from "@/clients/dhis2";
import { ExportedConfiguration, ConfigurationData, validateConfiguration } from "./configuration-export";

export interface ConfigurationImportResult {
  namespace: string;
  totalKeys: number;
  successfulKeys: number;
  failedKeys: string[];
  errors: string[];
}

export interface ConfigurationImportSummary {
  configId: string;
  totalNamespaces: number;
  successfulNamespaces: number;
  results: ConfigurationImportResult[];
  importedAt: string;
  duration: number;
}

/**
 * Import configurations to destination DataStore
 */
export async function importConfiguration(
  configId: string, 
  configuration: ExportedConfiguration
): Promise<ConfigurationImportSummary> {
  const startTime = Date.now();
  
  try {
    logger.info(`Starting configuration import for config: ${configId}`);
    
    // Validate configuration structure
    if (!validateConfiguration(configuration)) {
      throw new Error("Invalid configuration structure");
    }

    const destinationClient = dhis2Client;
    const results: ConfigurationImportResult[] = [];
    let successfulNamespaces = 0;

    // Import each namespace
    for (const namespaceData of configuration.namespaces) {
      logger.info(`Importing namespace: ${namespaceData.namespace}`);
      
      const result = await importNamespace(destinationClient, namespaceData);
      results.push(result);
      
      if (result.failedKeys.length === 0) {
        successfulNamespaces++;
      }
    }

    const duration = Date.now() - startTime;
    const summary: ConfigurationImportSummary = {
      configId,
      totalNamespaces: configuration.namespaces.length,
      successfulNamespaces,
      results,
      importedAt: new Date().toISOString(),
      duration
    };

    logger.info(`Configuration import completed. ${successfulNamespaces}/${configuration.namespaces.length} namespaces imported successfully in ${duration}ms`);
    return summary;

  } catch (error) {
    logger.error("Error during configuration import:", error);
    throw error;
  }
}

/**
 * Import a single namespace to destination DataStore
 */
async function importNamespace(
  client: any,
  namespaceData: ConfigurationData
): Promise<ConfigurationImportResult> {
  const { namespace, keys } = namespaceData;
  const totalKeys = Object.keys(keys).length;
  const failedKeys: string[] = [];
  const errors: string[] = [];
  
  try {
    logger.info(`Importing ${totalKeys} keys to namespace: ${namespace}`);

    // Import each key-value pair
    for (const [key, value] of Object.entries(keys)) {
      try {
        // Check if key already exists
        let shouldUpdate = true;
        try {
          const existingResponse = await client.get(`dataStore/${namespace}/${key}`);
          if (existingResponse.data) {
            logger.info(`Key ${namespace}/${key} already exists - updating`);
          }
        } catch (error) {
           if (error instanceof Error && error.message.includes('404')) {
            logger.info(`Key ${namespace}/${key} doesn't exist - creating`);
          } else {
            throw error;  
          }
        }

         if (shouldUpdate) {
          await client.put(`dataStore/${namespace}/${key}`, value);
          logger.info(`✓ Imported key: ${namespace}/${key}`);
        }

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.warn(`Failed to import key ${namespace}/${key}: ${errorMessage}`);
        failedKeys.push(key);
        errors.push(`${key}: ${errorMessage}`);
      }
    }

    const successfulKeys = totalKeys - failedKeys.length;
    logger.info(`Namespace ${namespace} import completed: ${successfulKeys}/${totalKeys} keys successful`);

    return {
      namespace,
      totalKeys,
      successfulKeys,
      failedKeys,
      errors
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Error importing namespace ${namespace}: ${errorMessage}`);
    
    return {
      namespace,
      totalKeys,
      successfulKeys: 0,
      failedKeys: Object.keys(keys),
      errors: [errorMessage]
    };
  }
}

/**
 * Process configuration from metadata upload queue
 * This integrates with the existing metadata workflow
 */
export async function processConfigurationFromQueue(
  configId: string,
  queueMessage: any
): Promise<ConfigurationImportSummary> {
  try {
    logger.info(`Processing configuration from queue for config: ${configId}`);
    
    // Extract configuration from queue message
    if (!queueMessage.configuration) {
      throw new Error("No configuration data found in queue message");
    }

    const configuration = queueMessage.configuration as ExportedConfiguration;
    
    // Import the configuration
    const summary = await importConfiguration(configId, configuration);
    
    logger.info(`Configuration processing from queue completed successfully`);
    return summary;

  } catch (error) {
    logger.error(`Error processing configuration from queue for config ${configId}:`, error);
    throw error;
  }
}

/**
 * Validate if a DataStore namespace exists and is accessible
 */
export async function validateNamespaceAccess(
  client: any,
  namespace: string
): Promise<boolean> {
  try {
    await client.get(`dataStore/${namespace}`);
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('404')) {
      logger.info(`Namespace ${namespace} does not exist - will be created during import`);
      return true;  
    }
    logger.warn(`Error accessing namespace ${namespace}: ${error}`);
    return false;
  }
}

/**
 * Get import statistics for a configuration
 */
export function getImportStatistics(summary: ConfigurationImportSummary): {
  totalKeys: number;
  successfulKeys: number;
  failedKeys: number;
  successRate: number;
} {
  const totalKeys = summary.results.reduce((sum, result) => sum + result.totalKeys, 0);
  const successfulKeys = summary.results.reduce((sum, result) => sum + result.successfulKeys, 0);
  const failedKeys = totalKeys - successfulKeys;
  const successRate = totalKeys > 0 ? (successfulKeys / totalKeys) * 100 : 0;

  return {
    totalKeys,
    successfulKeys,
    failedKeys,
    successRate
  };
}