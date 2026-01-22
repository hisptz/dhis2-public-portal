import React, { RefObject, useEffect, useRef, useState } from 'react'
import {
    Button,
    Divider,
    IconDelete16,
    IconEdit16,
    IconImportItems24,
    IconMore24,
    IconTerminalWindow16,
    Menu,
    MenuItem,
    Popover,
} from '@dhis2/ui'
import { DataServiceConfig } from '@packages/shared/schemas'
import { useNavigate } from '@tanstack/react-router'
import i18n from '@dhis2/d2-i18n'
import { useDialog } from '@hisptz/dhis2-ui'
import { useDeleteDataSource } from '../hooks/save'
import { useBoolean } from 'usehooks-ts'
import { RunConfigForm } from './RunConfiguration/components/RunConfigForm/RunConfigForm'
import { RunConfigSummaryModal } from './RunConfiguration/components/RunConfigSummary/components/RunConfigSummaryModal'
import { FailedQueueModal } from './RunConfiguration/components/RunConfigSummary/components/FailedQueueModal'
import { usePollingControl } from '../providers/PollingProvider'

export function ActionsMenu({ config }: { config: DataServiceConfig }) {
    const [isOpen, setIsOpen] = useState(false)
    const buttonRef = useRef<HTMLDivElement>(null)
    const navigate = useNavigate({
        from: '/data-service-configuration/',
    })
    const { confirm } = useDialog()
    const { deleteConfig } = useDeleteDataSource()
    const { pausePolling, resumePolling } = usePollingControl()

    const {
        value: hideRunModal,
        setTrue: onCloseRunModal,
        setFalse: onShowRunModal,
    } = useBoolean(true)

    const {
        value: hideSummaryModal,
        setTrue: onCloseSummaryModal,
        setFalse: onShowSummaryModal,
    } = useBoolean(true)

    const {
        value: hideFailedModal,
        setTrue: onCloseFailedModal,
        setFalse: onShowFailedModal,
    } = useBoolean(true)

    const [selectedProcessType, setSelectedProcessType] = useState<
        string | undefined
    >(undefined)

    const handleEdit = () => {
        setIsOpen(false)
        navigate({
            to: '/data-service-configuration/$configId',
            params: {
                configId: config.id,
            },
        })
    }

    const handleRun = () => {
        setIsOpen(false)
        pausePolling()
        onShowRunModal()
    }

    const handleCloseRunModal = () => {
        resumePolling()
        onCloseRunModal()
    }

    const handleViewOverview = () => {
        setIsOpen(false)
        pausePolling()
        onShowSummaryModal()
    }

    const handleCloseSummaryModal = () => {
        resumePolling()
        onCloseSummaryModal()
    }

    const handleOpenFailedModal = (processType: string) => {
        setSelectedProcessType(processType)
        pausePolling()
        onCloseSummaryModal()
        onShowFailedModal()
    }

    const handleCloseFailedModal = () => {
        onCloseFailedModal()
        setSelectedProcessType(undefined)
        resumePolling()
    }

    useEffect(() => {
        return () => {
            if (!hideRunModal || !hideSummaryModal || !hideFailedModal) {
                resumePolling()
            }
        }
    }, [hideRunModal, hideSummaryModal, hideFailedModal, resumePolling])

    const handleDelete = () => {
        setIsOpen(false)
        confirm({
            title: i18n.t('Confirm delete'),
            message: (
                <span>
                    {i18n.t(
                        'Are you sure you want to delete the configuration '
                    )}
                    <b>{config.source.name}</b>?{' '}
                    {i18n.t('This action cannot be undone.')}
                </span>
            ),
            onConfirm: async () => {
                await deleteConfig(config)
            },
            confirmButtonText: i18n.t('Delete'),
            confirmButtonColor: 'destructive',
        })
    }

    return (
        <>
            {!hideRunModal && (
                <RunConfigForm
                    config={config}
                    hide={hideRunModal}
                    onClose={handleCloseRunModal}
                />
            )}
            {!hideSummaryModal && (
                <RunConfigSummaryModal
                    hide={hideSummaryModal}
                    onClose={handleCloseSummaryModal}
                    config={config}
                    onOpenFailedModal={handleOpenFailedModal}
                />
            )}
            {!hideFailedModal && (
                <FailedQueueModal
                    configId={config.id}
                    isOpen={!hideFailedModal}
                    onClose={handleCloseFailedModal}
                    processType={selectedProcessType}
                />
            )}

            <div ref={buttonRef}>
                <Button
                    small
                    secondary
                    icon={<IconMore24 />}
                    onClick={() => setIsOpen(!isOpen)}
                />
            </div>

            {isOpen && buttonRef && (
                <Popover
                    reference={buttonRef as RefObject<HTMLDivElement>}
                    arrow={false}
                    placement="bottom-start"
                    onClickOutside={() => setIsOpen(false)}
                >
                    <Menu>
                        <MenuItem
                            label={i18n.t('Edit configuration')}
                            icon={<IconEdit16 />}
                            onClick={handleEdit}
                        />
                        <MenuItem
                            label={i18n.t('Run migration')}
                            icon={<IconImportItems24 />}
                            onClick={handleRun}
                        />
                        <MenuItem
                            label={i18n.t('View overview')}
                            icon={<IconTerminalWindow16 />}
                            onClick={handleViewOverview}
                        />
                        <Divider />
                        <MenuItem
                            label={i18n.t('Delete connection')}
                            icon={<IconDelete16 />}
                            onClick={handleDelete}
                            destructive
                        />
                    </Menu>
                </Popover>
            )}
        </>
    )
}
