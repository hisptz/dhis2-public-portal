import React from "react";
import i18n from "@dhis2/d2-i18n";
import { MetricCard } from "./MetricCard";

interface ProcessStatus {
    queued: number;     
    processing: number; 
    failed: number;     
}
interface ProcessSectionProps {
    title: string;
    icon: string;
    process: ProcessStatus;
    processType?: string;
    onFailedClick?: (processType: string) => void;
}

export function ProcessSection({ title, icon, process, processType, onFailedClick }: ProcessSectionProps) {
    return (
        <div className="flex flex-col gap-3">
            <h4 className="m-0 text-base font-semibold flex items-center gap-2">
                <span>{icon}</span>
                {title}
            </h4>

            <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))' }}>
                <MetricCard 
                    title="Queued"
                    value={process.queued}
                    color="var(--colors-yellow700)"
                    bgColor="var(--colors-yellow050)"
                />
                <MetricCard 
                    title="Processing"
                    value={process.processing}
                    color="var(--colors-blue700)"
                    bgColor="var(--colors-blue050)"
                />
                <MetricCard 
                    title="Failed"
                    value={process.failed}
                    color="var(--colors-red700)"
                    bgColor="var(--colors-red050)"
                    onClick={process.failed > 0 && onFailedClick && processType ? 
                        () => onFailedClick(processType) : 
                        undefined
                    }
                />
            </div>
        </div>
    );
}
