import { Request, Response } from 'express'
import { Operation } from 'express-openapi'
import logger from '@/logging'
import { dbClient } from '@/clients/prisma'
import path from 'path'
import fs from 'fs'

export const GET: Operation = async (req: Request, res: Response) => {
    try {
        const { runType, taskId } = req.params

        const task =
            runType === 'metadata'
                ? await dbClient.metadataUpload.findUnique({
                      where: { uid: taskId },
                      select: { filename: true },
                  })
                : runType === 'data'
                  ? await dbClient.dataUpload.findUnique({
                        where: { uid: taskId },
                        select: { filename: true },
                    })
                  : undefined

        if (!task) {
            return res.status(404).json({
                status: 'failed',
                message: 'Task not found',
            })
        }

        const { filename } = task

        if (!filename) {
            return res.status(404).json({
                status: 'failed',
                message: 'File path not found',
            })
        }

        if (!fs.existsSync(filename)) {
            return res.status(404).json({
                status: 'failed',
                message: 'File not found on server',
            })
        }

        const downloadName = path.basename(filename)

        return res.download(filename, downloadName)
    } catch (error) {
        logger.error(`Failed to get file for task ${req.params.taskId}:`, error)

        return res.status(500).json({
            status: 'error',
            message: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString(),
        })
    }
}

GET.apiDoc = {
    summary: 'Download file for a failed upload task',
    description:
        'Allows downloading the file associated with a failed upload task for debugging purposes.',
    tags: ['Data Service'],
    parameters: [
        {
            name: 'configId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'ID of the data service configuration',
        },
        {
            name: 'runType',
            in: 'path',
            required: true,
            schema: { type: 'string', enum: ['metadata', 'data'] },
            description: 'Type of the run (metadata or data)',
        },
        {
            name: 'runId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'ID of the run',
        },
        {
            name: 'taskId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'ID of the task',
        },
    ],
    responses: {
        200: {
            description: 'File downloaded successfully',
            content: {
                'application/octet-stream': {
                    schema: { type: 'string', format: 'binary' },
                },
            },
        },
        404: {
            description: 'Task or file not found',
            content: {
                'application/json': {
                    schema: {
                        type: 'object',
                        properties: {
                            status: { type: 'string' },
                            message: { type: 'string' },
                        },
                    },
                },
            },
        },
        500: {
            description: 'Internal server error',
            content: {
                'application/json': {
                    schema: {
                        type: 'object',
                        properties: {
                            status: { type: 'string' },
                            message: { type: 'string' },
                            timestamp: { type: 'string', format: 'date-time' },
                        },
                    },
                },
            },
        },
    },
}
