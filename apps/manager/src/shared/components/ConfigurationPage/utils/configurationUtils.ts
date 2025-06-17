import { useDataEngine } from '@dhis2/app-runtime';

export interface LogEntry {
    message: string;
    type: 'info' | 'success' | 'warning' | 'error' | 'info-low';
    timestamp: string;
}

export interface DocumentDetails {
    id: string;
    name: string;
    url: string;
    external: boolean;
    attachment: string;
}

export const getContentTypeFromExtension = (filename: string): string => {
  const extension = filename.split('.').pop()?.toLowerCase();
  const mimeTypes: Record<string, string> = {
    svg: 'image/svg+xml',
    pdf: 'application/pdf',
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    txt: 'text/plain',
  };
  return extension && mimeTypes[extension] ? mimeTypes[extension] : 'application/octet-stream';
};


export const useConfiguration = () => {
    const engine = useDataEngine();

    const addLog = (setLogs: React.Dispatch<React.SetStateAction<LogEntry[]>>) => (
        message: string,
        type: LogEntry['type'] = 'info'
    ) => {
        setLogs((prev) => [{ message, type, timestamp: new Date().toISOString() }, ...prev.slice(0, 29)]);
    };

    const getKeysInNamespace = async (namespace: string, addLog: (message: string, type: LogEntry['type']) => void) => {
        try {
            const { result } = await engine.query({ result: { resource: `dataStore/${namespace}` } });
            return Array.isArray(result) ? result.filter((k): k is string => typeof k === 'string') : [];
        } catch (error) {
            if (error.details?.httpStatusCode === 404) {
                addLog(`Namespace '${namespace}' not found or is empty.`, 'info-low');
                return [];
            }
            addLog(`Error fetching keys for ${namespace}: ${error.message}`, 'error');
            throw error;
        }
    };

    const getValue = async <T>(namespace: string, key: string, addLog: (message: string, type: LogEntry['type']) => void): Promise<T | undefined> => {
        try {
            const { result } = await engine.query({ result: { resource: `dataStore/${namespace}/${key}` } });
            return result === null ? undefined : (result as T);
        } catch (error) {
            if (error.details?.httpStatusCode === 404) {
                return undefined;
            }
            addLog(`Error fetching value for ${namespace}/${key}: ${error.message}`, 'error');
            throw error;
        }
    };

    const setValue = async (namespace: string, key: string, data: Record<string, any>, addLog?: (message: string, type: LogEntry['type']) => void) => {
        try {
            const mutation: any = {
                resource: `dataStore/${namespace}/${key}`,
                type: 'update' as const,
                data: data,
            };
            await engine.mutate(mutation);
            if (addLog) {
                addLog(`Successfully set value for ${namespace}/${key}`, 'success');
            }
        } catch (error) {
            if (addLog) {
                addLog(`Error setting value for ${namespace}/${key}: ${error.message}`, 'error');
            }
            throw error;
        }
    };

    const deleteKey = async (namespace: string, key: string, addLog: (message: string, type: LogEntry['type']) => void) => {
        try {
            await engine.mutate({
                resource: `dataStore/${namespace}`,
                type: 'delete',
                id: key,
            });
            addLog(`Successfully deleted key ${namespace}/${key}`, 'success');
        } catch (error) {
            if (error.details?.httpStatusCode === 404) {
                addLog(`Key '${key}' not found in namespace '${namespace}'. No action taken.`, 'info-low');
                return;
            }
            addLog(`Error deleting key ${namespace}/${key}: ${error.message}`, 'error');
            throw error;
        }
    };

    const clearNamespace = async (namespace: string, addLog: (message: string, type: LogEntry['type']) => void) => {
        const keys = await getKeysInNamespace(namespace, addLog);
        if (!keys.length) {
            addLog(`Namespace ${namespace} is empty or does not exist.`, 'info');
            return;
        }
        await Promise.all(keys.map((key) => deleteKey(namespace, key, addLog)));
        addLog(`Namespace ${namespace} cleared successfully.`, 'success');
    };


    const fetchDocumentDetails = async (
        documentId: string,
        addLog: (message: string, type: LogEntry['type']) => void
    ): Promise<DocumentDetails | null> => {
        try {
            const { result } = await engine.query({
                result: {
                    resource: `documents/${documentId}`,
                    params: {
                        fields: 'id,name,url,external,attachment',
                    },
                },
            });
            if (!result || typeof result !== 'object' || Array.isArray(result)) {
                addLog(`No valid details found for document ID: ${documentId}`, 'warning');
                return null;
            }
            const { id, name, url, external, attachment } = result as {
                id: string;
                name: string;
                url?: string;
                external?: boolean;
                attachment?: string;
            };
            if (!id || !name) {
                addLog(`Incomplete document details for ID: ${documentId}`, 'warning');
                return null;
            }
            return { id, name, url: url || '', external: !!external, attachment: attachment || '' };
        } catch (error) {
            addLog(`Error fetching details for document ID: ${documentId}: ${error.message}`, 'error');
            return null;
        }
    };

    const fetchDocumentData = async (
        documentId: string,
        documentName: string,
        addLog: (message: string, type: LogEntry['type']) => void
    ): Promise<{ data: Blob; filename: string } | null> => {
        try {
            const { result } = await engine.query({
                result: {
                    resource: `documents/${documentId}/data`,
                },
            });
            if (!(result instanceof Blob)) {
                addLog(`Invalid data format for document ID: ${documentId} - expected Blob`, 'warning');
                return null;
            }
            return { data: result, filename: documentName };
        } catch (error) {
            addLog(`Error fetching data for document ID: ${documentId}: ${error.message}`, 'error');
            return null;
        }
    };

    const deleteDocument = async (
        document: DocumentDetails,
        addLog?: (message: string, type: LogEntry['type']) => void
    ): Promise<boolean> => {
        try {
            await engine.mutate({
                resource: `documents`,
                type: 'delete',
                id: document.id,
            });
            return true;
        } catch (error) {
            if (error.details?.httpStatusCode === 404) {
                if (addLog) {
                    addLog(`Document '${document.name}' not found. No action taken.`, 'info-low');
                }
                return true;
            }
            if (addLog) {
                addLog(`Error deleting document ${document.id} (${document.name}): ${error.message}`, 'error');
            }
            return false;
        }
    };

    const uploadDocument = async (
        document: DocumentDetails,
        addLog: (message: string, type: LogEntry['type']) => void
    ): Promise<boolean> => {
        try {
            await engine.mutate({
                resource: `documents`,
                type: 'create',
                data: document,
            });
            addLog(`Successfully uploaded document ${document.name}`, 'info-low');
            return true;
        } catch (error) {
            addLog(`Error uploading document ${document.id} (${document.name}): ${error.message}`, 'error');
            return false;
        }
    };

    return { getKeysInNamespace, getValue, setValue, deleteKey, clearNamespace, addLog, fetchDocumentDetails, fetchDocumentData, uploadDocument, deleteDocument };
};