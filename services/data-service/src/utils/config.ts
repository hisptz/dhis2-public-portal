
import { dhis2Client } from "@/clients/dhis2";
import logger from "@/logging";
import { ProcessName } from "@/rabbit/constants";
import { DatastoreNamespaces } from "@packages/shared/constants";
import { DataServiceConfig } from "@packages/shared/schemas";
import { AxiosError } from "axios";

export async function getMainConfig(mainConfigId: string) {
	try {
		const url = `dataStore/${DatastoreNamespaces.DATA_SERVICE_CONFIG}/${mainConfigId}`;
		const response = await dhis2Client.get<DataServiceConfig>(url);
		return response.data;
	} catch (error) {
		if (error instanceof AxiosError) {
			logger.error(
				`[${ProcessName.DATA_DOWNLOAD}] Could not get main configuration ${mainConfigId} from server: ${error.response?.data ?? error.message}`,
			);
			return null;
		}
		if (error instanceof Error) {
			logger.error(
				`[${ProcessName.DATA_DOWNLOAD}] Could not get main configuration ${mainConfigId} from server: ${error.message}`,
			);
			return null;
		}
		logger.error(
			`[${ProcessName.DATA_DOWNLOAD}] Could not get main configuration ${mainConfigId} from server: Unknown error ${error}`,
		);
		return null;
	}
}
