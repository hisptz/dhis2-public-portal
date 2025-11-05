import logger from "@/logging";
import { dhis2Client, createSourceClient } from "@/clients/dhis2";
import { getDefaultCategoryValues, getDestinationDefaultCategoryValues } from "./default-categories";
import { fetchItemsInParallel } from "./parallel-fetch";
import { DatastoreNamespaces } from "@packages/shared/constants";
import { uniq, compact } from "lodash";

export interface DataItemMapping {
    id: string;
    sourceId: string;
}

export interface DataItemMappings {
    dataItems: DataItemMapping[];
    // createdAt: string;
    // configId: string;
    // sourceInstanceId: string;
}

/**
 * Generate mappings for data elements and program indicators
 * Maps source IDs to destination IDs, handling category combinations
 */
export async function generateDataItemMappings(
    dataElementIds: string[],
    programIndicatorIds: string[],
    configId: string,
    routeId?: string
): Promise<DataItemMapping[]> {
    try {
        logger.info(`Starting data item mapping generation`, {
            dataElementCount: dataElementIds.length,
            programIndicatorCount: programIndicatorIds.length,
            configId,
            routeId
        });

        const mappings: DataItemMapping[] = [];

        // Generate data element mappings
        if (dataElementIds.length > 0) {
            try {
                const dataElementMappings = await generateDataElementMappings(dataElementIds, routeId);
                mappings.push(...dataElementMappings);
                logger.info(`Successfully generated ${dataElementMappings.length} data element mappings`);
            } catch (error) {
                logger.error(`Failed to generate data element mappings:`, error);
                // Continue with program indicators even if data element mapping fails
            }
        }

        // Generate program indicator mappings (they use default category combo)
        if (programIndicatorIds.length > 0) {
            try {
                const programIndicatorMappings = generateProgramIndicatorMappings(programIndicatorIds);
                mappings.push(...programIndicatorMappings);
                logger.info(`Successfully generated ${programIndicatorMappings.length} program indicator mappings`);
            } catch (error) {
                logger.error(`Failed to generate program indicator mappings:`, error);
            }
        }

        logger.info(`Data item mapping generation completed`, {
            totalMappings: mappings.length,
            dataElementMappings: mappings.filter(m => !m.sourceId.includes('.')).length,
            categoryComboMappings: mappings.filter(m => m.sourceId.includes('.')).length
        });

        return mappings;

    } catch (error) {
        logger.error(`Error generating data item mappings:`, error);
        throw error;
    }
}

/**
 * Generate mappings for data elements, handling category combinations
 */
async function generateDataElementMappings(
    dataElementIds: string[],
    routeId?: string
): Promise<DataItemMapping[]> {
    try {
        logger.info(`Generating data element mappings for ${dataElementIds.length} data elements`);

        const sourceDefaults = await getDefaultCategoryValues(routeId);
        const client = routeId ? await createSourceClient(routeId) : dhis2Client;

        // Fetch data elements with their category combos
        const dataElements = await fetchItemsInParallel(
            client,
            'dataElements',
            dataElementIds,
            'id,name,categoryCombo[id,name,categoryOptionCombos[id,name]]',
            5
        );

        const mappings: DataItemMapping[] = [];

        for (const dataElement of dataElements) {
            // Validate that the data element has required properties
            if (!dataElement || !dataElement.id) {
                logger.warn(`Skipping invalid data element:`, dataElement);
                continue;
            }

            // Ensure categoryCombo exists
            if (!dataElement.categoryCombo || !dataElement.categoryCombo.id) {
                logger.warn(`Data element ${dataElement.id} missing category combo, using simple mapping`);
                mappings.push({
                    id: dataElement.id,
                    sourceId: dataElement.id
                });
                continue;
            }

            const isDefaultCategoryCombo = dataElement.categoryCombo.id === sourceDefaults.defaultCategoryComboId;

            if (isDefaultCategoryCombo) {
                // For default category combo, create simple mapping
                mappings.push({
                    id: dataElement.id,
                    sourceId: dataElement.id
                });
            } else {
                // For non-default category combo, create mappings for each category option combo
                if (dataElement.categoryCombo.categoryOptionCombos && dataElement.categoryCombo.categoryOptionCombos.length > 0) {
                    for (const categoryOptionCombo of dataElement.categoryCombo.categoryOptionCombos) {
                        if (categoryOptionCombo && categoryOptionCombo.id) {
                            mappings.push({
                                id: `${dataElement.id}.${categoryOptionCombo.id}`,
                                sourceId: `${dataElement.id}.${categoryOptionCombo.id}`
                            });
                        } else {
                            logger.warn(`Invalid category option combo for data element ${dataElement.id}:`, categoryOptionCombo);
                        }
                    }
                } else {
                    // Fallback to simple mapping if category option combos not available
                    logger.warn(`Data element ${dataElement.id} has non-default category combo but no category option combos, using simple mapping`);
                    mappings.push({
                        id: dataElement.id,
                        sourceId: dataElement.id
                    });
                }
            }
        }

        logger.info(`Generated ${mappings.length} data element mappings from ${dataElements.length} valid data elements`);
        return mappings;

    } catch (error) {
        logger.error(`Error generating data element mappings:`, error);
        throw error;
    }
}

