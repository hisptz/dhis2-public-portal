import { dhis2Client } from "@/clients/dhis2";
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
 */
let cachedDefaultValues: DefaultCategoryValues | null = null;

/**
 * Fetches the default category system values from DHIS2
 * These are the built-in default values that every DHIS2 instance has
 */
export async function getDefaultCategoryValues(): Promise<DefaultCategoryValues> {
    if (cachedDefaultValues) {
        return cachedDefaultValues;
    }

    try {
        logger.info("Fetching default category system values from DHIS2...");

        // Fetch default category combo (there should be exactly one with name "default")
        const categoryComboResponse = await dhis2Client.get<{
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
        logger.info('xxx Category Combos fetched:', categoryComboResponse.data.categoryCombos);
        const defaultCategoryCombo = categoryComboResponse.data.categoryCombos.find(
            combo => combo.name.toLowerCase() === 'default'
        );

        if (!defaultCategoryCombo) {
            throw new Error('Default category combo not found');
        }

        // Fetch default category (there should be exactly one with name "default")
        //TODO: GET FROM SOURCE 
        const categoryResponse = await dhis2Client.get<{
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
        logger.info('xxx Categories fetched:', categoryResponse.data.categories);

        const defaultCategory = categoryResponse.data.categories.find(
            category => category.name.toLowerCase() === 'default'
        );

        if (!defaultCategory) {
            throw new Error('Default category not found');
        }

        // Fetch default category option (there should be exactly one with name "default")
        const categoryOptionResponse = await dhis2Client.get<{
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
        logger.info('xxx Category Options fetched:', categoryOptionResponse.data.categoryOptions);

        const defaultCategoryOption = categoryOptionResponse.data.categoryOptions.find(
            option => option.name.toLowerCase() === 'default'
        );

        if (!defaultCategoryOption) {
            throw new Error('Default category option not found');
        }

        cachedDefaultValues = {
            defaultCategoryComboId: defaultCategoryCombo.id,
            defaultCategoryId: defaultCategory.id,
            defaultCategoryOptionId: defaultCategoryOption.id,
        };

        logger.info('Default category system values fetched successfully:', {
            defaultCategoryComboId: cachedDefaultValues.defaultCategoryComboId,
            defaultCategoryId: cachedDefaultValues.defaultCategoryId,
            defaultCategoryOptionId: cachedDefaultValues.defaultCategoryOptionId,
        });

        return cachedDefaultValues;

    } catch (error) {
        logger.error('Failed to fetch default category system values:', error);
        // throw error;
        // Fallback to environment variables or hardcoded values as last resort
        logger.warn('Falling back to environment variables or hardcoded defaults');
        
        const fallbackValues = {
            defaultCategoryComboId: process.env.SOURCE_DEFAULT_CATEGORY_COMBO_ID ?? "bjDvmb4bfuf",
            defaultCategoryId: process.env.SOURCE_DEFAULT_CATEGORY_ID ?? "GLevLNI9wkl",
            defaultCategoryOptionId: process.env.SOURCE_DEFAULT_CATEGORY_OPTION ?? "xYerKDKCefk",
        };

        cachedDefaultValues = fallbackValues;
        return fallbackValues;
    }
}

/**
 * Gets default values for destination DHIS2 instance
 * For now, this uses the same function but could be extended to query a different instance
 */
export async function getDestinationDefaultCategoryValues(): Promise<DefaultCategoryValues> {
    // For now, assuming destination has same default structure
    // This could be extended to query a different DHIS2 instance if needed
    return getDefaultCategoryValues();
}

/**
 * Clears the cache - useful for testing or if you need to refresh values
 */
export function clearDefaultCategoryCache(): void {
    cachedDefaultValues = null;
    logger.info('Default category values cache cleared');
}

 