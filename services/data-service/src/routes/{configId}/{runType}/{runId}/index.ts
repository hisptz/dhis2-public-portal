import { Request, Response } from 'express'
import { Operation } from 'express-openapi'
import logger from '@/logging'
import { dbClient } from '@/clients/prisma'
import { getRunStatus } from '@/utils/status'
import { getPagination } from '@/utils/pagination'

export const GET: Operation = async (req: Request, res: Response) => {
	try {
		const { configId, runType, runId } = req.params

		const {
			downloadsPage,
			downloadsPageSize,
			uploadsPage,
			uploadsPageSize,
		} = req.query

		if (!configId || !runType || !runId) {
			res.status(404).json({
				status: "failed",
				message: "Run not found",
			})
			return
		}

		const downloadsPagination = getPagination(
			downloadsPage as string,
			downloadsPageSize as string
		)

		const uploadsPagination = getPagination(
			uploadsPage as string,
			uploadsPageSize as string
		)

		const {
			skip: downloadsSkip,
			take: downloadsTake,
			pageNumber: downloadsPageNumber,
			pageSizeNumber: downloadsPageSizeNumber,
		} = downloadsPagination

		const {
			skip: uploadsSkip,
			take: uploadsTake,
			pageNumber: uploadsPageNumber,
			pageSizeNumber: uploadsPageSizeNumber,
		} = uploadsPagination

		if (runType === "metadata") {
			const run = await dbClient.metadataRun.findFirst({
				where: {
					uid: runId,
					mainConfigId: configId,
				},
				include: {
					downloads: {
						skip: downloadsSkip,
						take: downloadsTake,
						orderBy: { startedAt: "desc" },
					},
					uploads: {
						skip: uploadsSkip,
						take: uploadsTake,
						orderBy: { startedAt: "desc" },
					},
				},
			})

			if (!run) {
				res.status(404).json({
					status: "failed",
					message: "Run not found",
				})
				return
			}

			const [downloadsCount, uploadsCount] = await Promise.all([
				dbClient.metadataDownload.count({
					where: { run: { uid: runId } },
				}),
				dbClient.metadataUpload.count({
					where: { run: { uid: runId } },
				}),
			])

			res.json({
				...run,
				status: await getRunStatus({ runId, runType }),
				downloadsPager: {
					total: downloadsCount,
					page: downloadsPageNumber,
					pageSize: downloadsPageSizeNumber,
					pageCount: Math.ceil(downloadsCount / downloadsPageSizeNumber),
				},
				uploadsPager: {
					total: uploadsCount,
					page: uploadsPageNumber,
					pageSize: uploadsPageSizeNumber,
					pageCount: Math.ceil(uploadsCount / uploadsPageSizeNumber),
				},
			})
		} else {
			const run = await dbClient.dataRun.findFirst({
				where: {
					uid: runId,
					mainConfigId: configId,
				},
				include: {
					downloads: {
						skip: downloadsSkip,
						take: downloadsTake,
						orderBy: { startedAt: "desc" },
					},
					uploads: {
						skip: uploadsSkip,
						take: uploadsTake,
						orderBy: { startedAt: "desc" },
					},
				},
			})

			if (!run) {
				res.status(404).json({
					status: "failed",
					message: "Run not found",
				})
				return
			}

			const [downloadsCount, uploadsCount] = await Promise.all([
				dbClient.dataDownload.count({
					where: { run: { uid: runId } },
				}),
				dbClient.dataUpload.count({
					where: { run: { uid: runId } },
				}),
			])

			res.json({
				...run,
				status: await getRunStatus({ runId, runType }),
				downloadsPager: {
					total: downloadsCount,
					page: downloadsPageNumber,
					pageSize: downloadsPageSizeNumber,
					pageCount: Math.ceil(downloadsCount / downloadsPageSizeNumber),
				},
				uploadsPager: {
					total: uploadsCount,
					page: uploadsPageNumber,
					pageSize: uploadsPageSizeNumber,
					pageCount: Math.ceil(uploadsCount / uploadsPageSizeNumber),
				},
			})
		}
	} catch (error) {
		logger.error(
			`Failed to get ${req.params.runType} run ${req.params.runId} for config ${req.params.configId}:`,
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

GET.apiDoc = {
    summary: 'Get the details and status of a run',
    tags: ['Data Service'],
    parameters: [
        {
            name: 'configId',
            in: 'path',
            required: true,
            schema: {
                type: 'string',
            },
        },
        {
            name: 'runType',
            in: 'path',
            required: true,
            schema: {
                type: 'string',
                enum: ['metadata', 'data'],
            },
        },
        {
            name: 'runId',
            in: 'path',
            required: true,
            schema: {
                type: 'string',
            },
        },
    ],
    responses: {
        200: {
            description: 'Run details and status',
            content: {
                'application/json': {
                    schema: {
                        type: 'object',
                        properties: {
                            uid: { type: 'string' },
                            mainConfigId: { type: 'string' },
                            runType: { type: 'string' },
                            startedAt: { type: 'string', format: 'date-time' },
                            completedAt: { type: 'string', format: 'date-time' },
                            status: { type: 'string' },
                            downloads: {
                                type: 'array',
                                items: {
                                    type: 'object',
                                    properties: {
                                        uid: { type: 'string' },
                                        status: { type: 'string' },
                                    },
                                },
                            },
                            uploads: {
                                type: 'array',
                                items: {
                                    type: 'object',
                                    properties: {
                                        uid: { type: 'string' },
                                        fileName: { type: 'string' },
                                        status: { type: 'string' },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
        400: {
            description: 'Bad request',
            content: {
                'application/json': {
                    schema: {
                        type: 'object',
                        properties: {
                            success: { type: 'boolean' },
                            error: { type: 'string' },
                            timestamp: { type: 'string', format: 'date-time' },
                        },
                    },
                },
            },
        },
        404: {
            description: 'Run not found',
            content: {
                'application/json': {
                    schema: {
                        type: 'object',
                        properties: {
                            success: { type: 'boolean' },
                            error: { type: 'string' },
                            timestamp: { type: 'string', format: 'date-time' },
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
                            success: { type: 'boolean' },
                            error: { type: 'string' },
                            configId: { type: 'string' },
                            runType: { type: 'string' },
                            runId: { type: 'string' },
                            timestamp: { type: 'string', format: 'date-time' },
                        },
                    },
                },
            },
        },
    }
}
