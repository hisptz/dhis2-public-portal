import { Card } from '@dhis2/ui';
import React from 'react';
import i18n from "@dhis2/d2-i18n";

export interface Template {
    icon: React.ReactNode;
    description: string;
    title: string;
    disabled?: boolean;
    onClick?: () => void;
}

export interface TemplateCardProps {
    template: Template;
}

export default function TemplateCard({ template }: TemplateCardProps) {

    return (
        <div className="h-60 w-60 rounded">
            <button
                disabled={template.disabled}
                onClick={template.onClick}
                className={`
                    relative flex opacity-80 p-[1px] rounded w-full h-full items-stretch 
                    cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:opacity-40 
                    hover:opacity-100 active:opacity-100 focus:opacity-100
                    outline  outline-gray-400 hover:outline-[#2C6693]
                `}
            >
                <Card className="inline-flex flex-col justify-center items-center box-border rounded">
                    <div className="flex flex-col items-center justify-center h-[calc(100%-16px)] p-4 gap-8">
                        <div className="flex items-center justify-center ">
                            <div className="w-[50px] h-[50px] [&_svg]:w-[50px] [&_svg]:h-[50px]" style={{ color: "#2C6693" }}>
                                {template.icon}
                            </div>
                        </div>
                        <div className="flex flex-col items-center w-full gap-2 text-center">
                            <h4 className="m-0 text-gray-800 font-bold text-[16px] inline"> {i18n.t(template.title)}</h4>
                            <span className="text-gray-600 font-normal text-sm max-w-xs break-words">{i18n.t(template.description)}</span>
                        </div>
                    </div>
                </Card>
            </button>
        </div>
    );
}