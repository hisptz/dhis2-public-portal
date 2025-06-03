import { useBoolean } from 'usehooks-ts';
import {
    Button,
    ButtonStrip,
    FileInputField,
    IconImportItems24,
    Modal,
    ModalActions,
    ModalContent,
    ModalTitle,
} from '@dhis2/ui';
import i18n from '@dhis2/d2-i18n';
import React, { useCallback, useState } from 'react';
import JSZip from 'jszip';
import { DatastoreNamespaces, DatastoreKeys } from '@packages/shared/constants';
import { useConfiguration } from './ConfigurationPage/utils/configurationUtils';
import TemplateCard from './TemplateCard';
import { CreateStatus } from '../hooks/config';

interface ConfigurationProps {
    setImportLoading: React.Dispatch<React.SetStateAction<boolean>>;
    onStatusChange: (statuses: CreateStatus[]) => void;
    onProgressChange: (progress: number) => void;
}

export function ImportConfiguration({ setImportLoading, onStatusChange, onProgressChange }: ConfigurationProps) {
    const { value: hideModal, setTrue: closeModal, setFalse: openModal } = useBoolean(true);
    const { setValue } = useConfiguration();
    const [loading, setLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [fileInputKey, setFileInputKey] = useState(Date.now());

    const handleFileChange = ({ files }: { files: FileList | null }) => {
        if (files && files.length > 0 && files[0].type === 'application/zip') {
            setSelectedFile(files[0]);
        } else {
            setSelectedFile(null);
            setFileInputKey(Date.now());
        }
    };

    const handleImport = useCallback(async () => {
        const statuses: CreateStatus[] = [];

        if (!selectedFile) {
            return statuses.push({
                status: 'error',
                label: 'Import',
                message: i18n.t('No file selected for import'),
            });
        }
        closeModal();
        setLoading(true);
        setImportLoading(true);

        try {
            const zip = new JSZip();
            const loadedZip = await zip.loadAsync(selectedFile);
            const jsonFiles = Object.keys(loadedZip.files).filter(
                (filename) => filename.endsWith('.json') && !loadedZip.files[filename].dir
            );
            const totalFiles = jsonFiles.length;
            let processedFiles = 0;

            if (totalFiles === 0) {
                onProgressChange?.(100);
                return [{ status: 'error', label: 'Import', message: 'No JSON files found in ZIP' }];
            }
            for (const filename in loadedZip.files) {
                if (filename.endsWith('.json') && !loadedZip.files[filename].dir) {
                    const namespace = filename.replace('.json', '');
                    const data = JSON.parse(await loadedZip.files[filename].async('string'));

                    if (namespace === DatastoreNamespaces.MAIN_CONFIG && typeof data === 'object' && !Array.isArray(data)) {
                        for (const key in data) {
                            if (Object.values(DatastoreKeys).includes(key as DatastoreKeys)) {
                                await setValue(namespace, key, data[key]);
                            }
                        }
                        statuses.push({
                            status: 'created',
                            label: `${namespace}`,
                            message: i18n.t(`Successfully imported  ${namespace}`),
                        });
                    } else if (Array.isArray(data)) {
                        for (const item of data) {
                            if (item?.id) {
                                await setValue(namespace, item.id, item);
                            }
                        }
                        statuses.push({
                            status: 'created',
                            label: `${namespace}`,
                            message: i18n.t(`Successfully imported  ${namespace}`),
                        });
                    }
                    processedFiles++;
                    onProgressChange?.((processedFiles / totalFiles) * 100);
                }
            }
            onStatusChange(statuses);
            setSelectedFile(null);
            setFileInputKey(Date.now());
            window.location.reload();

        } catch (error) {
            console.error('Error importing configuration:', error);
            statuses.push({
                status: 'error',
                label: 'Import',
                message: `Failed to import configuration: ${error.message}`,
            });
            onStatusChange(statuses);
        } finally {
            setLoading(false);
            setImportLoading(false);
            onProgressChange(0);
        }
    }, [selectedFile, setImportLoading, onStatusChange, closeModal, onProgressChange, setValue]);

    return (
        <>
            {!hideModal && (
                <Modal position="middle" onClose={closeModal}>
                    <ModalTitle>{i18n.t('Import Configuration')}</ModalTitle>
                    <ModalContent>
                        <FileInputField
                            key={fileInputKey}
                            label={i18n.t('Select ZIP file')}
                            onChange={handleFileChange}
                            accept=".zip,application/zip"
                            placeholder={selectedFile?.name || i18n.t('No file uploaded yet')}
                            name="importFile"
                            helpText={i18n.t('Upload a ZIP file containing Datastore JSON configurations.')}
                            buttonLabel={i18n.t('Choose a file')}
                            className="mb-2"
                        />
                    </ModalContent>
                    <ModalActions>
                        <ButtonStrip>
                            <Button onClick={closeModal} disabled={loading} secondary>
                                {i18n.t('Cancel')}
                            </Button>
                            <Button onClick={handleImport} loading={loading} primary disabled={!selectedFile || loading}>
                                {loading ? i18n.t('Importing...') : i18n.t('Import')}
                            </Button>
                        </ButtonStrip>
                    </ModalActions>
                </Modal>
            )}
            <TemplateCard template={{
                title: "Import Configuration ", icon: <IconImportItems24 />, description: "Upload a ZIP file with custom JSON configurations to personalize your portal.", onClick: () => {
                    openModal();
                }
            }} />
        </>
    );
}