import { Container } from '@mantine/core'

export default function PreviewLayout({ children }: LayoutProps<'/preview'>) {
    return (
        <Container
            fluid
            p="md"
            style={{
                background: '#F9F9FA',
                position: 'relative',
            }}
        >
            {children}
        </Container>
    )
}
