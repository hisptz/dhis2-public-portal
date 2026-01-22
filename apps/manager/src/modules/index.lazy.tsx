import { createLazyFileRoute } from '@tanstack/react-router'

import { WelcomePage } from '@/shared/components/WelcomePage'

export const Route = createLazyFileRoute('/')({
    component: RouteComponent,
})

function RouteComponent() {
    return <WelcomePage />
}
