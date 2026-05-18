import { StaticItemConfig, StaticModuleConfig } from '@packages/shared/schemas'
import { getAppConfigsFromNamespace } from '@/utils/config'
import { DatastoreNamespaces } from '@packages/shared/constants'
import { SimpleGrid } from '@mantine/core'
import { StaticItemCard } from '@/components/modules/StaticModule/components/StaticItemCard'

export async function StaticItemsList({
    config,
    moduleId,
}: {
    config: StaticModuleConfig
    moduleId: string
}) {
    const namespace = config.namespace
    const items = await getAppConfigsFromNamespace<StaticItemConfig>(
        namespace as DatastoreNamespaces
    )

    return (
        <SimpleGrid
            cols={{
                base: 1,
                xs: 2,
                sm: 2,
                md: 3,
                lg: 4,
                xl: 4,
            }}
            spacing="md"
        >
            {items.map((item) => (
                <StaticItemCard moduleId={moduleId} key={item.id} item={item} />
            ))}
        </SimpleGrid>
    )
}
