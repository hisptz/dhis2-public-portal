import { useDataEngine } from '@dhis2/app-runtime';

export interface LogEntry {
    message: string;
    type: 'info' | 'success' | 'warning' | 'error' | 'info-low';
    timestamp: string;
}

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

    const setValue = async (namespace: string, key: string, data: Record<string, any>, addLog: (message: string, type: LogEntry['type']) => void) => {
        try {
            const mutation: any = {
                resource: `dataStore/${namespace}/${key}`,
                type: 'update' as const,
                data: data,
            };
            await engine.mutate(mutation);
            addLog(`Successfully set value for ${namespace}/${key}`, 'success');
        } catch (error) {
            addLog(`Error setting value for ${namespace}/${key}: ${error.message}`, 'error');
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

    return { getKeysInNamespace, getValue, setValue, deleteKey, clearNamespace, addLog };
};