/**
 * Generate mappings for program indicators (they use default category combo)
 */
function generateProgramIndicatorMappings(programIndicatorIds: string[]): DataItemMapping[] {
    logger.info(`Generating program indicator mappings for ${programIndicatorIds.length} program indicators`);

    if (!programIndicatorIds || programIndicatorIds.length === 0) {
        logger.info(`No program indicator IDs provided, returning empty mappings`);
        return [];
    }

    const mappings: DataItemMapping[] = [];

    for (const programIndicatorId of programIndicatorIds) {
        if (programIndicatorId && typeof programIndicatorId === 'string' && programIndicatorId.trim()) {
            mappings.push({
                id: programIndicatorId,
                sourceId: programIndicatorId
            });
        } else {
            logger.warn(`Skipping invalid program indicator ID:`, programIndicatorId);
        }
    }

    logger.info(`Generated ${mappings.length} program indicator mappings from ${programIndicatorIds.length} IDs`);
    return mappings;
}

/**
 * Save data item mappings to the destination datastore
 */
// export async function saveDataItemMappings(
//     mappings: DataItemMapping[],
//     configId: string,
//     sourceInstanceId?: string
// ): Promise<void> {
//     try {
//         logger.info(`Saving data item mappings to datastore`, {
//             mappingsCount: mappings.length,
//             configId,
//             sourceInstanceId
//         });

//         const mappingData: DataItemMappings = {
//             dataItems: mappings,
//             createdAt: new Date().toISOString(),
//             configId,
//             sourceInstanceId: sourceInstanceId || 'unknown'
//         };

//         const datastoreKey = `${configId}-mappings`;
//         const url = `dataStore/${DatastoreNamespaces.DATA_SERVICE_CONFIG}/${datastoreKey}`;

//         await dhis2Client.post(url, mappingData);

//         logger.info(`Successfully saved data item mappings to datastore`, {
//             datastoreKey,
//             mappingsCount: mappings.length
//         });

//     } catch (error) {
//         logger.error(`Error saving data item mappings to datastore:`, error);
//         throw error;
//     }
// }
export async function saveDataItemMappings(
    mappings: DataItemMapping[],
    configId: string,
    sourceInstanceId?: string
): Promise<void> {
    const datastoreKey = `${configId}`;
    const url = `dataStore/${DatastoreNamespaces.DATA_SERVICE_CONFIG}/${datastoreKey}`;

    try {
        logger.info(`Saving data item mappings to datastore`, {
            mappingsCount: mappings.length,
            configId,
            sourceInstanceId
        });

        // Try fetching the existing mappings first
        let existingData: DataItemMappings | null = null;
        try {
            const response = await dhis2Client.get(url);
            existingData = response.data;
        } catch (fetchError: any) {
            if (fetchError?.response?.status !== 404) {
                throw fetchError;
            }
            logger.warn(`No existing mappings found for ${datastoreKey}, creating new entry.`);
        }

        // Merge existing dataItems with new ones
        const existingItems = existingData?.dataItems || [];
        const mergedItems = [...existingItems, ...mappings];

        const updatedData: DataItemMappings = {
            ...existingData,
            dataItems: mergedItems,
            // createdAt: existingData?.createdAt || new Date().toISOString(),
            // configId,
            // sourceInstanceId: sourceInstanceId || existingData?.sourceInstanceId || 'unknown'
        };

        if (existingData) {
            await dhis2Client.put(url, updatedData);
            logger.info(`Updated existing data item mappings for ${datastoreKey}`, {
                mappingsCount: mergedItems.length
            });
        } else {
            await dhis2Client.post(url, updatedData);
            logger.info(`Created new data item mappings for ${datastoreKey}`, {
                mappingsCount: mergedItems.length
            });
        }

    } catch (error) {
        logger.error(`Error saving data item mappings to datastore:`, error);
        throw error;
    }
}


/**
 * Retrieve data item mappings from the destination datastore
 */
// export async function getDataItemMappings(configId: string): Promise<DataItemMappings | null> {
//     try {
//         logger.info(`Retrieving data item mappings from datastore for config: ${configId}`);

//         const datastoreKey = `${configId}-mappings`;
//         const url = `dataStore/${DatastoreNamespaces.DATA_SERVICE_CONFIG}/${datastoreKey}`;

//         const response = await dhis2Client.get<DataItemMappings>(url);
        
//         logger.info(`Successfully retrieved data item mappings`, {
//             mappingsCount: response.data.dataItems.length,
//             // createdAt: response.data.createdAt
//         });

//         return response.data;

//     } catch (error: any) {
//         if (error.response?.status === 404) {
//             logger.info(`No data item mappings found for config: ${configId}`);
//             return null;
//         }
        
