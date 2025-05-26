import React, { useState, useCallback } from 'react';
import { useDataEngine, } from '@dhis2/app-runtime';
import {
    Button,
    FileInputField,
    NoticeBox,
    Card,
    IconArrowUp16,
    IconArrowDown16,
    Divider,
} from '@dhis2/ui';
import JSZip from 'jszip';
import { DatastoreKeys, DatastoreNamespaces } from '@packages/shared/constants';
import { AppModule, ModuleType, StaticModule, StaticModuleConfig } from '@packages/shared/schemas';
import i18n from "@dhis2/d2-i18n";


interface LogEntry {
    message: string;
    type: 'info' | 'success' | 'warning' | 'error' | 'info-low';
    timestamp: string;
}

interface DatastoreItem {
    id: string;
    [key: string]: unknown;
}

export function ConfigurationPage() {
    const engine = useDataEngine();
    const [exportLoading, setExportLoading] = useState<boolean>(false);
    const [importLoading, setImportLoading] = useState<boolean>(false);
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [fileInputKey, setFileInputKey] = useState<number>(Date.now());

    const addLog = useCallback((message: string, type: LogEntry['type'] = 'info') => {
        setLogs(prevLogs => [{ message, type, timestamp: new Date().toISOString() }, ...prevLogs.slice(0, 29)]);
    }, []);

    const getKeysInNamespace = useCallback(async (namespace: string): Promise<string[]> => {
        try {
            const { result } = await engine.query({
                result: { resource: `dataStore/${namespace}` }
            });
            return Array.isArray(result) ? result.filter((k): k is string => typeof k === 'string') : [];
        } catch (error) {
            if (error.details?.httpStatusCode === 404) {
                addLog(`Namespace '${namespace}' not found or is empty.`, 'info-low');
                return [];
            }
            addLog(`Error fetching keys for namespace ${namespace}: ${error.message}`, 'error');
            console.error(`Error fetching keys for ${namespace}:`, error);
            throw error;
        }
    }, [engine, addLog]);

    const getValue = useCallback(async <T,>(namespace: string, key: string): Promise<T | undefined> => {
        try {
            const { result } = await engine.query({
                result: { resource: `dataStore/${namespace}/${key}` }
            });
            return result === null ? undefined : (result as T);
        } catch (error) {
            if (error.details?.httpStatusCode === 404) {
                return undefined;
            }
            addLog(`Error fetching value for ${namespace}/${key}: ${error.message}`, 'error');
            console.error(`Error fetching value for ${namespace}/${key}:`, error);
            throw error;
        }
    }, [engine, addLog]);

    const setValue = useCallback(async (namespace: string, key: string, data: any): Promise<void> => {
        try {
            const mutation: any = {
                resource: `dataStore/${namespace}/${key}`,
                type: 'update' as const,
                data: data,
            };
            await engine.mutate(mutation);
        } catch (error) {
            addLog(`Error setting value for ${namespace}/${key}: ${error.message}`, 'error');
            console.error(`Error setting value for ${namespace}/${key}:`, error);
            throw error;
        }
    }, [engine, addLog]);

    const deleteKeyInDatastore = useCallback(async (namespace: string, key: string): Promise<void> => {
        try {
            const mutation: any = {
                resource: `dataStore/${namespace}/${key}`,
                type: 'delete' as const,
            };
            await engine.mutate(mutation);
        } catch (error) {
            if (error.details?.httpStatusCode === 404) {
                addLog(`Key '${key}' not found during delete in namespace '${namespace}'. No action taken.`, 'warning');
                return;
            }
            addLog(`Error deleting key ${namespace}/${key}: ${error.message}`, 'error');
            console.error(`Error deleting key ${namespace}/${key}:`, error);
            throw error;
        }
    }, [engine, addLog]);

    const clearNamespace = useCallback(async (namespace: string): Promise<void> => {
        addLog(`Attempting to clear namespace: ${namespace}`, 'info');
        const keys = await getKeysInNamespace(namespace);
        if (!keys || keys.length === 0) {
            addLog(`Namespace ${namespace} is already empty or does not exist.`, 'info');
            return;
        }
        addLog(`Found ${keys.length} keys in ${namespace} to delete.`, 'info');
        for (const key of keys) {
            await deleteKeyInDatastore(namespace, key);
        }
        addLog(`Namespace ${namespace} cleared successfully.`, 'success');
    }, [addLog, getKeysInNamespace, deleteKeyInDatastore]);

    const handleExport = useCallback(async () => {
        setExportLoading(true);
        addLog('Export process started...', 'info');
        const zip = new JSZip();
        const exportedStaticNamespaces = new Set<string>();

        try {
            for (const namespace of Object.values(DatastoreNamespaces)) {
                addLog(`Processing namespace for export: ${namespace}`, 'info');

                if (namespace === DatastoreNamespaces.MAIN_CONFIG) {
                    const namespaceDataObject = {};
                    for (const key of Object.values(DatastoreKeys)) {
                        const value = await getValue(namespace, key);
                        if (value !== undefined) {
                            (namespaceDataObject)[key] = value;
                        } else {
                            addLog(`Key '${key}' in '${namespace}' is undefined, will not be included in export.`, 'info-low');
                        }
                    }
                    zip.file(`${namespace}.json`, JSON.stringify(namespaceDataObject, null, 2));
                    addLog(`Added ${namespace}.json to ZIP (object format with ${Object.keys(namespaceDataObject).length} keys).`, 'info-low');
                } else {
                    const namespaceDataArray: DatastoreItem[] = [];
                    const keys = await getKeysInNamespace(namespace);
                    for (const key of keys) {
                        const item = (namespace === DatastoreNamespaces.MODULES)
                            ? await getValue<AppModule>(namespace, key)
                            : await getValue<DatastoreItem>(namespace, key);

                        if (item) {
                            namespaceDataArray.push(item);
                            if (namespace === DatastoreNamespaces.MODULES && item.type === ModuleType.STATIC && (item.config as StaticModuleConfig)?.namespace) {
                                const staticNamespace = (item.config as StaticModuleConfig)!.namespace;
                                if (!exportedStaticNamespaces.has(staticNamespace)) {
                                    addLog(`Found STATIC module, exporting its namespace: ${staticNamespace}`, 'info');
                                    const staticKeys = await getKeysInNamespace(staticNamespace);
                                    const staticNamespaceDataArray: StaticModule[] = [];
                                    for (const sKey of staticKeys) {
                                        const staticItem = await getValue<StaticModule>(staticNamespace, sKey);
                                        if (staticItem) staticNamespaceDataArray.push(staticItem);
                                    }
                                    zip.file(`${staticNamespace}.json`, JSON.stringify(staticNamespaceDataArray, null, 2));
                                    exportedStaticNamespaces.add(staticNamespace);
                                    addLog(`Added ${staticNamespace}.json to ZIP with ${staticNamespaceDataArray.length} items.`, 'info-low');
                                }
                            }
                        }
                    }
                    zip.file(`${namespace}.json`, JSON.stringify(namespaceDataArray, null, 2));
                    addLog(`Added ${namespace}.json to ZIP (array format with ${namespaceDataArray.length} items).`, 'info-low');
                }
            }
            const zipContent = await zip.generateAsync({ type: "blob" });
            const downloadLink = document.createElement('a');
            downloadLink.href = URL.createObjectURL(zipContent);
            const timestamp = new Date().toISOString().split('T')[0];
            downloadLink.download = `datastore_export_${timestamp}.zip`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            URL.revokeObjectURL(downloadLink.href);
            addLog('Export completed successfully. ZIP file downloaded.', 'success');
        } catch (error) {
            addLog(`Export failed: ${error.message}`, 'error');
            console.error("Export error:", error);
        } finally {
            setExportLoading(false);
        }
    }, [addLog, getValue, getKeysInNamespace]);

    const handleImport = useCallback(async () => {
        if (!selectedFile) {
            addLog('No file selected for import.', 'warning');
            return;
        }
        setImportLoading(true);
        addLog(`Import process started for ${selectedFile.name}...`, 'info');
        const zip = new JSZip();
        try {
            const loadedZip = await zip.loadAsync(selectedFile);
            for (const filename in loadedZip.files) {
                if (filename.endsWith(".json") && !loadedZip.files[filename].dir) {
                    const fileObject = loadedZip.files[filename];
                    const namespace = filename.replace(".json", "");
                    addLog(`Processing file: ${filename} for namespace: ${namespace}`, 'info');

                    const jsonDataString = await fileObject.async("string");
                    const jsonData = JSON.parse(jsonDataString);

                    if (namespace !== DatastoreNamespaces.MAIN_CONFIG) {
                        await clearNamespace(namespace);
                    }

                    if (namespace === DatastoreNamespaces.MAIN_CONFIG) {
                        if (typeof jsonData === 'object' && !Array.isArray(jsonData) && jsonData !== null) {
                            const mainConfigData = jsonData;
                            for (const key in mainConfigData) {
                                if (Object.values(DatastoreKeys).includes(key as DatastoreKeys)) {
                                    await setValue(namespace, key, (mainConfigData)[key]);
                                    addLog(`Imported key '${key}' into ${namespace}.`, 'info-low');
                                } else {
                                    addLog(`Skipping unknown key '${key}' during import into ${namespace}.`, 'warning');
                                }
                            }
                        } else {
                            addLog(`Invalid data format for ${DatastoreNamespaces.MAIN_CONFIG}.json. Expected a JSON object. Skipping.`, 'error');
                        }
                    } else {
                        if (Array.isArray(jsonData)) {
                            const items = jsonData;
                            for (const item of items) {
                                if (item && typeof item.id === 'string' && item.id.length > 0) {
                                    await setValue(namespace, item.id, item);
                                    addLog(`Imported item '${item.id}' into ${namespace}.`, 'info-low');
                                } else {
                                    addLog(`Skipping item without a valid ID in ${filename}: ${JSON.stringify(item).substring(0, 100)}...`, 'warning');
                                }
                            }
                        } else {
                            addLog(`Expected array data in ${filename}, but found ${typeof jsonData}. Skipping import for this file.`, 'error');
                        }
                    }
                }
            }
            addLog('Import completed successfully.', 'success');
            setSelectedFile(null);
            setFileInputKey(Date.now());

        } catch (error) {
            addLog(`Import failed: ${error.message}`, 'error');
            console.error("Import error:", error);
        } finally {
            setImportLoading(false);
        }
    }, [selectedFile, addLog, setValue, clearNamespace]);

    const handleFileChange = ({ files }: { files: FileList | null }) => {
        if (files && files.length > 0) {
            const file = files[0];
            if (file.type === 'application/zip' || file.name.toLowerCase().endsWith('.zip')) {
                setSelectedFile(file);
                addLog(`File selected: ${file.name}`, 'info');
            } else {
                setSelectedFile(null);
                addLog(`Invalid file type: ${file.name}. Only ZIP files are allowed.`, 'error');
                setFileInputKey(Date.now());
            }
        } else {
            setSelectedFile(null);
        }
    };

    return (
        <div>
                 <div className="p-4">
                    <h2 className="text-xl font-medium mb-4">
                        {i18n.t("Configuration Management")}
                    </h2>

                    <div className="mb-6">
                        <h3 className="text-base mb-2">{i18n.t("Export Configuration")}</h3>
                        <Button
                            secondary
                            onClick={handleExport}
                            loading={exportLoading}
                            disabled={exportLoading}
                            icon={<IconArrowDown16 />}
                        >
                            {i18n.t("Export configurations to ZIP")}
                        </Button>
                    </div>

                    <Divider className="my-6" />

                    <div className="mb-6">
                        <h3 className="text-base mb-2">{i18n.t("Import Configuration")}</h3>
                        <FileInputField
                            key={fileInputKey}
                            label="Select ZIP file"
                            onChange={handleFileChange}
                            accept=".zip,application/zip"
                            placeholder={selectedFile?.name || "No file uploaded yet"}
                            name="importFile"
                            helpText="Upload a ZIP file containing Datastore JSON configurations."
                            buttonLabel="Choose a file"
                            className='mb-2'
                        />
                        {selectedFile && <NoticeBox title="Selected file" className="my-2">{selectedFile.name}</NoticeBox>}
                        <Button
                            secondary
                            onClick={handleImport}
                            loading={importLoading}
                            disabled={importLoading || !selectedFile}
                            icon={<IconArrowUp16 />}
                         >
                            {i18n.t("Import configurations from ZIP")}
                            
                        </Button>
                    </div>

                    <Divider className="my-6" />

                    <div>
                        <h3 className="text-base mb-2">{i18n.t("Logs")}</h3>
                        <div className="max-h-[300px] overflow-y-auto border border-gray-300 p-2 rounded bg-gray-50">
                            {logs.length === 0 && <p className="text-gray-600 italic">{i18n.t("No logs yet. Perform an action to see logs here.")}</p>}
                            {logs.map((log, index) => (
                                <NoticeBox
                                    key={log.timestamp + index.toString()}
                                    error={log.type === 'error'}
                                    warning={log.type === 'warning'}
                                    title={log.type === 'info-low' ? 'Detail' : (log.type.charAt(0).toUpperCase() + log.type.slice(1))}
                                    className={index > 0 ? "mt-2" : ""}
                                >
                                    {`[${new Date(log.timestamp).toLocaleTimeString()}] ${log.message}`}
                                </NoticeBox>
                            ))}
                        </div>
                    </div>
                </div>
             
        </div>
    );
};

