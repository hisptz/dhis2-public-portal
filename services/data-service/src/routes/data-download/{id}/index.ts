import { NextFunction, Request, Response } from 'express';
import logger from '@/logging';
import { Operation } from 'express-openapi';
import { dataDownloadBodySchema } from '@packages/shared/schemas';
import { AxiosError } from 'axios';
import { fromError } from 'zod-validation-error';
import { downloadAndQueueData } from '@/services/data-migration/data-download';

export const POST: Operation = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { id: configId } = req.params;
        const parsedBody = dataDownloadBodySchema.parse(req.body);
        
        logger.info(`Starting data download process for config: ${configId}`, {
            dataItemsCount: parsedBody.dataItemsConfigIds.length,
            periodsCount: parsedBody.runtimeConfig.periods.length,
        });

        await downloadAndQueueData({
            mainConfigId: configId,
            dataItemsConfigIds: parsedBody.dataItemsConfigIds,
            runtimeConfig: parsedBody.runtimeConfig,
        });

        logger.info(`Data download jobs successfully queued for config: ${configId}`);

        res.json({
            status: "queued",
            message: `Data download process started for config ${configId}`,
        });
    } catch (e: any) {
        logger.error(`Error in data download endpoint for config ${req.params.id}:`, e);
        
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
};