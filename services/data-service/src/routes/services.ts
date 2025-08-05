import { Router } from "express";
import { dataDownloadBodySchema } from "@packages/shared/schemas";
import { fromError } from "zod-validation-error";
import { initializeDataDownload } from "@/services/data-download";
import logger from "@/logging";
import { AxiosError } from "axios";
import { getDownloadSummary, getUploadSummary, updateSummaryFile } from "@/services/summary";
import {  getQueueStatus } from "@/services/status";
import { v4 } from "uuid";
import { startDownloadWorker } from "@/rabbit/download.worker";
import { downloadQueue, uploadQueue } from "@/rabbit/publisher";
import { startUploadWorker } from "@/rabbit/upload.worker";

export const serviceRouter = Router();
/*
 Initiates data download and upload simultaneously.
 @params
  configIds - required, list of configurations to run data exchange on
 * */

serviceRouter.post("/data-download/:configId", async (req, res) => {
	try {
		const { configId } = req.params;

		const parsedBody = dataDownloadBodySchema.parse(req.body);

	
		void initializeDataDownload({
			mainConfigId: configId,
			dataItemsConfigIds: parsedBody.dataItemsConfigIds,
			runtimeConfig: parsedBody.runtimeConfig,
		}).catch((e) => {
			logger.error(
				`Config ${configId}: ${e.message}`
			);
		});

		await updateSummaryFile({
			id: v4(),
			type: "download",
			status: "QUEUED",
			timestamp: new Date().toISOString(),
			configId,
		});

		logger.info(`Download job for configId ${configId} has been queued.`);

		res.json({
			status: "queued",
		});
	} catch (e: any) {
		if (e instanceof AxiosError) {
			res.status(e.status ?? 500).json({
				status: "failed",
				message: e.message,
				details: e.response?.data,
			});
			return;
		} else if (e.errors) {
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

serviceRouter.get(["/data-download/:configId/status", "/data-upload/:configId/status"], async (req, res) => {
  try {
    const { configId } = req.params;
    const path = req.path;

    const queueName = path.startsWith("/data-download/")
      ? downloadQueue+configId
      : path.startsWith("/data-upload/")
      ? uploadQueue+configId
      : null;

    if (!queueName) {
      return res.status(400).json({
        status: "failed",
        message: "Unrecognized queue type",
      });
    }

    const status = await getQueueStatus(queueName);

    if (!status) {
      return res.status(404).json({
        status: "failed",
        message: "Queue status not found",
      });
    }

    return res.json({
      configId,
      ...status,
    });

  } catch (error: any) {
    res.status(500).json({
      status: "failed",
      message: error.message,
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
