import React, { useState } from "react";
import { useRunConfigSummary } from "../hooks/summary";
import {
    DataServiceConfig,
} from "@packages/shared/schemas";
import {
    CircularLoader,
    SegmentedControl,
    Tag,
} from "@dhis2/ui";
import i18n from "@dhis2/d2-i18n";
import { useProcessMonitoring } from "../hooks/process-monitoring";
import { FailedQueueModal } from "./FailedQueueModal";
import { ProcessSection } from "./ProcessSection";

export function RunConfigSummaryDetails({
    config,
}: {
    config: DataServiceConfig;
}) {
    const [activeTab, setActiveTab] = useState<"metadata" | "data">("metadata");
    const [showFailedModal, setShowFailedModal] = useState(false);

    const { data: processData, isLoading, isError, error } = useProcessMonitoring(config.id);
    const { summaries } = useRunConfigSummary(config.id);

    if (isError) {
        return (
            <div style={{
                padding: '24px',
                background: 'var(--colors-red050)',
                border: '1px solid var(--colors-red200)',
                borderRadius: '8px',
                color: 'var(--colors-red700)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>!</span>
                    <strong>{i18n.t('Error loading process data')}</strong>
                </div>
                <div style={{ marginTop: '8px', fontSize: '14px' }}>
                    {(error as any)?.message ?? i18n.t("Unknown error occurred")}
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}>
                <CircularLoader />
            </div>
        );
    }
   
    console.log('Metadata download:', processData?.metadata.download);
    console.log('Metadata upload:', processData?.metadata.upload);
    const handleFailedClick = () => {
        setShowFailedModal(true);
    };

    return (
        <div className="p-4" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="bg-white">
                <SegmentedControl
                    selected={activeTab}
                    onChange={({ value }) => setActiveTab(value as "metadata" | "data")}
                    options={[
                        { label: i18n.t("Metadata Migration"), value: "metadata" },
                        { label: i18n.t("Data Migration"), value: "data" },
                    ]}
                />
            </div>

            {activeTab === "metadata" && processData && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                    <ProcessSection
                        title={i18n.t('Download Process')}
                        icon="↓"
                        process={processData.metadata.download}
                        onFailedClick={handleFailedClick}
                    />

                    <ProcessSection
                        title={i18n.t('Upload Process')}
                        icon="↑"
                        process={processData.metadata.upload}
                        onFailedClick={handleFailedClick}
                    />
                </div>
            )}

            {activeTab === "data" && processData && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                    <ProcessSection
                        title={i18n.t('Download Process')}
                        icon="↓"
                        process={processData.data.download}
                        onFailedClick={handleFailedClick}
                    />

                    <ProcessSection
                        title={i18n.t('Upload Process')}
                        icon="↑"
                        process={processData.data.upload}
                        onFailedClick={handleFailedClick}
                    />
                </div>
            )}

            <FailedQueueModal
                configId={config.id}
                isOpen={showFailedModal}
                onClose={() => setShowFailedModal(false)}
            />
        </div>
    );
}