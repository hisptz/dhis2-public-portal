export const getQueueNames = (configId: string) => ({
    metadataDownload: `${configId}-metadata-download-queue`,
    metadataUpload: `${configId}-metadata-upload-queue`,
    dataDownload: `${configId}-data-download-queue`,
    dataUpload: `${configId}-data-upload-queue`,
    dataDeletion: `${configId}-data-deletion-queue`,
    failed: `${configId}-failed-queue`
});


export type QueueNames = ReturnType<typeof getQueueNames>;
export type QueueType = keyof QueueNames;