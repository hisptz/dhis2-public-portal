import React from 'react'

type Props = {
    title: string
}

export function ConfigurationTitle({ title }: Props) {
    return (
        <div className="flex flex-col gap-2">
            <h4 className="text-lg font-bold m-0">{title}</h4>
        </div>
    )
}
