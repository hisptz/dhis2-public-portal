import { dhis2Client } from '@/clients/dhis2'

export type CategoryMetadata = {
    id: string
    name: string
    categoryOptions: {
        id: string
        name: string
        categoryOptionCombos: Array<{ id: string }>
    }[]
}

export async function getCategoryMetadata(
    category: string
): Promise<CategoryMetadata> {
    const url = `categories/${category}`
    const params = {
        fields: 'id,name,categoryOptions[id,name,categoryOptionCombos[id,name]]',
    }
    const response = await dhis2Client.get<CategoryMetadata>(url, {
        params,
    })
    return response.data
}
