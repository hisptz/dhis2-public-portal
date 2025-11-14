import logger from "@/logging";
import { getSourceClientFromConfig, dhis2Client } from "@/clients/dhis2";
import { DatastoreNamespaces } from "@packages/shared/constants";
import { pushToQueue } from "../../../rabbit/publisher";

export interface ConfigurationData {
  namespace: string;
  keys: { [key: string]: any };
}

export interface ExportedConfiguration {
  namespaces: ConfigurationData[];
  exportedAt: string;
  sourceConfigId: string;
}

/**
 * Export configurations from source DataStore and queue for upload to destination
 */
export async function exportAndQueueConfiguration(configId: string): Promise<void> {
  try {
    logger.info(`Starting configuration export and queue process for config: ${configId}`);
    const configuration = await exportConfiguration(configId);
    
    // Queue the entire configuration for upload using metadataUpload queue
    await pushToQueue(configId, 'metadataUpload', {
      type: 'configuration',
      configuration,
      timestamp: new Date().toISOString()
    });

    logger.info(`Configuration successfully exported and queued for upload (config: ${configId})`);
  } catch (error) {
    logger.error(`Error during configuration export and queue process for config ${configId}:`, error);
    throw error;
  }
}

/**
 * Export all configurations from source DataStore namespaces
 */
export async function exportConfiguration(configId: string): Promise<ExportedConfiguration> {
  try {
    logger.info(`Starting configuration export for config: ${configId}`);
    
    const sourceClient = await getSourceClientFromConfig(configId);
    const namespaces: ConfigurationData[] = [];

    // 1. Export main portal configuration
    logger.info("Exporting main portal configuration...");
    const mainConfig = await exportNamespace(
      sourceClient, 
      DatastoreNamespaces.MAIN_CONFIG, 
      'Main Portal Configuration'
    );
    if (mainConfig) {
      namespaces.push(mainConfig);
    }

    // 2. Export modules configuration and detect STATIC modules
    logger.info("Exporting modules configuration...");
    const modulesConfig = await exportNamespace(
      sourceClient,
      DatastoreNamespaces.MODULES,
      'Modules Configuration'
    );
    if (modulesConfig) {
      namespaces.push(modulesConfig);

      // 3. Extract and export STATIC module namespaces
      const staticNamespaces = await extractStaticModuleNamespaces(modulesConfig.keys);
      for (const namespace of staticNamespaces) {
        logger.info(`Exporting STATIC module namespace: ${namespace}`);
        const staticConfig = await exportNamespace(
          sourceClient,
          namespace,
          `STATIC Module: ${namespace}`
        );
        if (staticConfig) {
          namespaces.push(staticConfig);
        }
      }
    }

    const exportedConfiguration: ExportedConfiguration = {
      namespaces,
      exportedAt: new Date().toISOString(),
      sourceConfigId: configId
    };

    logger.info(`Configuration export completed successfully. Exported ${namespaces.length} namespaces.`);
    return exportedConfiguration;

  } catch (error) {
    logger.error("Error during configuration export:", error);
    throw error;
  }
}

/**
 * Export a single DataStore namespace
 */
async function exportNamespace(
  client: any, 
  namespace: string, 
  description: string
): Promise<ConfigurationData | null> {
  try {
    logger.info(`Exporting ${description} (${namespace})...`);

    // Get all keys in the namespace
    const keysResponse = await client.get(`dataStore/${namespace}`);
    const keys = keysResponse.data || [];

    if (keys.length === 0) {
      logger.info(`No keys found in namespace: ${namespace}`);
      return null;
    }

    logger.info(`Found ${keys.length} keys in ${namespace}: ${keys.join(', ')}`);

    // Fetch all key-value pairs
    const keyValuePairs: { [key: string]: any } = {};
    for (const key of keys) {
      try {
        const valueResponse = await client.get(`dataStore/${namespace}/${key}`);
        keyValuePairs[key] = valueResponse.data;
        logger.info(`✓ Exported key: ${namespace}/${key}`);
      } catch (error) {
        logger.warn(`Failed to export key ${namespace}/${key}:`, error);
       }
    }

    return {
      namespace,
      keys: keyValuePairs
    };

  } catch (error) {
    if (error instanceof Error && error.message.includes('404')) {
      logger.info(`Namespace ${namespace} not found in source - skipping`);
      return null;
    }
    logger.error(`Error exporting namespace ${namespace}:`, error);
    throw error;
  }
}

/**
 * Extract namespaces from STATIC modules
 */
async function extractStaticModuleNamespaces(moduleKeys: { [key: string]: any }): Promise<string[]> {
  const staticNamespaces: string[] = [];

  try {
    for (const [moduleId, moduleData] of Object.entries(moduleKeys)) {
      if (moduleData && typeof moduleData === 'object') {
         if (moduleData.type === 'STATIC' && moduleData.config?.namespace) {
          const namespace = moduleData.config.namespace;
          logger.info(`Found STATIC module "${moduleId}" with namespace: ${namespace}`);
          staticNamespaces.push(namespace);
        }
      }
    }

    logger.info(`Extracted ${staticNamespaces.length} STATIC module namespaces: ${staticNamespaces.join(', ')}`);
    return staticNamespaces;

  } catch (error) {
    logger.error("Error extracting STATIC module namespaces:", error);
    return staticNamespaces;  
  }
}

/**
 * Validate exported configuration structure
 */
export function validateConfiguration(configuration: any): configuration is ExportedConfiguration {
  try {
    if (!configuration || typeof configuration !== 'object') {
      logger.error("Configuration is not an object");
      return false;
    }

    if (!Array.isArray(configuration.namespaces)) {
      logger.error("Configuration.namespaces is not an array");
      return false;
    }

    if (!configuration.exportedAt || !configuration.sourceConfigId) {
      logger.error("Missing required properties: exportedAt or sourceConfigId");
      return false;
    }

    // Validate each namespace
    for (const ns of configuration.namespaces) {
      if (!ns.namespace || typeof ns.namespace !== 'string') {
        logger.error(`Invalid namespace structure: ${JSON.stringify(ns)}`);
        return false;
      }

      if (!ns.keys || typeof ns.keys !== 'object') {
        logger.error(`Invalid keys structure for namespace ${ns.namespace}`);
        return false;
      }
    }

    logger.info("Configuration validation passed");
    return true;

  } catch (error) {
    logger.error("Error during configuration validation:", error);
    return false;
  }
}