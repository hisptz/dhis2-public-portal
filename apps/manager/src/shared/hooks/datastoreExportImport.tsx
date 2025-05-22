import React, { useState, useCallback, ChangeEvent } from 'react';
import { useDataEngine,  } from '@dhis2/app-runtime';
import {
    Button,
    FileInputField,
    NoticeBox,
    CircularLoader,
    Card,
    IconArrowUp16,
    IconArrowDown16,
    Divider,
} from '@dhis2/ui';
import JSZip from 'jszip';

// --- Enums / Const Objects for Keys and Namespaces ---
const DatastoreNamespaces = {
    MODULES: "hisptz-public-portal-modules",
    MAIN_CONFIG: "hisptz-public-portal",
    DATA_SERVICE_CONFIG: "hisptz-public-data-service-config",
} as const;

type DatastoreNamespaceValue = typeof DatastoreNamespaces[keyof typeof DatastoreNamespaces];

const DatastoreKeys = {
    APPEARANCE: "appearance",
    METADATA: "metadata",
    MENU: "menu",
} as const;

type DatastoreKeyValue = typeof DatastoreKeys[keyof typeof DatastoreKeys];


// --- Type Definitions ---
interface LogEntry {
    message: string;
    type: 'info' | 'success' | 'warning' | 'error' | 'info-low';
    timestamp: string; // ISO string
}

interface DatastoreItem {
    id: string;
    [key: string]: any; // Base item, can be extended
}

interface StaticModuleConfig {
    namespace: string;
}

interface ModuleItem extends DatastoreItem {
    type: string;
    label?: string;
    config?: StaticModuleConfig | Record<string, any>; // Config can vary
}

// Specific types for MAIN_CONFIG data (examples, adjust as needed)
interface AppearanceConfig extends Record<string, any> {
    theme?: string;
 }

interface MetadataConfig extends Record<string, any> {
    siteTitle?: string;
 }

interface MenuItem extends DatastoreItem {  
    label: string;
    path: string;
    order?: number;
}

interface MainConfigData {
    [DatastoreKeys.APPEARANCE]?: AppearanceConfig;
    [DatastoreKeys.METADATA]?: MetadataConfig;
    [DatastoreKeys.MENU]?: MenuItem[];
}

// For engine.query responses
interface QueryResponse<T> {
    result: T;
}


