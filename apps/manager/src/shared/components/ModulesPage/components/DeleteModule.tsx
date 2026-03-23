import { useState } from 'react'
import {
    Button,
    ButtonStrip,
    Modal,
    ModalActions,
    ModalContent,
    ModalTitle,
} from '@dhis2/ui'
import i18n from '@dhis2/d2-i18n'
import { FetchError, useAlert, useDataEngine } from '@dhis2/app-runtime'
import { useNavigate } from '@tanstack/react-router'
import { DatastoreNamespaces } from '@packages/shared/constants'
import { useModule } from '../providers/ModuleProvider'
import { useRefreshModules } from '../providers/ModulesProvider'
import {
    AppModule,
    ModuleType,
    StaticModuleConfig,
} from '@packages/shared/schemas'

export function DeleteModule() {
    const [showDialog, setShowDialog] = useState(false)
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate({
        from: '/modules/$moduleId/edit',
    })
    const module = useModule() as AppModule
    const engine = useDataEngine()
    const { show } = useAlert(
        ({ message }) => message,
        ({ type }) => ({ ...type, duration: 3000 })
    )
    const refreshModules = useRefreshModules()

    const handleDelete = () => {
        setShowDialog(true)
    }

    const onConfirm = async () => {
        setLoading(true)
        try {
            await engine.mutate({
                type: 'delete',
                resource: `dataStore/${DatastoreNamespaces.MODULES}`,
                id: module.id,
            })
            if (
                module.type === ModuleType.STATIC &&
                (module?.config as StaticModuleConfig)?.namespace
            ) {
                const namespace = (module?.config as StaticModuleConfig)
                    ?.namespace
                await engine.mutate({
                    type: 'delete',
                    resource: 'dataStore',
                    id: namespace,
                })
            }
            await refreshModules()
            show({
                message: i18n.t('Module deleted successfully'),
                type: { success: true },
            })
            navigate({ to: '/modules' })
        } catch (e) {
            const error = e as Error | FetchError
            show({
                message: `${i18n.t('Could not delete module')}: ${error.message}`,
                type: { critical: true },
            })
        } finally {
            setLoading(false)
            setShowDialog(false)
        }
    }

    const onCancel = () => {
        setShowDialog(false)
    }

    return (
        <>
            <Button loading={loading} onClick={handleDelete} secondary>
                {loading ? i18n.t('Deleting...') : i18n.t('Delete module')}
            </Button>
            {showDialog && (
                <Modal position="middle" onClose={onCancel}>
                    <ModalTitle>{i18n.t('Delete module')}</ModalTitle>
                    <ModalContent>
                        <span>
                            {i18n.t(
                                'Are you sure you want to delete the module '
                            )}
                            <b>{module?.label}</b>?{' '}
                            {i18n.t('This action is irreversible')}
                        </span>
                    </ModalContent>
                    <ModalActions>
                        <ButtonStrip>
                            <Button onClick={onCancel}>
                                {i18n.t('Cancel')}
                            </Button>
                            <Button
                                destructive
                                onClick={onConfirm}
                                loading={loading}
                            >
                                {i18n.t('Delete')}
                            </Button>
                        </ButtonStrip>
                    </ModalActions>
                </Modal>
            )}
        </>
    )
}
