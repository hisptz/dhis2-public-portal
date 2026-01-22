import { version } from '../../package.json'
import React from 'react'
import { Badge, Center } from '@mantine/core'

export function VersionDisplay() {
    return (
        <Center>
            <Badge color="gray" radius="xs" variant="light">
                <b>v{version}</b>
            </Badge>
        </Center>
    )
}
