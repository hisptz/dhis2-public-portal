import React from "react";
import i18n from "@dhis2/d2-i18n";
import { ProcessStatus } from "../types";
import { MetricCard } from "./MetricCard";

interface ProcessSectionProps {
    title: string;
    icon: string;
    process: ProcessStatus;
    onFailedClick?: () => void;
}

export function ProcessSection({ 
    title, 
    icon, 
    process, 
    onFailedClick 
}: ProcessSectionProps) {
     const calculateBreakdown = (process: ProcessStatus) => {
        if (process.queued !== undefined && process.processing !== undefined && process.failed !== undefined) {
             return {
                queued: process.queued,
                processing: process.processing,
                failed: process.failed
            };
        }
        
         let queued = 0;
        let processing = 0;
        let failed = 0;

        if (process.queueType === 'failed') {
             failed = process.messageCount;
        } else {
             if (process.consumerCount > 0 && process.messageCount > 0) {
                 processing = Math.min(process.consumerCount, process.messageCount);
                queued = Math.max(0, process.messageCount - processing);
            } else {
                 queued = process.messageCount;
            }
        }

        return { queued, processing, failed };
    };

    const breakdown = calculateBreakdown(process);

    return (
        <div className="flex flex-col gap-3">
            <h4
                className="m-0 text-base font-semibold flex items-center gap-2"
                style={{ color: 'var(--colors-grey800)' }}
            >
                <span>{icon}</span>
                {title}
            </h4>
            <div
                className="grid gap-3"
                style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))' }}
            >
                <MetricCard 
                    title={i18n.t('Queued')}
                    value={breakdown.queued}
                    color="var(--colors-yellow700)"
                    bgColor="var(--colors-yellow050)"
                />
                <MetricCard 
                    title={i18n.t('Processing')}
                    value={breakdown.processing}
                    color="var(--colors-blue700)"
                    bgColor="var(--colors-blue050)"
                />
                <MetricCard 
                    title={i18n.t('Failed')}
                    value={breakdown.failed}
                    color="var(--colors-red700)"
                    bgColor="var(--colors-red050)"
                    onClick={breakdown.failed > 0 ? onFailedClick : undefined}
                />
            </div>
        </div>
    );
}
