import { NextFunction, Request, Response } from 'express';
import logger from '@/logging';
import { validateMetadata } from '@/services/metadata-migration/metadata-upload';
import { pushToQueue } from '@/rabbit/publisher';
import { Operation } from 'express-openapi';

export const POST: Operation = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
      const { id: configId } = req.params;
      const { metadata } = req.body;

      if (!configId) {
        return res.status(400).json({
          error: 'Configuration ID is required',
          message: 'Please provide a valid configuration ID in the URL parameters'
        });
      }

      if (!metadata) {
        return res.status(400).json({
          error: 'Metadata is required',
          message: 'Please provide metadata in the request body'
        });
      }

      // Validate metadata structure
      if (!validateMetadata(metadata)) {
        return res.status(400).json({
          error: 'Invalid metadata structure',
          message: 'The provided metadata does not match the expected structure'
        });
      }

      logger.info(`Metadata upload request received for config: ${configId}`);
 
      await pushToQueue(configId, 'metadataUpload', {
        metadata,
        configId,
        queuedAt: new Date().toISOString()
      });
      
      res.status(202).json({
        message: 'Metadata upload queued successfully',
        configId,
        status: 'queued',
        description: 'Metadata has been queued for upload processing'
      });

    } catch (error: any) {
      logger.error('Error in metadata upload endpoint:', error);
      
      res.status(500).json({
        error: 'Metadata upload failed',
        message: error.message || 'An unexpected error occurred during metadata upload',
        configId: req.params.id
      });
    }
};

POST.apiDoc = {
    summary: "Upload processed metadata for a configuration",
    description: "Queues already processed metadata for upload to destination DHIS2 instance. Used for retrying uploads when download succeeded but upload failed.",
    operationId: "uploadProcessedMetadata",
    tags: ["METADATA"],
    parameters: [
        {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
            description: "Configuration ID"
        }
    ],
    requestBody: {
        required: true,
        content: {
            "application/json": {
                schema: {
                    type: "object",
                    properties: {
                        metadata: {
                            type: "object",
                            description: "Already processed metadata ready for upload"
                        }
                    },
                    required: ["metadata"]
                }
            }
        }
    },
    responses: {
        "202": {
            description: "Metadata upload queued successfully",
            content: {
                "application/json": {
                    schema: {
                        type: "object",
                        properties: {
                            message: { type: "string" },
                            configId: { type: "string" },
                            status: { type: "string" },
                            description: { type: "string" }
                        }
                    }
                }
            }
        },
        "400": {
            description: "Bad request - missing or invalid parameters"
        },
        "500": {
            description: "Internal server error during metadata upload"
        }
    }
};
