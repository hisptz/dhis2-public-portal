import { DownloadTaskDetails } from '@/shared/components/DataConfiguration/components/DownloadTaskDetails'
import { UploadTaskDetails } from '@/shared/components/DataConfiguration/components/UploadTaskDetails'
import {
    Button,
    IconInfo16,
    Modal,
    ModalActions,
    ModalContent,
    ModalTitle,
} from '@dhis2/ui'
import i18n from '@dhis2/d2-i18n'
import { useBoolean } from 'usehooks-ts'
import {
    MetadataDownloadJob,
    DataDownloadJob,
    MetadataUploadJob,
    DataUploadJob,
} from './RunList/hooks/data'

function TaskDetailsModal({
    task,
    type,
    runType,
    runID,
    open,
    onClose,
}: {
    task:
        | MetadataDownloadJob
        | DataDownloadJob
        | MetadataUploadJob
        | DataUploadJob
    type: 'download' | 'upload'
    runID: string
    runType: 'metadata' | 'data'
    open: boolean
    onClose: () => void
}) {
    return (
        <Modal position="middle" hide={!open} onClose={onClose}>
            <ModalTitle>{i18n.t('Task details')}</ModalTitle>
            <ModalContent>
                {type === 'download' && (
                    <DownloadTaskDetails
                        task={task as MetadataDownloadJob | DataDownloadJob}
                        runType={runType}
                        runID={runID}
                    />
                )}
                {type === 'upload' && (
                    <UploadTaskDetails
                        task={task as MetadataUploadJob | DataUploadJob}
                        runType={runType}
                        runID={runID}
                    />
                )}
            </ModalContent>
            <ModalActions>
                <Button onClick={onClose}>{i18n.t('Dismiss')}</Button>
            </ModalActions>
        </Modal>
    )
}

export function TaskDetails({
    task,
    runID,
    runType,
    type,
}: {
    task:
        | MetadataDownloadJob
        | DataDownloadJob
        | MetadataUploadJob
        | DataUploadJob
    runType: 'metadata' | 'data'
    runID: string
    type: 'download' | 'upload'
}) {
    const { value: open, toggle } = useBoolean(false)

    return (
        <>
            <Button onClick={toggle} small icon={<IconInfo16 />} />
            {open && (
                <TaskDetailsModal
                    task={task}
                    type={type}
                    runID={runID}
                    runType={runType}
                    open={open}
                    onClose={toggle}
                />
            )}
        </>
    )
}
