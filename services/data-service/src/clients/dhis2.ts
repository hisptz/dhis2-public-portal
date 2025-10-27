import axios, { AxiosInstance } from "axios";
import { config } from "dotenv";
import { env } from "@/env";
import { DataServiceConfig } from "@packages/shared/schemas";
import { DatastoreNamespaces } from "@packages/shared/constants";
import logger from "@/logging";
import { uniqBy } from "lodash";
import * as fs from "node:fs";

config();

export const dhis2Client = axios.create({
	baseURL: `${env.DHIS2_BASE_URL}/api/`,
	headers: {
		Accept: "application/json",
		Authorization: `ApiToken ${env.DHIS2_PAT}`,
	},
});


export function createSourceClient(routeId: string): AxiosInstance {
	return axios.create({
		baseURL: `${env.DHIS2_BASE_URL}/api/routes/${routeId}/run/`,
		headers: {
			Accept: "application/json",
			Authorization: `ApiToken ${env.DHIS2_PAT}`,
		},
	});
}

export async function getSourceClientFromConfig(configId: string): Promise<AxiosInstance> {
	try {
		const configUrl = `dataStore/${DatastoreNamespaces.DATA_SERVICE_CONFIG}/${configId}`;
		const { data: config } = await dhis2Client.get(configUrl);

		if (!config?.source?.routeId) {
			throw new Error(`No routeId found in config ${configId}`);
		}

		return createSourceClient(config.source.routeId);
	} catch (error) {
		throw new Error(`Failed to get source client for config ${configId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
	}
}

export function createDownloadClient({
	config,
}: {
	config: DataServiceConfig;
}) {
	return axios.create({
		baseURL: `${env.DHIS2_BASE_URL}/api/routes/${config.source.routeId}/run`,
		headers: {
			Accept: "application/json",
			Authorization: `ApiToken ${env.DHIS2_PAT}`,
		},
	});
}

export function getDHIS2ClientByPAT({
	pat,
	baseURL,
}: {
	baseURL: string;
	pat: string;
}) {
	return axios.create({
		baseURL: `${baseURL}/api/`,
		headers: {
			Accept: "application/json",
			Authorization: `ApiToken ${pat}`,
		},
	});
}

export function getDHIS2ClientByBasicAuth({
	username,
	password,
	baseURL,
}: {
	baseURL: string;
	username: string;
	password: string;
}) {
	return axios.create({
		baseURL: `${baseURL}/api/`,
		auth: {
			username,
			password,
		},
		headers: {
			Accept: "application/json",
		},
	});
}

async function uploadWithRetry(url: string, payload: any, maxRetries: number = 3): Promise<any> {
	for (let attempt = 1; attempt <= maxRetries; attempt++) {
		try {
			logger.info(`Upload attempt ${attempt}/${maxRetries}`);
			const response = await dhis2Client.post(url, payload, {
				headers: { "Content-Type": "application/json" },
				timeout: 120000,
			});
			return response;
		} catch (error: any) {
			logger.warn(`Upload attempt ${attempt} failed:`, error.message);

			if (attempt === maxRetries) {
				throw error;
			}
			const waitTime = Math.pow(2, attempt) * 1000;
			logger.info(`Waiting ${waitTime}ms before retry...`);
			await new Promise(resolve => setTimeout(resolve, waitTime));
		}
	}
}

export async function uploadMetadataFile(filePath: string) {
	const url =
		"metadata?importStrategy=CREATE_AND_UPDATE&async=false&atomicMode=NONE";

	if (!filePath.endsWith(".json")) {
		logger.error(`${filePath}: Only JSON files are supported.`);
		throw new Error("Only JSON files are supported for metadata upload.");
	}

	logger.info(`Starting upload: ${filePath}`);

	try {
		const fileContent = await fs.promises.readFile(filePath, 'utf8');
		const fileSizeKB = Math.round(Buffer.byteLength(fileContent, 'utf8') / 1024);
		logger.info(`File size: ${fileSizeKB} KB`);

		const payload = JSON.parse(fileContent);

		// Log payload structure for debugging
		if (payload) {
			const keys = Object.keys(payload);
			logger.info(`Payload contains: ${keys.join(', ')}`);
			for (const key of keys) {
				if (Array.isArray(payload[key])) {
					logger.info(`  ${key}: ${payload[key].length} items`);
				}
			}
		}

		const response = await uploadWithRetry(url, payload);

		logger.info(`Upload completed Successfully`);
		logger.info(
			`${JSON.stringify(
				response.data?.response?.stats || response.data || "No response data",
				null,
				2
			)}`
		);

		return response.data;
	} catch (error: any) {
		const fileContent = await fs.promises.readFile(filePath, 'utf8');
		const payload = JSON.parse(fileContent);

		await handleImportErrors(payload, error.response?.data);

		logger.error(`Error uploading ${filePath}`);
		logger.error(
			`${JSON.stringify(
				error.response?.data?.response?.stats || error.response?.data || error.message,
				null,
				2
			)}`
		);
		logger.error(
			`${JSON.stringify(
				error.response?.data?.response?.data,
				null,
				2
			)}`
		);
		throw error;
	}
}

export async function handleImportErrors(
	originalPayload: any,
	importResponse: any
) {
	const errorPath = "logs/errors.json";

	let existingLog: any = {};
	try {
		const fileContent = await fs.promises.readFile(errorPath, 'utf8');
		existingLog = JSON.parse(fileContent);
	} catch (e: any) {
		console.warn(
			`Could not read existing error log, starting new: ${e.message}`
		);
	}

	// Check if importResponse exists before accessing its properties
	if (!importResponse) {
		logger.warn("No import response available for error handling");
		return;
	}

	const typeReports: any[] = importResponse.response?.typeReports || [];
	if (typeReports.length === 0) return;

	const uidMap: any = {};
	for (const [key, items] of Object.entries(originalPayload)) {
		for (const obj of items as any[]) {
			if (obj.id) {
				uidMap[obj.id] = { key, obj };
			}
		}
	}

	for (const typeReport of typeReports) {
		if (!typeReport.objectReports) continue;

		for (const objReport of typeReport.objectReports) {
			const failedUid = objReport.uid;
			const match = uidMap[failedUid];

			if (!match) {
				console.warn(`UID ${failedUid} not found in payload.`);
				continue;
			}

			const { key, obj } = match;

			if (!existingLog[key]) {
				existingLog[key] = [];
			}

			const errorMessages = (objReport.errorReports || []).map(
				(e: any) => e.message
			);

			const failedObject = {
				errorReports: errorMessages,
				...obj,
			};

			existingLog[key].push(failedObject);
			existingLog[key] = uniqBy(existingLog[key], "id");
		}
	}

	// Ensure logs directory exists
	await fs.promises.mkdir('logs', { recursive: true });
	await fs.promises.writeFile(errorPath, JSON.stringify(existingLog, null, 2), 'utf8');
}
