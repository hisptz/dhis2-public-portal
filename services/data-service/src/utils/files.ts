import { existsSync, mkdirSync } from "node:fs";
import logger from "@/logging";
import path from "path";

export function checkOrCreateFolder(folderPath: string) {
	const actualPath = path.join(process.cwd(), folderPath);
	logger.info(`Ensuring the ${actualPath} folder exists...`);
	if (!existsSync(folderPath)) {
		logger.info(`Folder does not exist, creating...`);
		mkdirSync(actualPath, {
			recursive: true,
		});
	}
	logger.info(`Done`);
	return folderPath;
}
