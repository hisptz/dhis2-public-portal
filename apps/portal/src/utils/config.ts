import { dhis2HttpClient } from "@/utils/api/dhis2";
import { Pagination } from "@hisptz/dhis2-utils";
import { DatastoreNamespaces } from "@packages/shared/constants";

export async function getAppConfigWithNamespace<T>({
	namespace,
	key,
}: {
	namespace: DatastoreNamespaces;
	key: string;
}) {
	try {
		const url = `dataStore/${namespace}/${key}`;
		return (await dhis2HttpClient.get(url)) as T | undefined;
	} catch (e) {
		return undefined;
	}
}

export async function getAppConfigsFromNamespace<T>(
	namespace: DatastoreNamespaces,
): Promise<T[]> {
	try {
		const url = `dataStore/${namespace}`;
		const response = await dhis2HttpClient.get<{
			entries: { key: string; value: T }[];
			pager: Pagination;
		}>(url, {
			params: {
				fields: ".",
			},
		});
		return response?.entries.map(({ value }) => value) ?? [];
	} catch (e) {
		return [];
	}
}
