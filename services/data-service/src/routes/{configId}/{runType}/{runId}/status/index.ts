import { Request, Response } from 'express'
import { Operation } from 'express-openapi'
import logger from '@/logging'
import { dbClient } from '@/clients/prisma'
import { getRunStatus } from '@/utils/status'

export const GET: Operation = async (req: Request, res: Response) => {
    try {
        const { configId, runType, runId } = req.params

        if (!configId || !runType || !runId) {
            return res.status(400).json({
                success: false,
                error: 'Configuration ID, run type and run ID are required',
                timestamp: new Date().toISOString(),
            })
        }

        const run = runType == 'metadata' ? await dbClient.metadataRun.findFirst({
            where: {
                mainConfigId: configId,
            },
            orderBy: {
                startedAt: 'desc',
            },
        }) : await dbClient.dataRun.findFirst({
            where: {
                mainConfigId: configId,
            },
            orderBy: {
                startedAt: 'desc',
            },
        });
        if (!run) {
            res.status(404).json({
                status: "failed",
                message: "Run not found",
            });
            return;
        }
        const response = await getRunStatus({ runId });
        res.json(response);
    } catch (error) {
        logger.error(`Failed to get run status for ${req.params.runType} run ${req.params.runId}:`, error)
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : String(error),
            configId: req.params.configId,
            runType: req.params.runType,
            runId: req.params.runId,
            timestamp: new Date().toISOString(),
        })
    }
}

