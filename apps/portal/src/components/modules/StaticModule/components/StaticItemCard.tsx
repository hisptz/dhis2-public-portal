import { StaticItemConfig } from '@packages/shared/schemas'
import {
    Button,
    Card,
    Group,
    Image,
    Text,
    ThemeIcon,
    Title,
} from '@mantine/core'
import NextImage from 'next/image'
import Link from 'next/link'
import { getServerImageUrl } from '@/utils/server/images'

function DefaultStaticItemIcon() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-11 h-11"
        >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <line x1="10" y1="9" x2="8" y2="9" />
        </svg>
    )
}

export function StaticItemCard({
    item,
    moduleId,
}: {
    item: StaticItemConfig
    moduleId: string
}) {
    const iconUrl = item.icon ? getServerImageUrl(item.icon) : undefined
    const href = `${moduleId}/details/${item.id}`

    return (
        <div className="relative pt-11">
            <Link href={href} className="block">
                <Card
                    radius="md"
                    padding={0}
                    shadow="xs"
                    className="relative aspect-square w-full flex flex-col border border-transparent hover:border-gray-300 transition-colors duration-200"
                    style={{ overflow: 'visible' }}
                >
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                        <ThemeIcon
                            size={100}
                            radius="xl"
                            p={8}
                            variant="filled"
                            className="shadow-md"
                        >
                            {iconUrl ? (
                                <Image
                                    alt={item.icon!}
                                    width={100}
                                    height={100}
                                    component={NextImage}
                                    src={iconUrl}
                                />
                            ) : (
                                <DefaultStaticItemIcon />
                            )}
                        </ThemeIcon>
                    </div>

                    <div className="flex flex-col h-full p-4 pt-12 overflow-hidden">
                        <Title order={4}>{item.title}</Title>
                        <Text
                            ta="justify"
                            size="sm"
                            c="dimmed"
                            lineClamp={12}
                            className="flex-1 mt-1 min-h-0"
                        >
                            {item.shortDescription}
                        </Text>
                        <Group
                            justify="flex-end"
                            className="mt-auto pt-1 shrink-0"
                        >
                            <Button component="span" variant="subtle" size="sm">
                                Learn more
                            </Button>
                        </Group>
                    </div>
                </Card>
            </Link>
        </div>
    )
}
