import { Request, Response } from 'express'
import { Operation } from 'express-openapi'
import logger from '@/logging'
import { dbClient } from '@/clients/prisma'
import { getRunStatus } from '@/utils/status'

export const GET: Operation = async (req: Request, res: Response) => {
    try {
        const { configId } = req.params

        if (!configId) {
            return res.status(400).json({
                success: false,
                error: 'Configuration ID, run type and run ID are required',
                timestamp: new Date().toISOString(),
            })
        }

        const [metadataRun, dataRun] = await Promise.all([
            dbClient.metadataRun.findFirst({
                where: {
                    mainConfigId: configId,
                },
                orderBy: {
                    startedAt: 'desc',
                },
            }),
            dbClient.dataRun.findFirst({
                where: {
                    mainConfigId: configId,
                },
                orderBy: {
                    startedAt: 'desc',
                },
            }),
        ])
        const runs = [
            ...(metadataRun ? [metadataRun] : []),
            ...(dataRun ? [dataRun] : []),
        ].sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime())

        if (runs.length === 0) {
            return res.json({
                status: 'IGNORED',
            })
        }

        const runType = metadataRun?.uid === runs[0].uid ? 'metadata' : 'data'
        const response = await getRunStatus({ runId: runs[0].uid, runType })
        res.json(response)
    } catch (error) {
        logger.error(
            `Failed to get run status for ${req.params.runType} run ${req.params.runId}:`,
            error
        )
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
