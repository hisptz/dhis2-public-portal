import fs from 'fs';
import logger from '@/logging';

export type JobType = 'metadata-download' | 'metadata-upload' | 'data-download' | 'data-upload';

export interface SimpleJobProgress {
    configId: string;
    jobType: JobType;
    totalItems: number;
    processedItems: number;
    isActive: boolean;
    lastUpdated: Date;
}

export interface ProcessStatus {
    queued: number;
    processing: number;
    failed: number;
}

// Helper function to get progress file path
function getProgressFile(configId: string): string {
    return `./outputs/data/${configId}/progress.json`;
}

// Save progress to file
async function saveProgress(configId: string, jobType: JobType, progress: SimpleJobProgress): Promise<void> {
    const progressFile = getProgressFile(configId);
    const dir = `./outputs/data/${configId}`;
    
    await fs.promises.mkdir(dir, { recursive: true });
    
    let allProgress: Record<string, SimpleJobProgress> = {};
    try {
        const existing = await fs.promises.readFile(progressFile, 'utf8');
        allProgress = JSON.parse(existing);
    } catch {}
    
    allProgress[jobType] = progress;
    await fs.promises.writeFile(progressFile, JSON.stringify(allProgress, null, 2));
}

// Start a new job
export async function startJob(configId: string, jobType: JobType, totalItems: number): Promise<void> {
    logger.info(`[Progress] Starting ${jobType} for ${configId}: ${totalItems} items`);
    await updateProgress(configId, jobType, totalItems, 0);
}

// Update progress for a job
export async function updateProgress(
    configId: string, 
    jobType: JobType, 
    totalItems: number, 
    processedItems: number
): Promise<void> {
    const progress: SimpleJobProgress = {
        configId,
        jobType,
        totalItems,
        processedItems,
        isActive: processedItems < totalItems,
        lastUpdated: new Date()
    };

    await saveProgress(configId, jobType, progress);
    
    if (processedItems % 10 === 0 || processedItems === totalItems) {
        logger.info(`[Progress] ${configId}-${jobType}: ${processedItems}/${totalItems} items`);
    }
}

// Complete a job
export async function completeJob(configId: string, jobType: JobType): Promise<void> {
    const current = await getProgress(configId, jobType);
    if (current) {
        await updateProgress(configId, jobType, current.totalItems, current.totalItems);
        logger.info(`[Progress] Completed ${jobType} for ${configId}`);
    }
}

// Get progress for a specific job
export async function getProgress(configId: string, jobType: JobType): Promise<SimpleJobProgress | null> {
    try {
        const progressFile = getProgressFile(configId);
        const data = await fs.promises.readFile(progressFile, 'utf8');
        const allProgress = JSON.parse(data);
        return allProgress[jobType] || null;
    } catch {
        return null;
    }
}

// Get all progress for a config
export async function getAllProgress(configId: string): Promise<Record<string, SimpleJobProgress>> {
    try {
        const progressFile = getProgressFile(configId);
        const data = await fs.promises.readFile(progressFile, 'utf8');
        return JSON.parse(data);
    } catch {
        return {};
    }
}

// Build process status for UI
export function buildProcessStatus(jobType: JobType, progressData: Record<string, SimpleJobProgress>, failedCount: number = 0): ProcessStatus {
    const progress = progressData[jobType];
    
    if (!progress) {
        return { queued: 0, processing: 0, failed: failedCount };
    }
    
    const remaining = progress.totalItems - progress.processedItems;
    const processing = progress.isActive && remaining > 0 ? 1 : 0;
    const queued = Math.max(0, remaining - processing);
    
    return {
        queued,
        processing, 
        failed: failedCount
    };
}