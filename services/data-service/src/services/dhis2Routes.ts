import { dhis2Client } from "@/clients/dhis2";
import logger from "../logging";
import { AxiosError } from "axios";

export async function testDHIS2Route(routeId: string) {
	try {
		const url = `routes/${routeId}/run/me.json`;
		const response = await dhis2Client.get<{
			id: string;
			username: string;
		}>(url);

		return response.status === 200;
	} catch (error) {
		if (error instanceof AxiosError) {
			logger.error(
				`Route test for ${routeId} failed. Error: ${error.message}`,
			);
			throw error;
		} else {
			logger.error(`Unknown internal error`);
			logger.error(error);
			return false;
		}
	}
}
