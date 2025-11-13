import React, { useEffect, useState } from "react";
import {
    CircularLoader,
    Button,
    Modal,
    ModalTitle,
    ModalContent,
    ModalActions,
    ButtonStrip,
    Tag,
    IconError24,
    IconSync16,
    DataTable,
    DataTableHead,
    DataTableBody,
    DataTableRow,
    DataTableColumnHeader,
    DataTableCell,
    Pagination
} from "@dhis2/ui";
import i18n from "@dhis2/d2-i18n";
import { useFailedQueueDetails } from "../hooks/failed-queue";


// Helper function to map queue names to process types
function getProcessTypeFromQueue(queueName: string): string {
    const normalizedQueue = queueName.toLowerCase();

    if (normalizedQueue.includes('metadata-download')) return 'Metadata Download';
    if (normalizedQueue.includes('metadata-upload')) return 'Metadata Upload';
    if (normalizedQueue.includes('data-download')) return 'Data Download';
    if (normalizedQueue.includes('data-upload')) return 'Data Upload';
    if (normalizedQueue.includes('data-deletion')) return 'Data Delete';

    return 'Unknown Process';
}

// Helper function to map process types to queue patterns
function getQueuePatternFromProcessType(processType: string): string {
    const normalizedType = processType.toLowerCase();

    if (normalizedType.includes('metadata') && normalizedType.includes('download')) return 'metadata-download';
    if (normalizedType.includes('metadata') && normalizedType.includes('upload')) return 'metadata-upload';
    if (normalizedType.includes('data') && normalizedType.includes('download')) return 'data-download';
    if (normalizedType.includes('data') && normalizedType.includes('upload')) return 'data-upload';
    if (normalizedType.includes('data') && normalizedType.includes('delete')) return 'data-deletion';

    return '';
}

// Helper function to filter messages by process type
function filterMessagesByProcessType(messages: any[], processType?: string): any[] {
    if (!processType || !messages) return messages;

    const queuePattern = getQueuePatternFromProcessType(processType);
    if (!queuePattern) return messages;

    return messages.filter(message =>
        message.sourceQueue && message.sourceQueue.toLowerCase().includes(queuePattern)
    );
}

interface FailedQueueModalProps {
    configId: string;
    isOpen: boolean;
    onClose: () => void;
    processType?: string;
}

