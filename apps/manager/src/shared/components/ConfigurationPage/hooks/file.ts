import { useDataMutation } from '@dhis2/app-runtime';
import { LogEntry } from '../utils/configurationUtils';

const fileUploadMutation: any = {
    resource: 'fileResources',
    type: 'create',
    data: ({ file }: { file: File }) => ({ file, domain: 'DOCUMENT' }),
};

export const useFile = () => {
    const [mutate] = useDataMutation(fileUploadMutation, {
        onError: (error) => {
            console.error('File upload error:', error.message);
        },
    });

    const uploadFile = async (
        file: Blob,
        filename: string,
        addLog: (message: string, type: LogEntry['type']) => void
    ): Promise<string | null> => {
        try {
            const fileObject = new File([file], filename, { type: file.type });
            const response = await mutate({ file: fileObject }) as any;
            const fileResourceId = response?.response?.fileResource?.id;

            if (!fileResourceId) {
                addLog(`Failed to upload file resource for ${filename}: No ID returned`, 'error');
                return null;
            }
            return fileResourceId;
        } catch (error) {
            addLog(`Error uploading file resource for ${filename}: ${error.message}`, 'error');
            return null;
        }
    };

    return { uploadFile };
};