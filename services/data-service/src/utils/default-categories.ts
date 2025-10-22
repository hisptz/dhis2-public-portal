import { dhis2Client, getSourceClientFromConfig } from "@/clients/dhis2";
import logger from "@/logging";

/**
 * Default category system values that we need to fetch from DHIS2
 */
export interface DefaultCategoryValues {
    defaultCategoryComboId: string;
    defaultCategoryId: string;
    defaultCategoryOptionId: string;
}

/**
 * Cache for default values to avoid repeated API calls
 * Separate caches for source and destination
 */
let cachedSourceDefaults: DefaultCategoryValues | null = null;
let cachedDestinationDefaults: DefaultCategoryValues | null = null;

/**
 * Fetches the default category system values from the source DHIS2 instance
 * @param configId - Optional config ID to get source client, if not provided falls back to destination
 */
export async function getDefaultCategoryValues(configId?: string): Promise<DefaultCategoryValues> {
    if (cachedSourceDefaults) {
        return cachedSourceDefaults;
    }

    try {
        logger.info(`Fetching default category system values from ${configId ? 'source' : 'destination'} DHIS2...`);

        // Get the appropriate client - source if configId provided, destination otherwise
        const client = configId ? await getSourceClientFromConfig(configId) : dhis2Client;

        // Fetch default category combo (there should be exactly one with name "default")
        const categoryComboResponse = await client.get<{
            categoryCombos: Array<{
                id: string;
                name: string;
                displayName: string;
            }>;
        }>('categoryCombos', {
            params: {
                fields: 'id,name,displayName',
                filter: 'name:eq:default',
                paging: false
            }
        });
        logger.info('Category Combos fetched:', categoryComboResponse.data.categoryCombos);
        const defaultCategoryCombo = categoryComboResponse.data.categoryCombos.find(
            (combo: { id: string; name: string; displayName: string }) => combo.name.toLowerCase() === 'default'
        );

        if (!defaultCategoryCombo) {
            throw new Error('Default category combo not found');
        }

        // Fetch default category (there should be exactly one with name "default")
        const categoryResponse = await client.get<{
            categories: Array<{
                id: string;
                name: string;
                displayName: string;
            }>;
        }>('categories', {
            params: {
                fields: 'id,name,displayName',
                filter: 'name:eq:default',
                paging: false
            }
        });
        logger.info('Categories fetched:', categoryResponse.data.categories);

        const defaultCategory = categoryResponse.data.categories.find(
            (category: { id: string; name: string; displayName: string }) => category.name.toLowerCase() === 'default'
        );

        if (!defaultCategory) {
            throw new Error('Default category not found');
        }

        // Fetch default category option (there should be exactly one with name "default")
        const categoryOptionResponse = await client.get<{
            categoryOptions: Array<{
                id: string;
                name: string;
                displayName: string;
            }>;
        }>('categoryOptions', {
            params: {
                fields: 'id,name,displayName',
                filter: 'name:eq:default',
                paging: false
            }
        });
        logger.info('Category Options fetched:', categoryOptionResponse.data.categoryOptions);

        const defaultCategoryOption = categoryOptionResponse.data.categoryOptions.find(
            (option: { id: string; name: string; displayName: string }) => option.name.toLowerCase() === 'default'
        );

        if (!defaultCategoryOption) {
            throw new Error('Default category option not found');
        }

        const defaultValues = {
            defaultCategoryComboId: defaultCategoryCombo.id,
            defaultCategoryId: defaultCategory.id,
            defaultCategoryOptionId: defaultCategoryOption.id,
        };

        // Cache based on whether this was source or destination
        if (configId) {
            cachedSourceDefaults = defaultValues;
        } else {
            cachedDestinationDefaults = defaultValues;
        }

        logger.info('Default category system values fetched successfully:', {
            defaultCategoryComboId: defaultValues.defaultCategoryComboId,
            defaultCategoryId: defaultValues.defaultCategoryId,
            defaultCategoryOptionId: defaultValues.defaultCategoryOptionId,
            source: configId ? 'source' : 'destination'
        });

        return defaultValues;

    } catch (error) {
        logger.error('Failed to fetch default category system values:', error);
        throw error;
    }
}

/**
 * Gets default values for destination DHIS2 instance (direct API access)
 */
export async function getDestinationDefaultCategoryValues(): Promise<DefaultCategoryValues> {
    if (cachedDestinationDefaults) {
        return cachedDestinationDefaults;
    }
    
    // Call getDefaultCategoryValues without configId to use destination client
    return getDefaultCategoryValues();
}

/**
 * Clears the cache - useful for testing or if you need to refresh values
 */
export function clearDefaultCategoryCache(): void {
    cachedSourceDefaults = null;
    cachedDestinationDefaults = null;
    logger.info('Default category values cache cleared');
}

 