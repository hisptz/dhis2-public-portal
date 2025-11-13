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
			return <Tag neutral>{i18n.t("N/A")}</Tag>;
		case DataServiceRunStatus.IDLE:
			return <Tag neutral>{i18n.t("Idle")}</Tag>;
		case DataServiceRunStatus.RUNNING:
			return <Tag positive>{i18n.t("Running")}</Tag>;
		case DataServiceRunStatus.QUEUED:
			return <Tag>{i18n.t("Queued")}</Tag>;
		case DataServiceRunStatus.NOT_STARTED:
			return <Tag neutral>{i18n.t("Not started")}</Tag>;
		case DataServiceRunStatus.UNKNOWN:
			return <Tag negative>{i18n.t("Unknown")}</Tag>;
		case DataServiceRunStatus.COMPLETED:
			return <Tag positive>{i18n.t("Completed")}</Tag>;
		case DataServiceRunStatus.FAILED:
			return <Tag neutral>{i18n.t("Idle")}</Tag>;
	}
}

export function RunConfigStatus({ configId }: { configId: string }) {
	const { status, data, isLoading, isError, error } =
		useDataConfigRunStatus(configId);

	console.log(`RunConfigStatus for ${configId}:`, { status, data, isLoading, isError, error });

	if (isLoading) {
		return (
			<div className="flex items-center gap-2">
				<CircularLoader small />
 			</div>
		);
	}

	if (isError) {
		console.error(`Status error for ${configId}:`, error);
		return (
			<div className="flex items-center gap-2">
				<Tag negative>{i18n.t("Error")}</Tag>
				<span className="text-sm text-red-600">
					{(error as any)?.message ?? i18n.t("Unknown error")}
				</span>
			</div>
		);
	}

	if (!status) {
		return (
			<div className="flex items-center gap-2">
				<Tag neutral>N/A</Tag>
			</div>
		);
	}

	return (
		<div className="flex items-center gap-2">
			<StatusIndicator status={status} />
		</div>
	);
}
