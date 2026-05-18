'use client'

import { Button } from '@mantine/core'
import { IconArrowLeft } from '@tabler/icons-react'
import Link from 'next/link'

export function BackButton({ href }: { href: string }) {
    return (
        <Button
            component={Link}
            href={href}
            variant="subtle"
            leftSection={<IconArrowLeft size={14} />}
        >
            Back
        </Button>
    )
}
