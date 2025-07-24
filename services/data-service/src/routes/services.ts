import { Router } from "express";
import { dataDownloadBodySchema } from "@packages/shared/schemas";
import { fromError } from "zod-validation-error";
import { initializeDataDownload } from "@/services/data-download";
import logger from "@/logging";
import { AxiosError } from "axios";
import { getDownloadSummary, getUploadSummary } from "@/services/summary";
import { getDownloadStatus, getUploadStatus } from "@/services/status";

export const serviceRouter = Router();
/*
 Initiates data download and upload simultaneously.
 @params
  configIds - required, list of configurations to run data exchange on
 * */

serviceRouter.post("/data-download/:configId", async (req, res) => {
	try {
		const { configId } = req.params;
		const body = req.body;
		const parsedBody = dataDownloadBodySchema.parse(body);

		try {
			await initializeDataDownload({
				mainConfigId: configId,
				dataItemsConfigIds: parsedBody.dataItemsConfigIds,
				runtimeConfig: parsedBody.runtimeConfig,
			});
			res.json({
				status: "initialized",
			});
		} catch (e) {
			if (e instanceof AxiosError) {
				res.status(e.status ?? 500).json({
					status: "failed",
					message: e.message,
					details: e.response?.data,
				});
			}
		}
	} catch (e: any) {
		if (e.errors) {
			logger.error(`Invalid request body: ${e.message}`);
			res.status(400).json({
				status: "failed",
				message: fromError(e).toString(),
				details: e.errors,
			});
			return;
		} else {
			res.status(500).json({
				status: "failed",
				message: e.message,
			});
		}
	}
});
serviceRouter.get("/data-download/:configId/summary", async (req, res) => {
	try {
		const { configId } = req.params;
		if (!configId) {
			res.status(400).json({
				status: "failed",
				message: "Missing configId",
			});
			return;
		}
		const summary = await getDownloadSummary(configId);
		if (!summary) {
			res.status(404).json({
				status: "failed",
				message: "Summary not found. Is this job  started?",
			});
			return;
		}
		res.json(summary);
	} catch (e: any) {
		res.status(500).json({
			status: "failed",
			message: e.message,
		});
	}
});
serviceRouter.get("/data-download/:configId/status", async (req, res) => {
	try {
		const { configId } = req.params;
		if (!configId) {
			res.status(400).json({
				status: "failed",
				message: "Missing configId",
			});
			return;
		}
		const summary = getDownloadStatus(configId);
		if (!summary) {
			res.status(404).json({
				status: "failed",
				message: "Status not found. Is this job  started?",
			});
			return;
		}
		res.json(summary);
	} catch (e: any) {
		res.status(500).json({
			status: "failed",
			message: e.message,
		});
	}
});
serviceRouter.get("/data-upload/:configId/summary", async (req, res) => {
	try {
		const { configId } = req.params;
		if (!configId) {
			res.status(400).json({
				status: "failed",
				message: "Missing configId",
			});
			return;
		}
		const summary = await getUploadSummary(configId);
		if (!summary) {
			res.status(404).json({
				status: "failed",
				message: "Summary not found. Is this job  started?",
			});
			return;
		}
		res.json(summary);
	} catch (e: any) {
		res.status(500).json({
			status: "failed",
			message: e.message,
		});
	}
});
serviceRouter.get("/data-upload/:configId/status", async (req, res) => {
	try {
		const { configId } = req.params;
		if (!configId) {
			res.status(400).json({
				status: "failed",
				message: "Missing configId",
			});
			return;
		}
		const summary = getUploadStatus(configId);
		if (!summary) {
			res.status(404).json({
				status: "failed",
				message: "Status not found. Is this job  started?",
			});
			return;
		}
		res.json(summary);
	} catch (e: any) {
		res.status(500).json({
			status: "failed",
			message: e.message,
		});
	}
});
