import { NextFunction, Request, Response } from 'express';
import logger from '@/logging';
import { uploadMetadata, validateMetadata } from '@/services/metadata-migration/metadata-upload';
import { pushToQueue } from '@/rabbit/publisher';
import { Operation } from 'express-openapi';

export const POST: Operation = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
      const { id: configId } = req.params;
      const { metadata, queueUpload = false } = req.body;

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

      if (queueUpload) {
        // Queue the upload for background processing
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
      } else {
        // Upload immediately
        await uploadMetadata(metadata, configId);
        
        res.status(200).json({
          message: 'Metadata uploaded successfully',
          configId,
          status: 'completed'
        });
      }

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
    summary: "Upload metadata for a configuration",
    description: "Uploads processed metadata either immediately or queues it for background processing",
    operationId: "uploadMetadata",
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
                            description: "Processed metadata to upload"
                        },
                        queueUpload: {
                            type: "boolean",
                            default: false,
                            description: "Whether to queue the upload for background processing"
                        }
                    },
                    required: ["metadata"]
                }
            }
        }
    },
    responses: {
        "200": {
            description: "Metadata uploaded successfully (immediate upload)",
            content: {
                "application/json": {
                    schema: {
                        type: "object",
                        properties: {
                            message: { type: "string" },
                            configId: { type: "string" },
                            status: { type: "string" }
                        }
                    }
                }
            }
        },
        "202": {
            description: "Metadata upload queued successfully (queued upload)",
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
