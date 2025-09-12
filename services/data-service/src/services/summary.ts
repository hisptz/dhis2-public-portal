import {
	DataDownloadBody,
	DataDownloadSummary,
	DataUploadSummary,
	ProcessSummary,
} from "@packages/shared/schemas";
import logger from "../logging";

const summaryPath = `summaries`;

const downloadFilename = "data-download-summary";
const uploadFilename = "data-upload-summary";



export async function getUploadSummary(configId: string) {
	const file = Bun.file(
		`./${summaryPath}/${configId}/${uploadFilename}.json`,
		{
			type: "application/json",
		},
	);
	return await file.json();
}

export async function displayUploadSummary(configId: string) {
	const uploadSummary = await getUploadSummary(configId);
	const totalImported = uploadSummary.summaries.reduce(
		(acc: number, summary: DataUploadSummary) =>
			acc + (summary.importSummary?.imported ?? 0),
		0,
	);
	const totalIgnored = uploadSummary.summaries.reduce(
		(acc: number, summary: DataUploadSummary) =>
			acc + (summary.importSummary?.ignored ?? 0),
		0,
	);

	logger.info(`Total imported: ${totalImported}`);
	logger.info(`Total ignored: ${totalIgnored}`);
	logger.info(`===========================================================`);
}

export async function updateSummaryFile({
	type,
	configId,
	...data
}: ProcessSummary) {
	logger.info(`Updating summary file...`);
	const file = Bun.file(
		`./${summaryPath}/${configId}/${type === "download" ? downloadFilename : uploadFilename}.json`,
		{ type: "application/json" },
	);
	const summary = await file.json();
	await file.write(
		JSON.stringify({
			...summary,
			summaries: [
				...summary.summaries,
				{
					...data,
				},
			],
		}),
	);
	logger.info(`Summary file updated`);
}

export async function getDownloadSummary(configId: string) {
	const downloadFile = Bun.file(
		`./${summaryPath}/${configId}/${downloadFilename}.json`,
		{
			type: "application/json",
		},
	);
	return await downloadFile.json();
}

export async function displayDownloadSummary(configId: string) {
	const downloadSummary = await getDownloadSummary(configId);
	logger.info(`Download summary:`);
	const totalDownloaded = downloadSummary.summaries.reduce(
		(acc: number, summary: DataDownloadSummary) =>
			acc + (summary.count ?? 0),
		0,
	);
	logger.info(`Total downloaded: ${totalDownloaded}`);
	logger.info(`===========================================================`);
}
