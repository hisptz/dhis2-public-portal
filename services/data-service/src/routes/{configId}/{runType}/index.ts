import { Request, Response } from 'express'
import { Operation } from 'express-openapi'
import logger from '@/logging'
import { dbClient } from '@/clients/prisma'
import { getPagination } from '@/utils/pagination'
import { getMainConfig } from '@/utils/config'

export const GET: Operation = async (req: Request, res: Response) => {
	try {
		const { configId, runType } = req.params;
		const { page, pageSize } = req.query;
		const { skip, take, pageSizeNumber, pageNumber } = getPagination(
			page as string,
			pageSize as string,
		);
		const config = await getMainConfig(configId);
		if (!config || !runType) {
			res.status(404).json({
				status: "failed",
				message: "Configuration or run type not found",
			});
			return;
		}

		if (runType === 'metadata') {
			const [count, runs] = await Promise.all([
				dbClient.metadataRun.count({
					where: {
						mainConfigId: configId,
					},
				}),
				dbClient.metadataRun.findMany({
					skip,
					take,
					where: {
						mainConfigId: configId,
					},
					orderBy: {
						startedAt: "desc",
					},
				}),
			]);
			res.json({
				pager: {
					total: count,
					page: pageNumber,
					pageSize: pageSizeNumber,
					pageCount: Math.ceil(
						count / (pageSize ? parseInt(pageSize as string) : 10),
					),
				},
				items: runs,
			});

		} else {
			const [count, runs] = await Promise.all([
				dbClient.dataRun.count({
					where: {
						mainConfigId: configId,
					},
				}),
				dbClient.dataRun.findMany({
					skip,
					take,
					where: {
						mainConfigId: configId,
					},
					orderBy: {
						startedAt: "desc",
					},
				}),
			]);
			res.json({
				pager: {
					total: count,
					page: pageNumber,
					pageSize: pageSizeNumber,
					pageCount: Math.ceil(
						count / (pageSize ? parseInt(pageSize as string) : 10),
					),
				},
				items: runs,
			});
		}

	} catch (error) {
		logger.error(`Failed to get ${req.params.runType} runs for config ${req.params.configId}:`, error)
		res.status(500).json({
			success: false,
			error: error instanceof Error ? error.message : String(error),
			configId: req.params.configId,
			runType: req.params.runType,
			timestamp: new Date().toISOString(),
		})
	}
}


GET.apiDoc = {
	summary: 'Get a list of runs for a configuration',
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
			name: 'page',
			in: 'query',
			required: false,
			schema: {
				type: 'string',
				default: '1',
			},
		},
		{
			name: 'pageSize',
			in: 'query',
			required: false,
			schema: {
				type: 'string',
				default: '10',
			},
		},
	],
	responses: {
		200: {
			description: 'A list of runs',
			content: {
				'application/json': {
					schema: {
						type: 'object',
						properties: {
							pager: {
								type: 'object',
								properties: {
									total: { type: 'number' },
									page: { type: 'number' },
									pageSize: { type: 'number' },
									pageCount: { type: 'number' },
								},
							},
							items: {
								type: 'array',
								items: {
									type: 'object',
								},
							},
						},
					},
				},
			},
		},
		404: {
			description: 'Configuration not found',
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
							success: { type: 'boolean' },
							error: { type: 'string' },
							configId: { type: 'string' },
							runType: { type: 'string' },
							timestamp: { type: 'string' },
						},
					},
				},
			},
		},
	},	
 }

