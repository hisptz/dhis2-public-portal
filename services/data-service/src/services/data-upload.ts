import logger from "@/logging";
import { dhis2Client } from "@/clients/dhis2";
import { displayUploadSummary } from "@/services/summary";
import { AxiosError } from "axios";

export async function completeUpload(configId: string) {
	await displayUploadSummary(configId);
}


export async function uploadDataFromFile({
	filename,
	configId,
}: {
	filename: string;
	configId: string;
}) {
	const file = Bun.file(`${filename}`, {
		type: "application/json",
	});
	try {
		const client = dhis2Client;
		logger.info(`Uploading ${filename} file`);
		const payload = await file.json();
		const url = `dataValueSets`;
		const params = {
			importStrategy: "CREATE_AND_UPDATE",
			async: false,
		};
		logger.info(`Uploading ${payload.dataValues.length} data values`);
		const response = await client.post(url, payload, {
			params,
		});
		const importSummary = response.data?.response;
		const importCount = importSummary.importCount.imported;
		const ignoredCount = importSummary.importCount.ignored;
		logger.info(`${importCount} data values imported successfully`);
		if (ignoredCount > 0) {
			logger.warn(`${ignoredCount} data values ignored`);
		}
		
		if (await file.exists()) {
			logger.info(`Deleting ${filename} file`);
			await file.delete();
		}
		return;
	} catch (e: any) {
		if (e instanceof AxiosError) {
			if (e.response?.status === 409) {
				const response = e.response!;
				logger.warn(`Conflicts detected. These will be ignored`);
				logger.warn(
					`While uploading ${filename} file some values were ignored. This normally means values already exist in DHIS2.`,
				);
				logger.warn(
					`Status code: ${response.status} - ${response.statusText}`,
				);
				const importSummary = response.data?.response;
				const importCount = importSummary.importCount.imported;
				const ignoredCount = importSummary.importCount.ignored;
				logger.info(`${importCount} data values imported successfully`);
				if (ignoredCount > 0) {
					logger.warn(`${importCount} data values ignored`);
				}
				if (await file.exists()) {
					await file.delete();
				}
				throw e;
			} else {
				const response = e.response;
				logger.error(
					`Status code: ${response?.status} - ${response?.statusText}`,
				);
				
			}
			throw e;
		}
		logger.error(
			`Error uploading ${filename} file: ${e.message ?? JSON.stringify(e)}`,
		);
		
		throw e;
	}
}
