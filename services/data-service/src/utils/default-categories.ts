import { dhis2Client, createSourceClient } from "@/clients/dhis2";
import logger from "@/logging";

export interface DefaultCategoryValues {
    defaultCategoryComboId: string;
    defaultCategoryId: string;
    defaultCategoryOptionId: string;
}


let cachedSourceDefaults: DefaultCategoryValues | null = null;
let cachedDestinationDefaults: DefaultCategoryValues | null = null;

export async function getDefaultCategoryValues(routeId?: string): Promise<DefaultCategoryValues> {
    if (cachedSourceDefaults) {
        return cachedSourceDefaults;
    }

    try {
 
        const client = routeId ? await createSourceClient(routeId) : dhis2Client;

        const allCombosResponse = await client.get<{
            categoryCombos: Array<{
                id: string;
                name: string;
                displayName: string;
            }>;
        }>('categoryCombos', {
            params: {
                fields: 'id,name,displayName',
                pageSize: 10,
                paging: true
            }
        });
        logger.info('All Category Combos available:', allCombosResponse.data?.categoryCombos || []);

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

        const categoryCombos = categoryComboResponse.data?.categoryCombos || [];
        logger.info(`Category Combos fetched: ${categoryCombos.length} items`, categoryCombos);

        const defaultCategoryCombo = categoryCombos.find(
            (combo: { id: string; name: string; displayName: string }) => combo.name.toLowerCase() === 'default'
        );

        if (!defaultCategoryCombo) {
            throw new Error('Default category combo not found');
        }

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

        const categories = categoryResponse.data?.categories || [];
        logger.info(`Categories fetched: ${categories.length} items`, categories);

        const defaultCategory = categories.find(
            (category: { id: string; name: string; displayName: string }) => category.name.toLowerCase() === 'default'
        );

        if (!defaultCategory) {
            throw new Error('Default category not found');
        }

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

        const categoryOptions = categoryOptionResponse.data?.categoryOptions || [];
        logger.info(`Category Options fetched: ${categoryOptions.length} items`, categoryOptions);

        const defaultCategoryOption = categoryOptions.find(
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

        if (routeId) {
            cachedSourceDefaults = defaultValues;
        } else {
            cachedDestinationDefaults = defaultValues;
        }

        logger.info('Default category system values fetched successfully:', {
            defaultCategoryComboId: defaultValues.defaultCategoryComboId,
            defaultCategoryId: defaultValues.defaultCategoryId,
            defaultCategoryOptionId: defaultValues.defaultCategoryOptionId,
            source: routeId ? 'source' : 'destination'
        });

        return defaultValues;

    } catch (error) {
        logger.error('Failed to fetch default category system values:', error);
        throw error;
    }
}

export async function getDestinationDefaultCategoryValues(): Promise<DefaultCategoryValues> {
    if (cachedDestinationDefaults) {
        return cachedDestinationDefaults;
    }
    return getDefaultCategoryValues();
}

export function clearDefaultCategoryCache(): void {
    cachedSourceDefaults = null;
    cachedDestinationDefaults = null;
    logger.info('Default category values cache cleared');
}

