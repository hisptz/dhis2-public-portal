import axios from "axios";
import { config } from "dotenv";
import { env } from "@/env";
import { DataServiceConfig } from "@packages/shared/schemas";
import logger from "@/logging";
import { uniqBy } from "lodash";

config();

export const dhis2Client = axios.create({
	baseURL: `${env.DHIS2_BASE_URL}/api/`,
	headers: {
		Accept: "application/json",
		Authorization: `ApiToken ${env.DHIS2_PAT}`,
	},
});

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

export async function uploadMetadataFile(filePath: string) {
	const url =
		"metadata?importStrategy=CREATE_AND_UPDATE&async=false&atomicMode=NONE";

	if (!filePath.endsWith(".json")) {
		logger.error(`${filePath}: Only JSON files are supported.`);
		throw new Error("Only JSON files are supported for metadata upload.");
	}

	logger.info(`Starting upload: ${filePath}`);

	try {
		const payload = await Bun.file(filePath).json();

		const response = await dhis2Client.post(url, payload, {
			headers: { "Content-Type": "application/json" },
			timeout: 30000,
		});

		logger.info(`Upload completed Successfully`);
		logger.info(
			`${JSON.stringify(
				response.data.response.stats || response.data,
				null,
				2
			)}`
		);

		return response.data;
	} catch (err: any) {
		const payload = await Bun.file(filePath).json();

		await handleImportErrors(payload, err.response?.data);

		logger.error(`Error uploading ${filePath}`);
		logger.error(
			`${JSON.stringify(
				err.response?.data?.response.stats || err.message,
				null,
				2
			)}`
		);
	}
}

export async function handleImportErrors(
	originalPayload: any,
	importResponse: any
) {
	const errorPath = "logs/errors.json";

	let existingLog: any = {};
	try {
		const file = Bun.file(errorPath);
		if (await file.exists()) {
			existingLog = await file.json();
		}
	} catch (e: any) {
		console.warn(
			`Could not read existing error log, starting new: ${e.message}`
		);
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

	await Bun.write(errorPath, JSON.stringify(existingLog, null, 2));
}