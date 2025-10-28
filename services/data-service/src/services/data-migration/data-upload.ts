import logger from "@/logging";
import { dhis2Client } from "@/clients/dhis2";
import { displayUploadSummary } from "@/services/summary";
import { AxiosError } from "axios";

export interface DataUploadJob {
    mainConfigId: string;
    filename: string;
    queuedAt?: string;
    downloadedFrom?: string;
}

export async function uploadDataFromQueue(jobData: any): Promise<void> {
    try {
        const { mainConfigId, filename, queuedAt, downloadedFrom } = jobData;

        logger.info(`Processing data upload job for config: ${mainConfigId}`, {
            filename,
            queuedAt,
            downloadedFrom,
            jobDataKeys: Object.keys(jobData || {}),
        });

        if (!validateUploadJobData(jobData)) {
            throw new Error(`Invalid upload job data for config: ${mainConfigId}`);
        }

        await uploadDataFromFile({ filename, configId: mainConfigId });

        logger.info(`Data upload job completed successfully for config: ${mainConfigId}`, {
            filename,
            downloadedFrom,
        });

    } catch (error: any) {
        logger.error(`Error processing data upload job:`, {
            error: {
                message: error.message,
                stack: error.stack,
                name: error.name,
            },
            jobData: {
                mainConfigId: jobData?.mainConfigId,
                filename: jobData?.filename,
                queuedAt: jobData?.queuedAt,
                downloadedFrom: jobData?.downloadedFrom,
                jobDataKeys: Object.keys(jobData || {}),
            }
        });
        throw error;
    }
}

function validateUploadJobData(jobData: any): boolean {
    const { mainConfigId, filename } = jobData;
    
    if (!mainConfigId || !filename) {
        logger.error("Missing required upload job data fields", {
            hasMainConfigId: !!mainConfigId,
            hasFilename: !!filename,
        });
        return false;
    }
    
    return true;
}

export async function completeUpload(configId: string): Promise<void> {
    try {
        logger.info(`Completing upload process for config: ${configId}`);
        await displayUploadSummary(configId);
        logger.info(`Upload process completed for config: ${configId}`);
    } catch (error) {
        logger.error(`Error completing upload for config: ${configId}`, error);
        throw error;
    }
}


export async function uploadDataFromFile({
    filename,
    configId,
}: {
    filename: string;
    configId: string;
}): Promise<void> {
    const file = Bun.file(filename, {
        type: "application/json",
    });

    try {
        logger.info(`Starting data upload from file: ${filename} for config: ${configId}`);

        if (!(await file.exists())) {
            throw new Error(`Data file does not exist: ${filename}`);
        }

        const payload = await file.json();
        
        if (!payload.dataValues || !Array.isArray(payload.dataValues)) {
            throw new Error(`Invalid data file format: missing or invalid dataValues array in ${filename}`);
        }

        logger.info(`Uploading ${payload.dataValues.length} data values from ${filename}`);

        const uploadResponse = await uploadDataValues(payload);
        
        logger.info(`Data upload completed successfully for ${filename}`, {
            imported: uploadResponse.imported,
            ignored: uploadResponse.ignored,
            total: payload.dataValues.length
        });

        // Clean up the file after successful upload
        await cleanupDataFile(file, filename);

    } catch (error: any) {
        logger.error(`Error uploading data from file ${filename}:`, {
            error: {
                message: error.message,
                stack: error.stack,
                name: error.name,
            },
            configId,
            filename,
        });

        // Handle specific error cases
        if (error instanceof AxiosError) {
            await handleUploadAxiosError(error, file, filename);
        }

        throw error;
    }
}

async function uploadDataValues(payload: any): Promise<{ imported: number; ignored: number }> {
    const url = `dataValueSets`;
    const params = {
        importStrategy: "CREATE_AND_UPDATE",
        async: false,
    };

    const response = await dhis2Client.post(url, payload, { params });
    const importSummary = response.data?.response;
    
    if (!importSummary || !importSummary.importCount) {
        throw new Error("Invalid response from DHIS2 data upload");
    }

    const imported = importSummary.importCount.imported || 0;
    const ignored = importSummary.importCount.ignored || 0;

    logger.info(`Upload summary: ${imported} imported, ${ignored} ignored`);

    if (ignored > 0) {
        logger.warn(`${ignored} data values were ignored during upload`);
    }

    return { imported, ignored };
}

async function cleanupDataFile(file: any, filename: string): Promise<void> {
    try {
        if (await file.exists()) {
            await file.delete();
            logger.info(`Successfully deleted temporary file: ${filename}`);
        }
    } catch (cleanupError) {
        logger.warn(`Failed to delete temporary file: ${filename}`, cleanupError);
        // Don't throw here - file cleanup failure shouldn't fail the upload
    }
}

async function handleUploadAxiosError(error: AxiosError, file: any, filename: string): Promise<void> {
    const response = error.response;
    
    if (response?.status === 409) {
        // Handle conflicts - these are often acceptable (data already exists)
        logger.warn(`Conflicts detected during upload of ${filename}`, {
            status: response.status,
            statusText: response.statusText
        });

        const responseData = response.data as any;
        const importSummary = responseData?.response;
        if (importSummary) {
            const imported = importSummary.importCount?.imported || 0;
            const ignored = importSummary.importCount?.ignored || 0;
            
            logger.info(`Conflict upload summary: ${imported} imported, ${ignored} ignored`);
        }

        // Clean up file even on conflicts
        await cleanupDataFile(file, filename);
        
        // Re-throw to let caller handle the conflict as needed
        return;
    }

    // Log other HTTP errors
    logger.error(`HTTP error during upload of ${filename}`, {
        status: response?.status,
        statusText: response?.statusText,
        data: response?.data,
    });
}
