import i18n from '@dhis2/d2-i18n'
import { useItemById } from '../../hooks/data'
import { useNavigate, useParams } from '@tanstack/react-router'
import { StaticItemConfig, staticItemSchema } from '@packages/shared/schemas'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FullLoader } from '../../../FullLoader'
import { Button, IconArrowLeft16 } from '@dhis2/ui'
import { PageHeader } from '../../../PageHeader'
import { ItemActions } from '../ItemActions'
import { StaticForm } from './StaticForm'

export function StaticConfig() {
    const { itemId } = useParams({
        from: '/modules/_provider/$moduleId/_formProvider/edit/static/$itemId/',
    })
    const { item, refetch } = useItemById(itemId)
    const form = useForm<StaticItemConfig>({
        resolver: zodResolver(staticItemSchema),
        defaultValues: async () => {
            const { item } = (await refetch()) as { item: StaticItemConfig }
            return item
        },
    })
    const navigate = useNavigate({
        from: '/modules/$moduleId/edit/static/$itemId',
    })

    if (form.formState.isLoading)
        return (
            <div className="w-full h-full flex items-center justify-center">
                <FullLoader />
            </div>
        )

    return (
        <FormProvider {...form}>
            <div>
                <Button
                    onClick={() => navigate({ to: '/modules/$moduleId/edit' })}
                    icon={<IconArrowLeft16 />}
                >
                    {i18n.t('Back')}
                </Button>
                <PageHeader
                    title={item?.title ?? ''}
                    actions={<ItemActions />}
                />
                <StaticForm />
            </div>
        </FormProvider>
    )
}
