import { Request, Response } from 'express'
import { Operation } from 'express-openapi'
import { dbClient } from '@/clients/prisma'
import { NullableJsonNullValueInput } from '@/generated/prisma/internal/prismaNamespace';
import { Queues } from '@/rabbit/constants';
import { isEmpty, fromPairs } from 'lodash';
import logger from '@/logging';
import { pushToQueue } from '@/rabbit/publisher';

export const POST: Operation = async (req: Request, res: Response) => {
    try {
        const { configId, runType, runId } = req.params;
        const { uploads, downloads } = req.body;
        const run = runType === 'metadata' ? await dbClient.metadataRun.findUnique({
            where: {
                uid: runId,
                mainConfigId: configId,
            },
        }) : await dbClient.dataRun.findUnique({
            where: {
                uid: runId,
                mainConfigId: configId,
            },
        });
        if (!run) {
            res.status(404).json({
                status: "failed",
                message: "Run not found",
            });
            return;
        }
        if (isEmpty(uploads) && isEmpty(downloads)) {
            res.status(400).json({
                status: "failed",
                message:
                    "Please specify at least one upload or download to retry",
            });
            return;
        }
        const downloadMap = new Map();
        const uploadMap = new Map();
        if (runType === 'metadata') {
            if (!isEmpty(downloads)) {
                for (const download of downloads) {
                    await dbClient.metadataDownload.update({
                        where: {
                            uid: download.id,
                        },
                        data: {
                            finishedAt: null,
                            error: null,
                            errorObject:
                                null as unknown as NullableJsonNullValueInput,
                        },
                    });
                    downloadMap.set(
                        download.id,
                        pushToQueue({
                            queue: Queues.METADATA_DOWNLOAD,
                            reference: download.id,
                        })
                    );
                }
            }
            if (!isEmpty(uploads)) {
                for (const upload of uploads) {
                    await dbClient.metadataUpload.update({
                        where: {
                            uid: upload.id,
                        },
                        data: {
                            finishedAt: null,
                            error: null,
                            errorObject:
                                null as unknown as NullableJsonNullValueInput,
                        },
                    });
                    uploadMap.set(
                        upload.id,
                        pushToQueue({
                            queue: Queues.METADATA_UPLOAD,
                            reference: upload.id,
                        })
                    );
                }
            }

        } else {
            if (!isEmpty(downloads)) {
                for (const download of downloads) {
                    await dbClient.dataDownload.update({
                        where: {
                            uid: download.id,
                        },
                        data: {
                            finishedAt: null,
                            error: null,
                            errorObject:
                                null as unknown as NullableJsonNullValueInput,
                        },
                    });
                    downloadMap.set(
                        download.id,
                        pushToQueue({
                            queue: Queues.DATA_DOWNLOAD,
                            reference: download.id,
                        })

                    );
                }
            }
            if (!isEmpty(uploads)) {
                for (const upload of uploads) {
                    await dbClient.dataUpload.update({
                        where: {
                            uid: upload.id,
                        },
                        data: {
                            finishedAt: null,
                            error: null,
                            errorObject:
                                null as unknown as NullableJsonNullValueInput,
                        },
                    });
                    uploadMap.set(
                        upload.id,
                        pushToQueue({
                            queue: Queues.DATA_UPLOAD,
                            reference: upload.id,
                        })
                    );
                }
            }
        }
        res.json({
            success: true,
            downloads: fromPairs(Array.from(downloadMap.entries())),
            uploads: fromPairs(Array.from(uploadMap.entries())),
        });
        return;

    } catch (error) {
        const { runType } = req.params;
        const { uploads, downloads } = req.body;

        if (runType === 'metadata') {
            if (!isEmpty(downloads)) {
                for (const download of downloads) {
                    await dbClient.metadataDownload.update({
                        where: {
                            uid: download.id,
                        },
                        data: {
                            finishedAt: new Date(),
                            error: "Failed to retry download",
                            errorObject: {
                                message: "Failed to retry download",
                                details: error instanceof Error ? error.stack : String(error),
                            } as unknown as NullableJsonNullValueInput,
                        },
                    });
                }
            }
            if (!isEmpty(uploads)) {
                for (const upload of uploads) {
                    await dbClient.metadataUpload.update({
                        where: {
                            uid: upload.id,
                        },
                        data: {
                            finishedAt: new Date(),
                            error: "Failed to retry upload",
                            errorObject: {
                                message: "Failed to retry upload",
                                details: error instanceof Error ? error.stack : String(error),
                            } as unknown as NullableJsonNullValueInput,
                        },
                    });
                }
            }

        } else {
            if (!isEmpty(downloads)) {
                for (const download of downloads) {
                    await dbClient.dataDownload.update({
                        where: {
                            uid: download.id,
                        },
                        data: {
                            finishedAt: new Date(),
                            error: "Failed to retry download",
                            errorObject: {
                                message: "Failed to retry download",
                                details: error instanceof Error ? error.stack : String(error),
                            } as unknown as NullableJsonNullValueInput,
                        },
                    });
                }
            }
            if (!isEmpty(uploads)) {
                for (const upload of uploads) {
                    await dbClient.dataUpload.update({
                        where: {
                            uid: upload.id,
                        },
                        data: {
                            finishedAt: new Date(),
                            error: "Failed to retry upload",
                            errorObject: {
                                message: "Failed to retry upload",
                                details: error instanceof Error ? error.stack : String(error),
                            } as unknown as NullableJsonNullValueInput,
                        },
                    });
                }
            }
        }
        logger.error(`Failed to retry ${req.params.runType} run ${req.params.runId} for config ${req.params.configId}`, error)
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


POST.apiDoc = {
    summary: 'Retry a run by re-queuing its failed uploads and downloads',
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
    requestBody: {
        required: true,
        content: {
            'application/json': {
                schema: {
                    type: 'object',
                    properties: {
                        uploads: {
                            type: 'array',
                            items: {
                                type: 'object', properties: { uid: { type: 'string' }, },
                            },
                        },
                        downloads: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    uid: { type: 'string' },
                                },
                            },
                        },
                    },
                },
            },
        },
    }, responses: {
        200: {
            description: 'Run retry initiated successfully', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, uploads: { type: 'object', additionalProperties: { type: 'boolean' }, }, downloads: { type: 'object', additionalProperties: { type: 'boolean' }, }, }, }, }, }
        },

        400: { description: 'Bad request', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, message: { type: 'string' }, }, }, }, }, },

        404: { description: 'Run not found', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, message: { type: 'string' }, }, }, }, }, },


        500: { description: 'Internal server error', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, error: { type: 'string' }, configId: { type: 'string' }, runType: { type: 'string' }, runId: { type: 'string' }, timestamp: { type: 'string', format: 'date-time' }, }, }, }, }, },

    }
}







