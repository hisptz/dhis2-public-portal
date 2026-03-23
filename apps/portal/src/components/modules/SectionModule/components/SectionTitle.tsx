'use client'

import { Section } from '@packages/shared/schemas'
import { Title } from '@mantine/core'

export function SectionTitle({ section }: { section: Section }) {
    return <Title order={3}>{section.title}</Title>
}