//         logger.error(`Error retrieving data item mappings from datastore:`, error);
//         throw error;
//     }
// }
export async function getDataItemMappings(configId: string): Promise<DataItemMappings | null> {
    const datastoreKey = `${configId}`;
    const url = `dataStore/${DatastoreNamespaces.DATA_SERVICE_CONFIG}/${datastoreKey}`;

    try {
        logger.info(`Retrieving data item mappings from datastore`, { configId });

        const response = await dhis2Client.get<DataItemMappings>(url);

        logger.info(`Successfully retrieved data item mappings from datastore`, {
            configId,
            datastoreKey,
            mappingsCount: response.data?.dataItems?.length || 0,
        });

        return response.data;
    } catch (error: any) {
        if (error.response?.status === 404) {
            logger.info(`No data item mappings found in datastore for config: ${configId}`);
            return null;
        }

        logger.error(`Error retrieving data item mappings from datastore:`, error);
        throw error;
    }
}


/**
 * Update existing data item mappings in the datastore
 */
// export async function updateDataItemMappings(
//     mappings: DataItemMapping[],
//     configId: string,
//     sourceInstanceId?: string
// ): Promise<void> {
//     try {
//         logger.info(`Updating data item mappings in datastore`, {
//             mappingsCount: mappings.length,
//             configId,
//             sourceInstanceId
//         });

//         const mappingData: DataItemMappings = {
//             dataItems: mappings,
//             createdAt: new Date().toISOString(),
//             configId,
//             sourceInstanceId: sourceInstanceId || 'unknown'
//         };

//         const datastoreKey = `${configId}-mappings`;
//         const url = `dataStore/${DatastoreNamespaces.DATA_SERVICE_CONFIG}/${datastoreKey}`;

//         await dhis2Client.put(url, mappingData);

//         logger.info(`Successfully updated data item mappings in datastore`, {
//             datastoreKey,
//             mappingsCount: mappings.length
//         });

//     } catch (error) {
//         logger.error(`Error updating data item mappings in datastore:`, error);
//         throw error;
//     }
// }
export async function updateDataItemMappings(
    mappings: DataItemMapping[],
    configId: string,
    sourceInstanceId?: string
): Promise<void> {
    const datastoreKey = `${configId}`;
    const url = `dataStore/${DatastoreNamespaces.DATA_SERVICE_CONFIG}/${datastoreKey}`;

    try {
        logger.info(`Updating data item mappings in datastore`, {
            mappingsCount: mappings.length,
            configId,
            sourceInstanceId
        });

        // Fetch existing mappings first
        let existingData: DataItemMappings | null = null;
        try {
            const response = await dhis2Client.get(url);
            existingData = response.data;
        } catch (fetchError: any) {
            if (fetchError?.response?.status !== 404) {
                throw fetchError;
            }
            logger.warn(`No existing mappings found for ${datastoreKey}, creating new entry.`);
        }

        // Merge: keep existing items + new ones
        const existingItems = existingData?.dataItems || [];
        const mergedItems = [...existingItems, ...mappings];

        const updatedData: DataItemMappings = {
            ...existingData,
            dataItems: mergedItems,
            // updatedAt: new Date().toISOString(),
            // createdAt: existingData?.createdAt || new Date().toISOString(),
            // configId,
            // sourceInstanceId: sourceInstanceId || existingData?.sourceInstanceId || 'unknown'
        };

        if (existingData) {
            await dhis2Client.put(url, updatedData);
            logger.info(`Successfully updated existing data item mappings`, {
                datastoreKey,
                mappingsCount: mergedItems.length
            });
        } else {
            await dhis2Client.post(url, updatedData);
            logger.info(`Successfully created new data item mappings`, {
                datastoreKey,
                mappingsCount: mergedItems.length
            });
        }

    } catch (error) {
        logger.error(`Error updating data item mappings in datastore:`, error);
        throw error;
    }
}


/**
 * Helper function to extract unique data element and program indicator IDs from mappings
 */
export function extractIdsFromMappings(mappings: DataItemMapping[]): {
    dataElementIds: string[];
    programIndicatorIds: string[];
} {
    const dataElementIds: string[] = [];
    const programIndicatorIds: string[] = [];

    for (const mapping of mappings) {
        const sourceId = mapping.sourceId;
        
        // Check if it's a program indicator (assuming they follow a specific pattern)
        // You might need to adjust this logic based on your program indicator ID patterns
        if (sourceId.includes('.') && !sourceId.match(/^[A-Za-z0-9]{11}\.[A-Za-z0-9]{11}$/)) {
            // This is likely a program indicator with additional notation
            programIndicatorIds.push(sourceId);
        } else if (sourceId.includes('.')) {
            // This is a data element with category option combo
            const [dataElementId] = sourceId.split('.');
            dataElementIds.push(dataElementId);
        } else {
            // This is likely a simple data element or program indicator
            // Additional logic might be needed to distinguish between them
            dataElementIds.push(sourceId);
        }
    }

    return {
        dataElementIds: uniq(dataElementIds),
        programIndicatorIds: uniq(programIndicatorIds)
    };
}