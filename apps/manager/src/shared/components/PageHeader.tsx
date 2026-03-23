import { Divider } from '@dhis2/ui'
import { ReactNode } from 'react'

export function PageHeader({
    title,
    actions,
    subTitle,
}: {
    title: string
    actions?: ReactNode
    subTitle?: ReactNode
}) {
    return (
        <div className="flex flex-col">
            <div className="flex items-center justify-between">
                <div className="flex flex-row justify-start items-center gap-4">
                    <h1 className="text-3xl font-bold">{title}</h1>
                    {subTitle}
                </div>
                {actions ?? null}
            </div>
            <Divider />
        </div>
    )
}
