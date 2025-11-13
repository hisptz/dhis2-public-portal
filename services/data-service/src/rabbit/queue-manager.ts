import logger from "@/logging";
import { getChannel } from "./connection";
import { DatastoreNamespaces } from "@packages/shared/constants";
import { dhis2Client } from "@/clients/dhis2";
import { DataServiceConfig } from "@packages/shared/schemas";
import { getQueueNames } from "@/variables/queue-names";
import { startWorker } from "./worker";

/**
 * Creates all required queues for a specific config
 */
export async function createQueuesForConfig(configId: string) {
    const currentChannel = getChannel();
    if (!currentChannel) {
        throw new Error("Channel not initialized");
    }

    const queueNames = getQueueNames(configId);
    logger.info(`Creating queues for configId: ${configId}`);
    const queueOptions = {
        durable: true,
        arguments: {
            'x-dead-letter-exchange': '',
            'x-dead-letter-routing-key': queueNames.failed
        }
    };

    // Create failed queue first (no DLX routing to avoid circular reference)
    await currentChannel.assertQueue(queueNames.failed, { durable: true });
    logger.info(`Created queue: ${queueNames.failed}`);

    // Create all other queues with failed queue as DLX
    const queuesToCreate = [
        { name: queueNames.metadataDownload, description: 'Metadata Download' },
        { name: queueNames.metadataUpload, description: 'Metadata Upload' },
        { name: queueNames.dataDownload, description: 'Data Download' },
        { name: queueNames.dataUpload, description: 'Data Upload' },
        { name: queueNames.dataDeletion, description: 'Data Deletion' }
    ];

    for (const queue of queuesToCreate) {
        await currentChannel.assertQueue(queue.name, queueOptions);
        logger.info(`Created queue: ${queue.name} (${queue.description})`);
    }
    logger.info(`All queues created successfully for configId: ${configId}`);
    logger.info(`Restarting worker to setup consumers for new configuration: ${configId}`);
    await startWorker();
    logger.info(`Worker restarted successfully. Configuration ${configId} is ready for processing.`);

    return queueNames;
}

/**
 * Checks if config exists in datastore and creates queues
 */
export async function initializeQueuesFromDatastore(configId: string) {
    try {
        logger.info(`Checking datastore for configId: ${configId}`);

        const url = `dataStore/${DatastoreNamespaces.DATA_SERVICE_CONFIG}/${configId}`;
        const response = await dhis2Client.get<DataServiceConfig>(url);

        if (!response.data) {
            throw new Error(`Configuration ${configId} not found in datastore`);
        }


        const queueNames = await createQueuesForConfig(configId);

        return {
            config: response.data,
            queues: queueNames
        };
    } catch (error) {
        logger.error(`Failed to initialize queues for configId ${configId}: ${(error as Error).message || String(error)}`);
        throw error;
    }
}

/**
 * Initialize queues for all configs in datastore
 */
export async function initializeAllQueuesFromDatastore() {
    try {
        logger.info("Fetching all configurations from datastore...");

        const keysUrl = `dataStore/${DatastoreNamespaces.DATA_SERVICE_CONFIG}`;
        const keysResponse = await dhis2Client.get<string[]>(keysUrl);

        const configIds = keysResponse.data || [];
 
        const results = await Promise.allSettled(
            configIds.map(configId => initializeQueuesFromDatastore(configId))
        );

        const successful = results.filter(r => r.status === 'fulfilled').length;
        const failed = results.filter(r => r.status === 'rejected').length;

        logger.info(`Queue initialization complete: ${successful} successful, ${failed} failed`);

        return {
            total: configIds.length,
            successful,
            failed,
            results
        };
    } catch (error) {
        logger.error(`Failed to initialize queues from datastore: ${(error as Error).message || String(error)}`);
        throw error;
    }
}

/**
 * Purge all queues for a specific config
 */
export async function purgeConfigQueues(configId: string) {
    const currentChannel = getChannel();
    if (!currentChannel) {
        throw new Error("Channel not initialized");
    }

    const queueNames = getQueueNames(configId);
    const results: Record<string, any> = {};

    logger.info(`Purging all queues for configId: ${configId}`);

    const queuesToPurge = [
        { key: 'metadataDownload', name: queueNames.metadataDownload },
        { key: 'metadataUpload', name: queueNames.metadataUpload },
        { key: 'dataDownload', name: queueNames.dataDownload },
        { key: 'dataUpload', name: queueNames.dataUpload },
        { key: 'dataDeletion', name: queueNames.dataDeletion },
        { key: 'failed', name: queueNames.failed }
    ];

    for (const queue of queuesToPurge) {
        try {
            const purgeResult = await currentChannel.purgeQueue(queue.name);
            results[queue.key] = {
                name: queue.name,
                purged: true,
                messageCount: purgeResult.messageCount
            };
            logger.info(`Purged queue ${queue.name}: ${purgeResult.messageCount} messages`);
        } catch (error) {
            results[queue.key] = {
                name: queue.name,
                purged: false,
                error: (error as Error).message
            };
            logger.error(`Failed to purge queue ${queue.name}: ${(error as Error).message || String(error)}`);
        }
    }

    return {
        configId,
        results,
        timestamp: new Date().toISOString()
    };
}

/**
 * Delete all queues for a specific config
 */
export async function deleteConfigQueues(configId: string) {
    const currentChannel = getChannel();
    if (!currentChannel) {
        throw new Error("Channel not initialized");
    }

    const queueNames = getQueueNames(configId);
    const results: Record<string, any> = {};

    const queuesToDelete = [
        { key: 'metadataDownload', name: queueNames.metadataDownload },
        { key: 'metadataUpload', name: queueNames.metadataUpload },
        { key: 'dataDownload', name: queueNames.dataDownload },
        { key: 'dataUpload', name: queueNames.dataUpload },
        { key: 'dataDeletion', name: queueNames.dataDeletion },
        { key: 'failed', name: queueNames.failed }
    ];

    for (const queue of queuesToDelete) {
        try {
            const deleteResult = await currentChannel.deleteQueue(queue.name);
            results[queue.key] = {
                name: queue.name,
                deleted: true,
                messageCount: deleteResult.messageCount
            };
            logger.info(`Deleted queue ${queue.name}: ${deleteResult.messageCount} messages removed`);
        } catch (error) {
            results[queue.key] = {
                name: queue.name,
                deleted: false,
                error: (error as Error).message
            };
            logger.error(`Failed to delete queue ${queue.name}: ${(error as Error).message || String(error)}`);
        }
    }

    return {
        configId,
        results,
        timestamp: new Date().toISOString()
    };
}