const DatastoreManagerPage: React.FC = () => {
    const engine = useDataEngine();
    const [loading, setLoading] = useState<boolean>(false);
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [fileInputKey, setFileInputKey] = useState<number>(Date.now());

    const addLog = useCallback((message: string, type: LogEntry['type'] = 'info') => {
        setLogs(prevLogs => [{ message, type, timestamp: new Date().toISOString() }, ...prevLogs.slice(0, 29)]);
    }, []);

    // --- Datastore Helper Functions ---
    const getKeysInNamespace = async (namespace: string): Promise<string[]> => {
        try {
            const { result } = await engine.query<QueryResponse<string[]>>({
                result: { resource: `dataStore/${namespace}` }
            });
            return result || [];
        } catch (error: any) {
            if (error.details?.httpStatusCode === 404) {
                addLog(`Namespace '${namespace}' not found or is empty.`, 'warning');
                return [];
            }
            addLog(`Error fetching keys for namespace ${namespace}: ${error.message}`, 'error');
            console.error(`Error fetching keys for ${namespace}:`, error);
            throw error;
        }
    };

    const getValue = async <T extends any>(namespace: string, key: string): Promise<T | undefined> => {
        try {
            const { result } = await engine.query<QueryResponse<T>>({
                result: { resource: `dataStore/${namespace}/${key}` }
            });
            return result;
        } catch (error: any) {
            if (error.details?.httpStatusCode === 404) {
                // This log might be too verbose if `undefined` is an expected outcome
                // addLog(`Key '${key}' not found in namespace '${namespace}'.`, 'info-low');
                return undefined;
            }
            addLog(`Error fetching value for ${namespace}/${key}: ${error.message}`, 'error');
            console.error(`Error fetching value for ${namespace}/${key}:`, error);
            throw error;
        }
    };

    const setValue = async (namespace: string, key: string, data: any): Promise<void> => {
        try {
            const mutation:any = {
                resource: `dataStore/${namespace}/${key}`,
                type: 'update' as const, // Ensures type is 'update'
                data: data,
            };
            await engine.mutate(mutation);
        } catch (error: any) {
            addLog(`Error setting value for ${namespace}/${key}: ${error.message}`, 'error');
            console.error(`Error setting value for ${namespace}/${key}:`, error);
            throw error;
        }
    };

    const deleteKeyInDS = async (namespace: string, key: string): Promise<void> => {
        try {
            const mutation:any = {
                resource: `dataStore/${namespace}/${key}`,
                type: 'delete' as const,
            };
            await engine.mutate(mutation);
        } catch (error: any) {
             if (error.details?.httpStatusCode === 404) {
                addLog(`Key '${key}' not found during delete in namespace '${namespace}'. No action taken.`, 'warning');
                return;
            }
            addLog(`Error deleting key ${namespace}/${key}: ${error.message}`, 'error');
            console.error(`Error deleting key ${namespace}/${key}:`, error);
            throw error;
        }
    };

    const clearNamespace = async (namespace: string): Promise<void> => {
        addLog(`Attempting to clear namespace: ${namespace}`, 'info');
        const keys = await getKeysInNamespace(namespace);
        if (!keys || keys.length === 0) {
            addLog(`Namespace ${namespace} is already empty or does not exist.`, 'info');
            return;
        }
        addLog(`Found ${keys.length} keys in ${namespace} to delete.`, 'info');
        for (const key of keys) {
            await deleteKeyInDS(namespace, key);
        }
        addLog(`Namespace ${namespace} cleared successfully.`, 'success');
    };

    // --- Export Logic ---
    const handleExport = useCallback(async () => {
        setLoading(true);
        addLog('Export process started...', 'info');
        const zip = new JSZip();
        const exportedStaticNamespaces = new Set<string>();

        try {
            for (const namespace of Object.values(DatastoreNamespaces)) {
                addLog(`Processing namespace for export: ${namespace}`, 'info');

                if (namespace === DatastoreNamespaces.MAIN_CONFIG) {
                    const namespaceDataObject: Partial<MainConfigData> = {};
                    for (const key of Object.values(DatastoreKeys)) {
                        // Dynamically type the expected value based on the key
                        let value: any;
                        if (key === DatastoreKeys.APPEARANCE) value = await getValue<AppearanceConfig>(namespace, key);
                        else if (key === DatastoreKeys.METADATA) value = await getValue<MetadataConfig>(namespace, key);
                        else if (key === DatastoreKeys.MENU) value = await getValue<MenuItem[]>(namespace, key);
                        
                        if (value !== undefined) {
                            (namespaceDataObject as any)[key] = value;
                        } else {
                            addLog(`Key '${key}' in '${namespace}' is undefined, will not be included in export.`, 'info-low');
                        }
                    }
                    zip.file(`${namespace}.json`, JSON.stringify(namespaceDataObject, null, 2));
                    addLog(`Added ${namespace}.json to ZIP (object format with ${Object.keys(namespaceDataObject).length} keys).`, 'info-low');
                } else { // MODULES, DATA_SERVICE_CONFIG
                    let namespaceDataArray: DatastoreItem[] = []; // Use base type or more specific if possible
                    const keys = await getKeysInNamespace(namespace);
                    for (const key of keys) {
                        // For MODULES, we expect ModuleItem, for others, DatastoreItem or a more specific type
                        const item = (namespace === DatastoreNamespaces.MODULES)
                            ? await getValue<ModuleItem>(namespace, key)
                            : await getValue<DatastoreItem>(namespace, key);

                        if (item) {
                            namespaceDataArray.push(item);
                            // Special case for STATIC modules in MODULES namespace
                            if (namespace === DatastoreNamespaces.MODULES && (item as ModuleItem).type === "STATIC" && (item as ModuleItem).config?.namespace) {
                                const staticNs = (item as ModuleItem).config!.namespace; // Assert namespace exists
                                if (!exportedStaticNamespaces.has(staticNs)) {
                                    addLog(`Found STATIC module, exporting its namespace: ${staticNs}`, 'info');
                                    const staticKeys = await getKeysInNamespace(staticNs);
                                    let staticNamespaceDataArray: DatastoreItem[] = [];
                                    for (const sKey of staticKeys) {
                                        const staticItem = await getValue<DatastoreItem>(staticNs, sKey);
                                        if (staticItem) staticNamespaceDataArray.push(staticItem);
                                    }
                                    zip.file(`${staticNs}.json`, JSON.stringify(staticNamespaceDataArray, null, 2));
                                    exportedStaticNamespaces.add(staticNs);
                                    addLog(`Added ${staticNs}.json to ZIP with ${staticNamespaceDataArray.length} items.`, 'info-low');
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

        } catch (error: any) {
            addLog(`Export failed: ${error.message}`, 'error');
            console.error("Export error:", error);
        } finally {
            setLoading(false);
        }
    }, [engine, addLog]);

    // --- Import Logic ---
    const handleImport = useCallback(async () => {
        if (!selectedFile) {
            addLog('No file selected for import.', 'warning');
            return;
        }
        setLoading(true);
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
                    const jsonData: any = JSON.parse(jsonDataString); // Parse as any, then validate structure

                    // if (namespace !== DatastoreNamespaces.MAIN_CONFIG) {
                    //     await clearNamespace(namespace);
                    // }

                    if (namespace === DatastoreNamespaces.MAIN_CONFIG) {
                        if (typeof jsonData === 'object' && !Array.isArray(jsonData) && jsonData !== null) {
                            const mainConfigData = jsonData as Partial<MainConfigData>;
                            for (const key in mainConfigData) {
                                if (Object.values(DatastoreKeys).includes(key as DatastoreKeyValue)) {
                                    await setValue(namespace, key, (mainConfigData as any)[key]);
                                    addLog(`Imported key '${key}' into ${namespace}.`, 'info-low');
                                } else {
                                    addLog(`Skipping unknown key '${key}' during import into ${namespace}.`, 'warning');
                                }
                            }
                        } else {
                            addLog(`Invalid data format for ${DatastoreNamespaces.MAIN_CONFIG}.json. Expected a JSON object. Skipping.`, 'error');
                        }
                    } else { // MODULES, DATA_SERVICE_CONFIG, and dynamic STATIC module namespaces
                        if (Array.isArray(jsonData)) {
                            const items = jsonData as DatastoreItem[]; // Assume array of DatastoreItem
                            for (const item of items) {
                                if (item && typeof item.id === 'string' && item.id.length > 0) {
                                    await setValue(namespace, item.id, item);
                                    addLog(`Imported item '${item.id}' into ${namespace}.`, 'info-low');
                                } else {
                                    addLog(`Skipping item without a valid ID in ${filename}: ${JSON.stringify(item).substring(0,100)}...`, 'warning');
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

        } catch (error: any) {
            addLog(`Import failed: ${error.message}`, 'error');
            console.error("Import error:", error);
        } finally {
            setLoading(false);
        }
    }, [engine, addLog, selectedFile]);

    const handleFileChange = ({ files }: { files: FileList | null }) => {
        if (files && files.length > 0) {
            setSelectedFile(files[0]);
            addLog(`File selected: ${files[0].name}`, 'info');
        } else {
            setSelectedFile(null);
        }
    };

    return (
        <div style={{ margin: '16px' }}>
            <Card>
                <div style={{ padding: '16px' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: '500', marginBottom: '16px' }}>
                        Datastore Management  
                    </h2>
                    
                    <div style={{ marginBottom: '24px' }}>
                        <h3 style={{ fontSize: '16px', marginBottom: '8px' }}>Export Data</h3>
                        <Button
                            primary
                            onClick={handleExport}
                            loading={loading}
                            disabled={loading}
                            icon={<IconArrowDown16 />}
                        >
                            Export All Data to ZIP
                        </Button>
                    </div>

                    <Divider margin="24px 0" />

                    <div style={{ marginBottom: '24px' }}>
                        <h3 style={{ fontSize: '16px', marginBottom: '8px' }}>Import Data</h3>
                        <FileInputField
                            key={fileInputKey}
                            label="Select ZIP file"
                            onChange={handleFileChange}
                            disabled={loading}
                            name="importFile"
                            helpText="Upload a ZIP file containing Datastore JSON configurations."
                            buttonLabel="Choose file"
                        />
                        {selectedFile && <NoticeBox slim title="Selected file" className="margin-top-small">{selectedFile.name}</NoticeBox>}
                        <Button
                            primary
                            onClick={handleImport}
                            loading={loading}
                            disabled={loading || !selectedFile}
                            icon={<IconArrowUp16 />}
                            style={{ marginTop: '16px' }}
                        >
                            Import Data from ZIP
                        </Button>
                    </div>
                    
                    {loading && <CircularLoader small />}

                    <Divider margin="24px 0" />
                    
                    <div>
                        <h3 style={{ fontSize: '16px', marginBottom: '8px' }}>Logs</h3>
                        <div className="log-area" style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid var(--colors-grey400)', padding: '8px', borderRadius:'4px', background:'var(--colors-grey100)' }}>
                            {logs.length === 0 && <p style={{color: 'var(--colors-grey700)', fontStyle: 'italic'}}>No logs yet. Perform an action to see logs here.</p>}
                            {logs.map((log, index) => (
                                <NoticeBox
                                    key={log.timestamp + index.toString()} // Ensure key is string
                                    error={log.type === 'error'}
                                    warning={log.type === 'warning'}
                                    success={log.type === 'success'}
                                    title={log.type === 'info-low' ? 'Detail' : (log.type.charAt(0).toUpperCase() + log.type.slice(1))}
                                    slim
                                    className={index > 0 ? "margin-top-small" : ""}
                                >
                                    {`[${new Date(log.timestamp).toLocaleTimeString()}] ${log.message}`}
                                </NoticeBox>
                            ))}
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default DatastoreManagerPage;