import React from 'react'

type Props = {
    title: string
    value?: string
    children?: React.ReactNode
}

export function ConfigurationDetails({ title, value, children }: Props) {
    return (
        <div
            style={{
                gridTemplateColumns: 'minmax(200px, auto) 1fr',
            }}
            className="grid grid-cols-2 gap-2 items-center"
        >
            <div className="text-sm">
                <span className="text-gray-600 font-medium">{title}: </span>
            </div>
            {children && <div className="flex-1 my-1">{children}</div>}
            {value && <div className="text-sm">{value}</div>}
        </div>
    )
}