export function FailedQueueModal({
    configId,
    isOpen,
    onClose,
    processType
}: FailedQueueModalProps) {
    const [selectedMessage, setSelectedMessage] = useState<any>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(50);

    useEffect(() => {
        if (isOpen) {
            setCurrentPage(1);
            setSelectedMessage(null);
        }
    }, [isOpen, processType]);

    const offset = (currentPage - 1) * pageSize;

    const {
        failedMessages,
        isLoading,
        clearFailedQueue,
        isError,
        error,
        retryByProcessType,
        isRetryingByType,
        retrySingleMessage,
        isRetryingSingle
    } = useFailedQueueDetails(configId, {
        includeMessages: true,
        limit: pageSize,
        offset: offset
    });

    const filteredMessages = failedMessages?.messages ?
        filterMessagesByProcessType(failedMessages.messages, processType) :
        [];

    const handleClearQueue = async () => {
        await clearFailedQueue();
    };

    const handleRetryByProcessType = async () => {
        if (processType) {
            const processTypeMapping: Record<string, 'data-upload' | 'metadata-upload' | 'data-download' | 'metadata-download'> = {
                'Data Upload': 'data-upload',
                'Metadata Upload': 'metadata-upload',
                'Data Download': 'data-download',
                'Metadata Download': 'metadata-download',
            };

            const mappedProcessType = processTypeMapping[processType];
            if (mappedProcessType) {
                await retryByProcessType(mappedProcessType);
            }
        }
    };

    const handleRetrySingle = async (messageId: string) => {
        console.log("Retrying single message:", messageId);
        await retrySingleMessage(messageId);
    };

    return (
        <Modal large hide={!isOpen} onClose={onClose}>
            <ModalTitle>
                <div className="flex items-center gap-2">
                    {processType ?
                        i18n.t('Failed {{processType}} Details', { processType }) :
                        i18n.t('Failed Processes Details')
                    }
                </div>
            </ModalTitle>
            <ModalContent>
                {isLoading ? (
                    <div className="flex justify-center p-8">
                        <CircularLoader />
                    </div>
                ) : isError ? (
                    <div className="p-6 bg-red-50 rounded-lg border border-red-200">
                        <h3 className="m-0 mb-3 text-red-700">
                            {i18n.t('Error Loading Failed Messages')}
                        </h3>
                        <p className="m-0 text-red-600">
                            {(error as any)?.message || i18n.t('An unexpected error occurred')}
                        </p>
                        <details className="mt-3">
                            <summary className="cursor-pointer text-red-600">
                                {i18n.t('Debug Info')}
                            </summary>
                            <pre className="text-xs bg-gray-100 p-2 rounded mt-2 overflow-auto">
                                {JSON.stringify({ configId, error }, null, 2)}
                            </pre>
                        </details>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">

                        {filteredMessages.length > 0 ? (
                            <div className="flex flex-col w-full">
                                <div className="overflow-x-auto">
                                    <DataTable>
                                        <DataTableHead>
                                            <DataTableRow>
                                                <DataTableColumnHeader>{i18n.t('Error Message')}</DataTableColumnHeader>
                                                <DataTableColumnHeader>{i18n.t('Process Type')}</DataTableColumnHeader>
                                                <DataTableColumnHeader>{i18n.t('Failed Endpoint')}</DataTableColumnHeader>
                                                <DataTableColumnHeader>{i18n.t('Failed At')}</DataTableColumnHeader>
                                                <DataTableColumnHeader>{i18n.t('Actions')}</DataTableColumnHeader>
                                                <DataTableColumnHeader>{i18n.t('Details')}</DataTableColumnHeader>
                                            </DataTableRow>
                                        </DataTableHead>
                                        <DataTableBody>
                                            {filteredMessages.map((msg, index) => {
                                                const errorMessage = msg.headers?.['x-error-message'] || 'Unknown error';
                                                const httpStatus = msg.headers?.['x-axios-status'];
                                                const endpoint = msg.headers?.['x-axios-url'];
                                                const failureReason = msg.headers?.['x-failure-reason'];
                                                const isExpanded = selectedMessage?.messageId === msg.messageId;

                                                return (
                                                    <React.Fragment key={index}>
                                                        <DataTableRow>
                                                            <DataTableCell>
                                                                <div className="max-w-[300px] flex items-center gap-2">
                                                                    <div className="overflow-hidden text-ellipsis whitespace-nowrap" title={errorMessage}>
                                                                        {errorMessage}
                                                                    </div>
                                                                </div>
                                                            </DataTableCell>
                                                            <DataTableCell>
                                                                <Tag>{getProcessTypeFromQueue(msg.sourceQueue)}</Tag>
                                                            </DataTableCell>
                                                            <DataTableCell>
                                                                <div className="max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap font-mono text-xs" title={endpoint}>
                                                                    {endpoint || '—'}
                                                                </div>
                                                            </DataTableCell>
                                                            <DataTableCell>
                                                                <div className="text-xs">
                                                                    {new Date(msg.deathTimestamp).toLocaleString()}
                                                                </div>
                                                            </DataTableCell>
                                                            <DataTableCell>
                                                                <ButtonStrip>
                                                                    <Button
                                                                        small
                                                                        secondary
                                                                        loading={isRetryingSingle}
                                                                        disabled={isRetryingSingle || isLoading}
                                                                        onClick={() => handleRetrySingle(msg.messageId)}
                                                                        icon={<IconSync16 />}
                                                                    >
                                                                        {i18n.t('Retry')}
                                                                    </Button>
                                                                </ButtonStrip>
                                                            </DataTableCell>
                                                            <DataTableCell>
                                                                <Button
                                                                    small
                                                                    secondary
                                                                    onClick={() => setSelectedMessage(selectedMessage?.messageId === msg.messageId ? null : msg)}
                                                                >
                                                                    {isExpanded ? 'Hide' : 'Show'}
                                                                </Button>
                                                            </DataTableCell>
                                                        </DataTableRow>

                                                        {/* Detailed Error Info - Shows immediately below the row */}
                                                        {isExpanded && (
                                                            <DataTableRow>
                                                                <DataTableCell colSpan="7" className="p-0 border-none">
                                                                    <div className="mx-4 mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                                                        <h4 className="m-0 mb-4 flex items-center gap-2">
                                                                            <IconError24 color="var(--colors-red500)" />
                                                                            {i18n.t('Detailed Error Information')}
                                                                        </h4>

                                                                        <div className="grid gap-4 grid-cols-2">
                                                                            {/* Left Column */}
                                                                            <div>
                                                                                {/* Full Error Message */}
                                                                                <div style={{ marginBottom: '16px' }}>
                                                                                    <strong style={{ color: 'var(--colors-red700)' }}>Error Message:</strong>
                                                                                    <div style={{
                                                                                        marginTop: '4px',
                                                                                        padding: '8px 12px',
                                                                                        background: 'var(--colors-red050)',
                                                                                        borderRadius: '4px',
                                                                                        fontSize: '14px',
                                                                                        border: '1px solid var(--colors-red200)'
                                                                                    }}>
                                                                                        {selectedMessage.headers?.['x-error-message'] || 'Unknown error'}
                                                                                    </div>
                                                                                </div>


                                                                            </div>

                                                                            {/* Right Column */}
                                                                            <div>

                                                                                {/* HTTP Details */}
                                                                                {selectedMessage.headers?.['x-axios-url'] && (
                                                                                    <div style={{ marginBottom: '16px' }}>
                                                                                        <strong>Failed Endpoint:</strong>
                                                                                        <code style={{
                                                                                            display: 'block',
                                                                                            marginTop: '4px',
                                                                                            padding: '8px 12px',
                                                                                            background: 'var(--colors-grey100)',
                                                                                            borderRadius: '4px',
                                                                                            fontSize: '12px',
                                                                                            wordBreak: 'break-all'
                                                                                        }}>
                                                                                            {selectedMessage.headers['x-axios-url']}
                                                                                        </code>
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        </div>

                                                                        {/* DHIS2 Error Response - Full Width */}
                                                                        {selectedMessage.headers?.['x-failure-reason'] && (
                                                                            <div style={{ marginTop: '16px' }}>
                                                                                <strong>DHIS2 Server Response:</strong>
                                                                                <details style={{ marginTop: '8px' }}>
                                                                                    <summary style={{
                                                                                        cursor: 'pointer',
                                                                                        padding: '8px',
                                                                                        background: 'var(--colors-grey100)',
                                                                                        borderRadius: '4px',
                                                                                        border: '1px solid var(--colors-grey300)'
                                                                                    }}>
                                                                                        Click to show full server response
                                                                                    </summary>
                                                                                    <pre style={{
                                                                                        fontSize: '11px',
                                                                                        background: 'var(--colors-grey100)',
                                                                                        padding: '12px',
                                                                                        borderRadius: '4px',
                                                                                        overflow: 'auto',
                                                                                        maxHeight: '300px',
                                                                                        marginTop: '8px',
                                                                                        border: '1px solid var(--colors-grey300)'
                                                                                    }}>
                                                                                        {typeof selectedMessage.headers['x-failure-reason'] === 'string' ?
                                                                                            JSON.stringify(JSON.parse(selectedMessage.headers['x-failure-reason']), null, 2) :
                                                                                            JSON.stringify(selectedMessage.headers['x-failure-reason'], null, 2)
                                                                                        }
                                                                                    </pre>
                                                                                </details>
                                                                            </div>
                                                                        )}

                                                                        {/* Original Payload - Full Width */}
                                                                        {selectedMessage.payload && (
                                                                            <div style={{ marginTop: '16px' }}>
                                                                                <strong>Original Payload:</strong>
                                                                                <details style={{ marginTop: '8px' }}>
                                                                                    <summary style={{
                                                                                        cursor: 'pointer',
                                                                                        padding: '8px',
                                                                                        background: 'var(--colors-grey100)',
                                                                                        borderRadius: '4px',
                                                                                        border: '1px solid var(--colors-grey300)'
                                                                                    }}>
                                                                                        Click to show original data that failed to process
                                                                                    </summary>
                                                                                    <pre style={{
                                                                                        fontSize: '11px',
                                                                                        background: 'var(--colors-grey100)',
                                                                                        padding: '12px',
                                                                                        borderRadius: '4px',
                                                                                        overflow: 'auto',
                                                                                        maxHeight: '250px',
                                                                                        marginTop: '8px',
                                                                                        border: '1px solid var(--colors-grey300)'
                                                                                    }}>
                                                                                        {JSON.stringify(selectedMessage.payload, null, 2)}
                                                                                    </pre>
                                                                                </details>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </DataTableCell>
                                                            </DataTableRow>
                                                        )}
                                                    </React.Fragment>
                                                );
                                            })}
                                        </DataTableBody>
                                    </DataTable>
                                </div>
                                {/* Pagination Controls */}
                                {failedMessages?.pagination && (
                                    <div className="border-t border-gray-200">
                                        <div className="flex items-center justify-between py-3">

                                            <Pagination
                                                page={currentPage}
                                                pageCount={failedMessages.pagination.totalPages}
                                                total={failedMessages.totalFailedMessages}
                                                pageSize={pageSize}
                                                onPageChange={setCurrentPage}
                                                onPageSizeChange={(newPageSize) => {
                                                    setPageSize(newPageSize);
                                                    setCurrentPage(1);
                                                }}
                                                disabled={isLoading}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div style={{
                                textAlign: 'center',
                                padding: '32px',
                                color: 'var(--colors-grey600)',
                                background: 'var(--colors-grey050)',
                                borderRadius: '8px'
                            }}>
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


                    {filteredMessages.length > 0 && (
                        <>
                            <ButtonStrip>
                                {processType && (
                                    <Button
                                        secondary
                                        onClick={handleRetryByProcessType}
                                        loading={isRetryingByType}
                                        disabled={isRetryingByType || isLoading}
                                    >
                                        {isRetryingByType ? i18n.t('Retrying...') : i18n.t('Retry All')}
                                    </Button>
                                )}
                                <Button
                                    destructive
                                    secondary
                                    onClick={handleClearQueue}
                                >
                                    {i18n.t('Clear All')}
                                </Button>
                            </ButtonStrip>
                        </>
                    )}

                    <Button onClick={onClose}>{i18n.t('Close')}</Button>
                </ButtonStrip>
            </ModalActions>
        </Modal>
    );
}