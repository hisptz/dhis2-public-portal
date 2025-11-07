import React from "react";
import {
    CircularLoader,
    Button,
    Modal,
    ModalTitle,
    ModalContent,
    ModalActions,
    ButtonStrip,
    DataTable,
    DataTableHead,
    DataTableBody,
    DataTableRow,
    DataTableCell,
    DataTableColumnHeader,
    Tag,
} from "@dhis2/ui";
import i18n from "@dhis2/d2-i18n";
import { useFailedQueueDetails } from "../hooks/failed-queue";

interface FailedQueueModalProps {
    configId: string;
    isOpen: boolean;
    onClose: () => void;
}

export function FailedQueueModal({ 
    configId, 
    isOpen, 
    onClose 
}: FailedQueueModalProps) {
    const { failedMessages, isLoading, clearFailedQueue, isError, error } = useFailedQueueDetails(configId);

    const handleClearQueue = async () => {
        await clearFailedQueue();
    };

    return (
        <Modal large hide={!isOpen} onClose={onClose}>
            <ModalTitle>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>✗</span>
                    {i18n.t('Failed Processes Details')}
                </div>
            </ModalTitle>
            <ModalContent>
                {isLoading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '32px' }}>
                        <CircularLoader />
                    </div>
                ) : isError ? (
                    <div style={{ 
                        padding: '24px',
                        background: 'var(--colors-red050)',
                        borderRadius: '8px',
                        border: '1px solid var(--colors-red200)'
                    }}>
                        <h3 style={{ margin: '0 0 12px 0', color: 'var(--colors-red700)' }}>
                            {i18n.t('Error Loading Failed Messages')}
                        </h3>
                        <p style={{ margin: '0', color: 'var(--colors-red600)' }}>
                            {(error as any)?.message || i18n.t('An unexpected error occurred')}
                        </p>
                        <details style={{ marginTop: '12px' }}>
                            <summary style={{ cursor: 'pointer', color: 'var(--colors-red600)' }}>
                                {i18n.t('Debug Info')}
                            </summary>
                            <pre style={{ 
                                fontSize: '12px', 
                                background: 'var(--colors-grey100)', 
                                padding: '8px',
                                borderRadius: '4px',
                                marginTop: '8px',
                                overflow: 'auto'
                            }}>
                                {JSON.stringify({ configId, error }, null, 2)}
                            </pre>
                        </details>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            padding: '16px',
                            background: 'var(--colors-red050)',
                            borderRadius: '8px',
                            border: '1px solid var(--colors-red200)'
                        }}>
                            <h3 style={{ margin: 0, color: 'var(--colors-red700)' }}>
                                {i18n.t('Total Failed Messages: {{count}}', { count: failedMessages?.totalFailedMessages || 0 })}
                            </h3>
                            {(failedMessages?.totalFailedMessages || 0) > 0 && (
                                <Button destructive onClick={handleClearQueue}>
                                    {i18n.t('Clear All Failed')}
                                </Button>
                            )}
                        </div>
                        
                        {(failedMessages?.messages && failedMessages.messages.length > 0) ? (
                            <DataTable>
                                <DataTableHead>
                                    <DataTableRow>
                                        <DataTableColumnHeader>{i18n.t('Process Type')}</DataTableColumnHeader>
                                        <DataTableColumnHeader>{i18n.t('Error Message')}</DataTableColumnHeader>
                                        <DataTableColumnHeader>{i18n.t('Retry Count')}</DataTableColumnHeader>
                                        <DataTableColumnHeader>{i18n.t('Failed At')}</DataTableColumnHeader>
                                    </DataTableRow>
                                </DataTableHead>
                                <DataTableBody>
                                    {failedMessages?.messages.map((msg, index) => (
                                        <DataTableRow key={index}>
                                            <DataTableCell>
                                                <Tag negative>{msg.queueType}</Tag>
                                            </DataTableCell>
                                            <DataTableCell>
                                                <div style={{ 
                                                    maxWidth: '300px', 
                                                    overflow: 'hidden', 
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap'
                                                }} title={msg.errorMessage}>
                                                    {msg.errorMessage}
                                                </div>
                                            </DataTableCell>
                                            <DataTableCell>
                                                <span style={{ 
                                                    background: 'var(--colors-yellow100)', 
                                                    padding: '2px 8px', 
                                                    borderRadius: '12px',
                                                    fontSize: '12px',
                                                    fontWeight: '600'
                                                }}>
                                                    {msg.retryCount}
                                                </span>
                                            </DataTableCell>
                                            <DataTableCell>
                                                {new Date(msg.errorTimestamp).toLocaleString()}
                                            </DataTableCell>
                                        </DataTableRow>
                                    ))}
                                </DataTableBody>
                            </DataTable>
                        ) : (
                            <div style={{ 
                                textAlign: 'center', 
                                padding: '32px',
                                color: 'var(--colors-grey600)',
                                background: 'var(--colors-grey050)',
                                borderRadius: '8px'
                            }}>
                                <div style={{ fontSize: '48px', marginBottom: '16px' }}>✓</div>
                                <div style={{ fontSize: '16px', fontWeight: '500' }}>
                                    {i18n.t('No failed messages found')}
                                </div>
                                <div style={{ fontSize: '14px', marginTop: '8px' }}>
                                    {i18n.t('All processes completed successfully!')}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </ModalContent>
            <ModalActions>
                <ButtonStrip>
                    <Button onClick={onClose}>{i18n.t('Close')}</Button>
                </ButtonStrip>
            </ModalActions>
        </Modal>
    );
}