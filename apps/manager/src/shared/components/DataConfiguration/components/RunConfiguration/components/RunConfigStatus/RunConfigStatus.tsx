import React from "react";
import { useDataConfigRunStatus } from "./hooks/status";
import { CircularLoader, Tag } from "@dhis2/ui";
import { DataServiceRunStatus } from "@packages/shared/schemas";
import i18n from "@dhis2/d2-i18n";

export function StatusIndicator({
	status,
}: {
	status: DataServiceRunStatus | null;
}) {
	switch (status) {
		case null:
			return <Tag>{i18n.t("N/A")}</Tag>;
		case DataServiceRunStatus.IDLE:
			return <Tag neutral>{i18n.t("Idle")}</Tag>;
		case DataServiceRunStatus.RUNNING:
			return <Tag neutral>{i18n.t("Running")}</Tag>;
		case DataServiceRunStatus.NOT_STARTED:
			return <Tag>{i18n.t("Not started")}</Tag>;
		case DataServiceRunStatus.UNKNOWN:
			return <Tag negative>{i18n.t("Unknown")}</Tag>;
		case DataServiceRunStatus.COMPLETED:
			return <Tag positive>{i18n.t("Completed")}</Tag>;
	}
}

export function RunConfigStatus({ configId }: { configId: string }) {
	const { status, isLoading, isError, error, refetch, isRefetching } =
		useDataConfigRunStatus(configId);

	if (isLoading) {
		return <CircularLoader extrasmall />;
	}

	if (!status) {
		return <span>N/A</span>;
	}

	if (isError) {
		return <span>{error?.message ?? i18n.t("Unknown error")}</span>;
	}

	return (
		<div className="flex items-center gap-2">
			<StatusIndicator status={status} />
		</div>
	);
}
