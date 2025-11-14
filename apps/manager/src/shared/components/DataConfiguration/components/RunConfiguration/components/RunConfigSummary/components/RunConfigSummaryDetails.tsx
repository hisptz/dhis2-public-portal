import React, { useState } from "react";
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
    const [activeTab, setActiveTab] = useState<"metadata" | "data" | "deletion">("metadata");
    const [showFailedModal, setShowFailedModal] = useState(false);
    const [selectedProcessType, setSelectedProcessType] = useState<string | undefined>(undefined);

    const { data: processData, isLoading, isError, error } = useProcessMonitoring(config.id);

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
 
    const handleFailedClick = (processType: string) => {
        setSelectedProcessType(processType);
        setShowFailedModal(true);
    };

    const handleCloseModal = () => {
        setShowFailedModal(false);
        setSelectedProcessType(undefined);
    };

    return (
        <div className="p-4" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="bg-white">
                <SegmentedControl
                    selected={activeTab}
                    onChange={({ value }) => setActiveTab(value as "metadata" | "data" | "deletion")}
                    options={[
                        { label: i18n.t("Metadata Migration"), value: "metadata" },
                        { label: i18n.t("Data Migration"), value: "data" },
                        { label: i18n.t("Data Deletion"), value: "deletion" },
                    ]}
                />
            </div>

            {activeTab === "metadata" && processData && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                    <ProcessSection
                        title={i18n.t('Download Process')}
                        icon="↓"
                        process={processData.metadataDownload}
                        processType="Metadata Download"
                        onFailedClick={handleFailedClick}
                    />

                    <ProcessSection
                        title={i18n.t('Upload Process')}
                        icon="↑"
                        process={processData.metadataUpload}
                        processType="Metadata Upload"
                        onFailedClick={handleFailedClick}
                    />
                </div>
            )}

            {activeTab === "data" && processData && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                    <ProcessSection
                        title={i18n.t('Download Process')}
                        icon="↓"
                        process={processData.dataDownload}
                        processType="Data Download"
                        onFailedClick={handleFailedClick}
                    />

                    <ProcessSection
                        title={i18n.t('Upload Process')}
                        icon="↑"
                        process={processData.dataUpload}
                        processType="Data Upload"
                        onFailedClick={handleFailedClick}
                    />
                </div>
            )}

            {activeTab === "deletion" && processData && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                    <ProcessSection
                        title={i18n.t('Data Deletion Process')}
                        icon="↑"
                        process={processData.dataDeletion}
                        processType="Data Delete"
                        onFailedClick={handleFailedClick}
                    />
                </div>
            )}

            <FailedQueueModal
                configId={config.id}
                isOpen={showFailedModal}
                onClose={handleCloseModal}
                processType={selectedProcessType}
            />
        </div>
    );
}