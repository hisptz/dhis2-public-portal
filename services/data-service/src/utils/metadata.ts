import { dhis2Client } from "../clients/dhis2";

async function getAttributeOptionCombo(categoryOption: string) {
	const url = `categoryOptions/${categoryOption}`;
	const categoryOptionResponse = await dhis2Client.get<{
		id: string;
		name: string;
	}>(url);
	const categoryOptionName = categoryOptionResponse.data.name;
	const optionComboUrl = `categoryOptionCombos`;
	const params = {
		filter: `name:eq:${categoryOptionName}`,
		fields: "id,name",
	};
	const response = await dhis2Client.get<{
		categoryOptionCombos: { id: string }[];
	}>(optionComboUrl, {
		params,
	});
	return response.data.categoryOptionCombos[0].id;
}

export type CategoryMetadata = {
	id: string;
	name: string;
	categoryOptions: {
		id: string;
		name: string;
		categoryOptionCombos: Array<{ id: string }>;
	}[];
};

export async function getCategoryMetadata(
	category: string,
): Promise<CategoryMetadata> {
	const url = `categories/${category}`;
	const params = {
		fields: "id,name,categoryOptions[id,name,categoryOptionCombos[id,name]]",
	};
	const response = await dhis2Client.get<CategoryMetadata>(url, {
		params,
	});
	return response.data;
}
