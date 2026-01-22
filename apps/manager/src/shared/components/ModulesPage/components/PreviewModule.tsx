import React from 'react'
import { Button, IconLaunch16 } from '@dhis2/ui'
import i18n from '@dhis2/d2-i18n'
import { useParams } from '@tanstack/react-router'
import { useAppMetadataConfig } from '../../MetadataConfigProvider'

export function PreviewModule() {
    const { moduleId } = useParams({
        from: '/modules/_provider/$moduleId/_formProvider/edit/',
    })
    const config = useAppMetadataConfig()
    const url = `${config.applicationURL}/preview/modules/${moduleId}`

    const onPreview = () => {
        document.open(url, '_blank', 'noopener=true; noreferrer=true')
    }

    return (
        <>
            <Button onClick={onPreview} icon={<IconLaunch16 />}>
                {i18n.t('Preview module')}
            </Button>
        </>
    )
}
