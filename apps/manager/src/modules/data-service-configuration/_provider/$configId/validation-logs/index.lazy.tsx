import { createLazyFileRoute } from '@tanstack/react-router'
import { ModuleContainer } from '@/shared/components/ModuleContainer'
import { ValidationLogsPage } from '@/shared/components/DataConfiguration/components/Validationlogs/ValidationLogsPage'

export const Route = createLazyFileRoute(
    '/data-service-configuration/_provider/$configId/validation-logs/'
)({
    component: RouteComponent,
})

function RouteComponent() {
    const { configId } = Route.useParams()

    return (
        <ModuleContainer title="">
            <ValidationLogsPage configId={configId} />
        </ModuleContainer>
    )
}
